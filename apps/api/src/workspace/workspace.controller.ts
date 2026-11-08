import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  acceptInvitationRequestSchema,
  createServiceAccountRequestSchema,
  createWorkspaceRequestSchema,
  inviteMemberRequestSchema,
  updateMemberRoleRequestSchema,
  workspacePreferenceRequestSchema,
} from '@mohtavayab/contracts';
import type { Request } from 'express';
import { AuthConfig } from '../auth/auth.config.js';
import { AuthService } from '../auth/auth.service.js';
import { CryptoService } from '../auth/crypto.service.js';
import { WorkspaceService } from './workspace.service.js';

type Parser<T> = { parse: (input: unknown) => T };

@Controller('workspaces')
export class WorkspaceController {
  constructor(
    private readonly workspaces: WorkspaceService,
    private readonly auth: AuthService,
    private readonly authConfig: AuthConfig,
    private readonly crypto: CryptoService,
  ) {}

  @Post()
  async create(@Body() body: unknown, @Req() request: Request) {
    this.assertCsrf(request);
    const identity = await this.identity(request);
    return this.workspaces.create(this.parse(createWorkspaceRequestSchema, body), identity.user);
  }

  @Get()
  async list(@Req() request: Request) {
    const identity = await this.identity(request);
    return { workspaces: this.workspaces.listForUser(identity.user.id) };
  }

  @Get('preferences')
  async preferences(@Req() request: Request) {
    const identity = await this.identity(request);
    return this.workspaces.getPreference(identity.user.id);
  }

  @Patch('preferences')
  async updatePreferences(@Body() body: unknown, @Req() request: Request) {
    this.assertCsrf(request);
    const identity = await this.identity(request);
    return this.workspaces.updatePreference(
      identity.user.id,
      this.parse(workspacePreferenceRequestSchema, body),
    );
  }

  @Post('invitations/accept')
  async accept(@Body() body: unknown, @Req() request: Request) {
    this.assertCsrf(request);
    const identity = await this.identity(request);
    const input = this.parse(acceptInvitationRequestSchema, body);
    return this.workspaces.acceptInvitation(input.token, identity.user);
  }

  @Get(':workspaceId')
  async summary(@Param('workspaceId') workspaceId: string, @Req() request: Request) {
    const identity = await this.identity(request);
    return this.workspaces.summary(workspaceId, identity.user.id);
  }

  @Get(':workspaceId/members')
  async members(@Param('workspaceId') workspaceId: string, @Req() request: Request) {
    const identity = await this.identity(request);
    return { members: this.workspaces.listMembers(workspaceId, identity.user.id) };
  }

  @Patch(':workspaceId/members/:userId')
  async changeRole(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
    @Body() body: unknown,
    @Req() request: Request,
  ) {
    this.assertCsrf(request);
    const identity = await this.identity(request);
    const input = this.parse(updateMemberRoleRequestSchema, body);
    return this.workspaces.changeRole(workspaceId, identity.user.id, userId, input.role);
  }

  @Post(':workspaceId/invitations')
  async invite(
    @Param('workspaceId') workspaceId: string,
    @Body() body: unknown,
    @Req() request: Request,
  ) {
    this.assertCsrf(request);
    const identity = await this.identity(request);
    return this.workspaces.invite(
      workspaceId,
      identity.user.id,
      this.parse(inviteMemberRequestSchema, body),
    );
  }

  @Get(':workspaceId/invitations')
  async invitations(@Param('workspaceId') workspaceId: string, @Req() request: Request) {
    const identity = await this.identity(request);
    return { invitations: this.workspaces.listInvitations(workspaceId, identity.user.id) };
  }

  @Post(':workspaceId/service-accounts')
  async createServiceAccount(
    @Param('workspaceId') workspaceId: string,
    @Body() body: unknown,
    @Req() request: Request,
  ) {
    this.assertCsrf(request);
    const identity = await this.identity(request);
    return this.workspaces.createServiceAccount(
      workspaceId,
      identity.user.id,
      this.parse(createServiceAccountRequestSchema, body),
    );
  }

  @Get(':workspaceId/service-accounts')
  async serviceAccounts(@Param('workspaceId') workspaceId: string, @Req() request: Request) {
    const identity = await this.identity(request);
    return { service_accounts: this.workspaces.listServiceAccounts(workspaceId, identity.user.id) };
  }

  @Delete(':workspaceId/service-accounts/:accountId')
  async revokeServiceAccount(
    @Param('workspaceId') workspaceId: string,
    @Param('accountId') accountId: string,
    @Req() request: Request,
  ) {
    this.assertCsrf(request);
    const identity = await this.identity(request);
    return this.workspaces.revokeServiceAccount(workspaceId, identity.user.id, accountId);
  }

  private async identity(request: Request) {
    const accessToken = this.cookie(request, this.authConfig.accessCookieName);
    if (!accessToken) throw new UnauthorizedException('invalid_session');
    return this.auth.authenticate(accessToken);
  }

  private assertCsrf(request: Request): void {
    const cookie = this.cookie(request, 'mh_csrf');
    const header = request.get('x-csrf-token');
    if (!cookie || !header || !this.crypto.safeEqual(cookie, header))
      throw new BadRequestException('invalid_csrf');
  }

  private parse<T>(schema: Parser<T>, body: unknown): T {
    try {
      return schema.parse(body);
    } catch {
      throw new BadRequestException('validation_failed');
    }
  }

  private cookie(request: Request, name: string): string | undefined {
    for (const item of request.headers.cookie?.split(';') ?? []) {
      const separator = item.indexOf('=');
      if (separator >= 0 && item.slice(0, separator).trim() === name)
        return decodeURIComponent(item.slice(separator + 1).trim());
    }
    return undefined;
  }
}
