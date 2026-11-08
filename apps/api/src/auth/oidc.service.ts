import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import * as client from 'openid-client';
import { AuthStore } from './auth.store.js';
import type { OidcTransaction } from './auth.types.js';
import { CryptoService } from './crypto.service.js';

type OidcProvider = {
  issuer: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
};

@Injectable()
export class OidcService {
  private readonly configuration = new Map<string, Promise<client.Configuration>>();

  constructor(
    private readonly store: AuthStore,
    private readonly crypto: CryptoService,
  ) {}

  async start(provider: string, returnTo = '/dashboard'): Promise<URL> {
    const settings = this.settings(provider);
    const configuration = await this.configurationFor(provider, settings);
    const codeVerifier = client.randomPKCECodeVerifier();
    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
    const transaction: OidcTransaction = {
      state: this.crypto.randomToken(24),
      nonce: this.crypto.randomToken(24),
      codeVerifier,
      provider,
      returnTo: this.safeReturnTo(returnTo),
      expiresAt: new Date(Date.now() + 10 * 60_000),
    };
    this.store.oidcTransactions.set(transaction.state, transaction);
    return client.buildAuthorizationUrl(configuration, {
      redirect_uri: settings.redirectUri,
      scope: 'openid email profile',
      response_type: 'code',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: transaction.state,
      nonce: transaction.nonce,
    });
  }

  async finish(
    provider: string,
    currentUrl: URL,
  ): Promise<{
    subject: string;
    email?: string;
    name?: string;
    returnTo: string;
  }> {
    const state = currentUrl.searchParams.get('state') ?? '';
    const transaction = this.store.oidcTransactions.get(state);
    this.store.oidcTransactions.delete(state);
    if (
      !transaction ||
      transaction.provider !== provider ||
      transaction.expiresAt.getTime() <= Date.now()
    ) {
      throw new UnauthorizedException('oidc_failed');
    }
    const settings = this.settings(provider);
    const configuration = await this.configurationFor(provider, settings);
    const tokens = await client.authorizationCodeGrant(configuration, currentUrl, {
      expectedState: transaction.state,
      expectedNonce: transaction.nonce,
      pkceCodeVerifier: transaction.codeVerifier,
      idTokenExpected: true,
    });
    const claims = tokens.claims();
    if (!claims?.sub) throw new UnauthorizedException('oidc_failed');
    return {
      subject: claims.sub,
      ...(typeof claims.email === 'string' ? { email: claims.email } : {}),
      ...(typeof claims.name === 'string' ? { name: claims.name } : {}),
      returnTo: transaction.returnTo,
    };
  }

  private configurationFor(
    provider: string,
    settings: OidcProvider,
  ): Promise<client.Configuration> {
    const existing = this.configuration.get(provider);
    if (existing) return existing;
    const pending = client.discovery(
      new URL(settings.issuer),
      settings.clientId,
      { client_secret: settings.clientSecret, redirect_uris: [settings.redirectUri] },
      client.ClientSecretBasic(settings.clientSecret),
    );
    this.configuration.set(provider, pending);
    return pending;
  }

  private settings(provider: string): OidcProvider {
    if (!/^[a-z0-9_-]{2,32}$/.test(provider)) throw new UnauthorizedException('oidc_failed');
    const prefix = `OIDC_${provider.toUpperCase()}_`;
    const issuer = process.env[`${prefix}ISSUER`] ?? '';
    const clientId = process.env[`${prefix}CLIENT_ID`] ?? '';
    const clientSecret = process.env[`${prefix}CLIENT_SECRET`] ?? '';
    const redirectUri = process.env[`${prefix}REDIRECT_URI`] ?? '';
    if (!issuer || !clientId || !clientSecret || !redirectUri || clientId.startsWith('disabled-')) {
      throw new ServiceUnavailableException('oidc_provider_disabled');
    }
    return { issuer, clientId, clientSecret, redirectUri };
  }

  private safeReturnTo(value: string): string {
    return value.startsWith('/') && !value.startsWith('//') ? value.slice(0, 300) : '/dashboard';
  }
}
