import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Redirect,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  loginRequestSchema,
  mfaVerifyRequestSchema,
  passwordRecoveryConfirmSchema,
  passwordRecoveryRequestSchema,
  refreshRequestSchema,
  registerRequestSchema,
} from '@mohtavayab/contracts';
import QRCode from 'qrcode';
import type { Request, Response } from 'express';
import { AuthConfig } from './auth.config.js';
import { AuthService } from './auth.service.js';
import type { RequestSignals, SessionTokens } from './auth.types.js';
import { CryptoService } from './crypto.service.js';
import { OidcService } from './oidc.service.js';

type Parser<T> = { parse: (input: unknown) => T };

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: AuthConfig,
    private readonly crypto: CryptoService,
    private readonly oidc: OidcService,
  ) {}

  @Post('register')
  register(@Body() body: unknown) {
    return this.auth.register(this.parse(registerRequestSchema, body));
  }

  @Post('login')
  async login(
    @Body() body: unknown,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const input = this.parse(loginRequestSchema, body);
    const result = await this.auth.login(input, this.signals(request, input.device_id));
    if (result.status === 'mfa_required') {
      return {
        status: result.status,
        challenge_id: result.challengeId,
        expires_at: result.expiresAt.toISOString(),
      };
    }
    this.writeSessionCookies(response, result.tokens);
    return {
      status: 'authenticated',
      access_expires_at: result.tokens.accessExpiresAt.toISOString(),
    };
  }

  @Post('mfa/verify')
  async verifyMfa(@Body() body: unknown, @Res({ passthrough: true }) response: Response) {
    const input = this.parse(mfaVerifyRequestSchema, body);
    const tokens = await this.auth.verifyMfaChallenge(input.challenge_id, input.code);
    this.writeSessionCookies(response, tokens);
    return { status: 'authenticated', access_expires_at: tokens.accessExpiresAt.toISOString() };
  }

  @Post('refresh')
  async refresh(
    @Body() body: unknown,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.assertCsrf(request);
    const input = this.parse(refreshRequestSchema, body);
    const refreshToken = this.cookie(request, this.config.refreshCookieName);
    if (!refreshToken) throw new UnauthorizedException('invalid_session');
    const tokens = await this.auth.refresh(refreshToken, this.signals(request, input.device_id));
    this.writeSessionCookies(response, tokens);
    return { status: 'authenticated', access_expires_at: tokens.accessExpiresAt.toISOString() };
  }

  @Post('logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    this.assertCsrf(request);
    const identity = await this.identity(request);
    await this.auth.revokeSession(identity.user.id, identity.session.id);
    this.clearSessionCookies(response);
    return { status: 'signed_out' };
  }

  @Get('sessions')
  async sessions(@Req() request: Request) {
    const identity = await this.identity(request);
    return {
      sessions: this.auth.listSessions(identity.user.id, identity.session.id),
    };
  }

  @Delete('sessions/:sessionId')
  async revokeSession(@Param('sessionId') sessionId: string, @Req() request: Request) {
    this.assertCsrf(request);
    const identity = await this.identity(request);
    await this.auth.revokeSession(identity.user.id, sessionId);
    return { status: 'revoked' };
  }

  @Post('mfa/setup')
  async setupMfa(@Req() request: Request) {
    this.assertCsrf(request);
    const identity = await this.identity(request);
    const setup = this.auth.beginMfaSetup(identity.user.id);
    return {
      secret: setup.secret,
      qr_data_url: await QRCode.toDataURL(setup.uri, { margin: 1, width: 280 }),
      expires_in_seconds: 600,
    };
  }

  @Post('mfa/confirm')
  async confirmMfa(@Body() body: unknown, @Req() request: Request) {
    this.assertCsrf(request);
    const input = this.parse(mfaVerifyRequestSchema.pick({ code: true }), body);
    const identity = await this.identity(request);
    return this.auth.confirmMfaSetup(identity.user.id, input.code);
  }

  @Post('password/recovery/request')
  async requestRecovery(@Body() body: unknown) {
    const input = this.parse(passwordRecoveryRequestSchema, body);
    await this.auth.requestPasswordReset(input.email);
    return { accepted: true };
  }

  @Post('password/recovery/confirm')
  async confirmRecovery(@Body() body: unknown) {
    const input = this.parse(passwordRecoveryConfirmSchema, body);
    await this.auth.confirmPasswordReset(input.token, input.password);
    return { status: 'password_updated' };
  }

  @Get('oidc/:provider/start')
  @Redirect()
  async startOidc(
    @Param('provider') provider: string,
    @Query('return_to') returnTo?: string,
  ): Promise<{ url: string; statusCode: number }> {
    const url = await this.oidc.start(provider, returnTo);
    return { url: url.toString(), statusCode: 302 };
  }

  @Get('oidc/:provider/callback')
  async finishOidc(
    @Param('provider') provider: string,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const origin = `${request.protocol}://${request.get('host') ?? 'localhost'}`;
    const currentUrl = new URL(request.originalUrl, origin);
    const result = await this.oidc.finish(provider, currentUrl);
    const deviceId = this.cookie(request, 'mh_device') ?? this.crypto.randomToken(18);
    const tokens = await this.auth.loginWithOidc({
      provider,
      subject: result.subject,
      ...(result.email ? { email: result.email } : {}),
      ...(result.name ? { name: result.name } : {}),
      signals: this.signals(request, deviceId),
    });
    this.writeSessionCookies(response, tokens);
    response.cookie('mh_device', deviceId, {
      httpOnly: false,
      secure: this.config.secureCookies,
      sameSite: 'lax',
      path: '/',
      maxAge: 365 * 24 * 60 * 60_000,
    });
    response.redirect(`/mohtavayab${result.returnTo}`);
  }

  private parse<T>(schema: Parser<T>, body: unknown): T {
    try {
      return schema.parse(body);
    } catch {
      throw new BadRequestException('validation_failed');
    }
  }

  private async identity(request: Request) {
    const accessToken = this.cookie(request, this.config.accessCookieName);
    if (!accessToken) throw new UnauthorizedException('invalid_session');
    return this.auth.authenticate(accessToken);
  }

  private signals(request: Request, deviceId: string): RequestSignals {
    return {
      ip: request.ip || request.socket.remoteAddress || 'unknown',
      userAgent: request.get('user-agent')?.slice(0, 512) || 'unknown',
      deviceId,
    };
  }

  private writeSessionCookies(response: Response, tokens: SessionTokens): void {
    const csrf = this.crypto.randomToken(24);
    const common = {
      secure: this.config.secureCookies,
      sameSite: 'lax' as const,
      path: '/',
    };
    response.cookie(this.config.accessCookieName, tokens.accessToken, {
      ...common,
      httpOnly: true,
      expires: tokens.accessExpiresAt,
    });
    response.cookie(this.config.refreshCookieName, tokens.refreshToken, {
      ...common,
      httpOnly: true,
      expires: tokens.refreshExpiresAt,
    });
    response.cookie('mh_csrf', csrf, {
      ...common,
      httpOnly: false,
      expires: tokens.refreshExpiresAt,
    });
  }

  private clearSessionCookies(response: Response): void {
    const options = { secure: this.config.secureCookies, sameSite: 'lax' as const, path: '/' };
    response.clearCookie(this.config.accessCookieName, options);
    response.clearCookie(this.config.refreshCookieName, options);
    response.clearCookie('mh_csrf', options);
  }

  private assertCsrf(request: Request): void {
    const cookie = this.cookie(request, 'mh_csrf');
    const header = request.get('x-csrf-token');
    if (!cookie || !header || !this.crypto.safeEqual(cookie, header)) {
      throw new UnauthorizedException('invalid_csrf');
    }
  }

  private cookie(request: Request, name: string): string | undefined {
    for (const item of request.headers.cookie?.split(';') ?? []) {
      const separator = item.indexOf('=');
      if (separator < 0) continue;
      if (item.slice(0, separator).trim() === name) {
        return decodeURIComponent(item.slice(separator + 1).trim());
      }
    }
    return undefined;
  }
}
