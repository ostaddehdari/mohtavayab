import { randomUUID } from 'node:crypto';
import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { LoginRequest, RegisterRequest } from '@mohtavayab/contracts';
import { AuthConfig } from './auth.config.js';
import { AuthStore } from './auth.store.js';
import type {
  Assurance,
  LoginResult,
  RequestSignals,
  SessionRecord,
  SessionTokens,
  UserRecord,
} from './auth.types.js';
import { CryptoService } from './crypto.service.js';
import { RiskPolicyService } from './risk-policy.service.js';

@Injectable()
export class AuthService {
  private readonly dummyPasswordHash: Promise<string>;

  constructor(
    private readonly config: AuthConfig,
    private readonly store: AuthStore,
    private readonly crypto: CryptoService,
    private readonly risk: RiskPolicyService,
  ) {
    this.dummyPasswordHash = this.crypto.hashPassword(this.crypto.randomToken());
  }

  async register(
    input: RegisterRequest,
  ): Promise<{ id: string; email: string; display_name: string }> {
    if (this.store.findUserByEmail(input.email)) throw new ConflictException('account_exists');
    const user: UserRecord = {
      id: randomUUID(),
      email: input.email,
      displayName: input.display_name,
      passwordHash: await this.crypto.hashPassword(input.password),
      status: 'active',
      createdAt: new Date(),
      failedLoginCount: 0,
    };
    this.store.users.set(user.id, user);
    this.store.userIdByEmail.set(user.email, user.id);
    this.audit('auth.user.registered', { user_id: user.id });
    return { id: user.id, email: user.email, display_name: user.displayName };
  }

  async login(input: LoginRequest, signals: RequestSignals): Promise<LoginResult> {
    if (!this.risk.assertLoginAllowed(input.email, signals.ip)) {
      this.audit('auth.login.rate_limited', { email_hash: this.crypto.tokenHash(input.email) });
      throw new HttpException('rate_limited', HttpStatus.TOO_MANY_REQUESTS);
    }
    const user = this.store.findUserByEmail(input.email);
    const validPassword = await this.crypto.verifyPassword(
      user?.passwordHash ?? (await this.dummyPasswordHash),
      input.password,
    );
    if (!user || !validPassword) {
      if (user) this.recordFailure(user);
      this.audit('auth.login.failed', { email_hash: this.crypto.tokenHash(input.email) });
      throw new UnauthorizedException('invalid_credentials');
    }
    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      throw new UnauthorizedException('account_locked');
    }
    user.failedLoginCount = 0;
    delete user.lockedUntil;
    this.risk.clearLoginAttempts(user.email, signals.ip);

    const userSessions = [...this.store.sessions.values()].filter(
      (session) => session.userId === user.id,
    );
    if (user.mfa && this.risk.requiresStepUp(signals, userSessions)) {
      const challengeId = randomUUID();
      const expiresAt = new Date(Date.now() + 5 * 60_000);
      this.store.challenges.set(challengeId, {
        id: challengeId,
        userId: user.id,
        deviceId: signals.deviceId,
        ip: signals.ip,
        userAgent: signals.userAgent,
        rememberDevice: input.remember_device,
        expiresAt,
        attempts: 0,
      });
      this.audit('auth.mfa.challenged', { user_id: user.id, challenge_id: challengeId });
      return { status: 'mfa_required', challengeId, expiresAt };
    }
    return { status: 'authenticated', tokens: await this.createSession(user, signals, 'password') };
  }

  async verifyMfaChallenge(challengeId: string, code: string): Promise<SessionTokens> {
    const challenge = this.store.challenges.get(challengeId);
    if (
      !challenge ||
      challenge.consumedAt ||
      challenge.expiresAt.getTime() <= Date.now() ||
      challenge.attempts >= 5
    ) {
      throw new UnauthorizedException('invalid_mfa');
    }
    challenge.attempts += 1;
    const user = this.store.users.get(challenge.userId);
    if (!user?.mfa) throw new UnauthorizedException('invalid_mfa');
    const valid = /^\d{6}$/.test(code)
      ? this.crypto.verifyTotp(this.crypto.decryptSecret(user.mfa.encryptedSecret), code)
      : await this.consumeRecoveryCode(user, code);
    if (!valid) {
      this.audit('auth.mfa.failed', { user_id: user.id, challenge_id: challengeId });
      throw new UnauthorizedException('invalid_mfa');
    }
    challenge.consumedAt = new Date();
    return this.createSession(
      user,
      { ip: challenge.ip, userAgent: challenge.userAgent, deviceId: challenge.deviceId },
      'mfa',
    );
  }

  beginMfaSetup(userId: string): { secret: string; uri: string } {
    const user = this.requireUser(userId);
    const setup = this.crypto.createTotpSecret(user.email);
    user.pendingMfa = {
      encryptedSecret: this.crypto.encryptSecret(setup.base32),
      expiresAt: new Date(Date.now() + 10 * 60_000),
    };
    return { secret: setup.base32, uri: setup.uri };
  }

  async confirmMfaSetup(userId: string, code: string): Promise<{ recovery_codes: string[] }> {
    const user = this.requireUser(userId);
    const pending = user.pendingMfa;
    if (!pending || pending.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('invalid_mfa');
    }
    const secret = this.crypto.decryptSecret(pending.encryptedSecret);
    if (!this.crypto.verifyTotp(secret, code)) throw new UnauthorizedException('invalid_mfa');
    const recoveryCodes = Array.from({ length: 10 }, () => this.crypto.randomRecoveryCode());
    const recoveryCodeHashes: string[] = [];
    for (const recoveryCode of recoveryCodes) {
      recoveryCodeHashes.push(await this.crypto.hashRecoveryCode(recoveryCode));
    }
    user.mfa = {
      encryptedSecret: pending.encryptedSecret,
      recoveryCodeHashes,
      enabledAt: new Date(),
    };
    delete user.pendingMfa;
    this.store.revokeUserSessions(user.id, 'mfa_enabled');
    this.audit('auth.mfa.enabled', { user_id: user.id });
    return { recovery_codes: recoveryCodes };
  }

  async refresh(refreshToken: string, signals: RequestSignals): Promise<SessionTokens> {
    const presentedHash = this.crypto.tokenHash(refreshToken);
    const active = [...this.store.sessions.values()].find((session) =>
      this.crypto.safeEqual(session.refreshHash, presentedHash),
    );
    if (!active) {
      const reused = [...this.store.sessions.values()].find((session) =>
        session.previousRefreshHashes.some((hash) => this.crypto.safeEqual(hash, presentedHash)),
      );
      if (reused) {
        this.store.revokeFamily(reused.familyId, 'refresh_reuse_detected');
        this.audit('auth.refresh.reuse_detected', { family_id: reused.familyId });
        throw new UnauthorizedException('refresh_reuse_detected');
      }
      throw new UnauthorizedException('invalid_session');
    }
    if (active.revokedAt || active.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('invalid_session');
    }
    if (active.deviceIdHash !== this.risk.deviceIdHash(signals.deviceId)) {
      this.store.revokeFamily(active.familyId, 'device_binding_failed');
      throw new UnauthorizedException('invalid_session');
    }
    active.previousRefreshHashes.push(active.refreshHash);
    active.previousRefreshHashes = active.previousRefreshHashes.slice(-3);
    const nextRefresh = this.crypto.randomToken();
    active.refreshHash = this.crypto.tokenHash(nextRefresh);
    active.ipPrefixHash = this.risk.ipPrefixHash(signals.ip);
    active.userAgentHash = this.risk.userAgentHash(signals.userAgent);
    active.lastSeenAt = new Date();
    const access = await this.crypto.signAccessToken({
      userId: active.userId,
      sessionId: active.id,
      assurance: active.assurance,
    });
    return {
      accessToken: access.token,
      refreshToken: nextRefresh,
      accessExpiresAt: access.expiresAt,
      refreshExpiresAt: active.expiresAt,
      sessionId: active.id,
    };
  }

  async authenticate(accessToken: string): Promise<{ user: UserRecord; session: SessionRecord }> {
    try {
      const claims = await this.crypto.verifyAccessToken(accessToken);
      const session = this.store.sessions.get(claims.sid);
      const user = this.store.users.get(claims.sub);
      if (!session || !user || session.revokedAt || session.expiresAt.getTime() <= Date.now()) {
        throw new Error('inactive');
      }
      return { user, session };
    } catch {
      throw new UnauthorizedException('invalid_session');
    }
  }

  listSessions(
    userId: string,
    currentSessionId: string,
  ): Array<{
    id: string;
    created_at: string;
    last_seen_at: string;
    expires_at: string;
    device_label: string;
    current: boolean;
    assurance: Assurance;
  }> {
    return [...this.store.sessions.values()]
      .filter((session) => session.userId === userId && !session.revokedAt)
      .map((session) => ({
        id: session.id,
        created_at: session.createdAt.toISOString(),
        last_seen_at: session.lastSeenAt.toISOString(),
        expires_at: session.expiresAt.toISOString(),
        device_label: session.deviceLabel,
        current: session.id === currentSessionId,
        assurance: session.assurance,
      }));
  }

  revokeSession(userId: string, sessionId: string): void {
    const session = this.store.sessions.get(sessionId);
    if (session?.userId === userId && !session.revokedAt) {
      session.revokedAt = new Date();
      session.revokeReason = 'user_logout';
      this.audit('auth.session.revoked', { user_id: userId, session_id: sessionId });
    }
  }

  requestPasswordReset(email: string): { accepted: true; deliveryToken?: string } {
    const user = this.store.findUserByEmail(email);
    if (!user) return { accepted: true };
    const token = this.crypto.randomToken();
    const id = randomUUID();
    this.store.resets.set(id, {
      id,
      userId: user.id,
      tokenHash: this.crypto.tokenHash(token),
      expiresAt: new Date(Date.now() + 15 * 60_000),
    });
    this.audit('auth.recovery.requested', { user_id: user.id });
    return { accepted: true, deliveryToken: token };
  }

  async confirmPasswordReset(token: string, password: string): Promise<void> {
    const hash = this.crypto.tokenHash(token);
    const reset = [...this.store.resets.values()].find((item) =>
      this.crypto.safeEqual(item.tokenHash, hash),
    );
    if (!reset || reset.consumedAt || reset.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('recovery_failed');
    }
    const user = this.requireUser(reset.userId);
    user.passwordHash = await this.crypto.hashPassword(password);
    reset.consumedAt = new Date();
    this.store.revokeUserSessions(user.id, 'password_reset');
    this.audit('auth.password.reset', { user_id: user.id });
  }

  async loginWithOidc(input: {
    provider: string;
    subject: string;
    email?: string;
    name?: string;
    signals: RequestSignals;
  }): Promise<SessionTokens> {
    const identityKey = `${input.provider}:${input.subject}`;
    let user = this.store.users.get(this.store.oidcUserIds.get(identityKey) ?? '');
    if (!user) {
      if (!input.email) throw new UnauthorizedException('oidc_failed');
      user = this.store.findUserByEmail(input.email.toLowerCase());
      if (!user) {
        user = {
          id: randomUUID(),
          email: input.email.toLowerCase(),
          displayName: input.name?.slice(0, 80) || input.email.split('@')[0] || 'کاربر',
          passwordHash: await this.crypto.hashPassword(this.crypto.randomToken()),
          status: 'active',
          createdAt: new Date(),
          failedLoginCount: 0,
        };
        this.store.users.set(user.id, user);
        this.store.userIdByEmail.set(user.email, user.id);
      }
      this.store.oidcUserIds.set(identityKey, user.id);
    }
    return this.createSession(user, input.signals, 'oidc');
  }

  private async createSession(
    user: UserRecord,
    signals: RequestSignals,
    assurance: Assurance,
  ): Promise<SessionTokens> {
    const refreshToken = this.crypto.randomToken();
    const now = new Date();
    const session: SessionRecord = {
      id: randomUUID(),
      familyId: randomUUID(),
      userId: user.id,
      refreshHash: this.crypto.tokenHash(refreshToken),
      previousRefreshHashes: [],
      deviceIdHash: this.risk.deviceIdHash(signals.deviceId),
      deviceLabel: this.risk.deviceLabel(signals.userAgent),
      ipPrefixHash: this.risk.ipPrefixHash(signals.ip),
      userAgentHash: this.risk.userAgentHash(signals.userAgent),
      assurance,
      createdAt: now,
      lastSeenAt: now,
      expiresAt: new Date(now.getTime() + this.config.refreshTtlSeconds * 1000),
    };
    this.store.sessions.set(session.id, session);
    const access = await this.crypto.signAccessToken({
      userId: user.id,
      sessionId: session.id,
      assurance,
    });
    this.audit('auth.session.created', {
      user_id: user.id,
      session_id: session.id,
      assurance,
    });
    return {
      accessToken: access.token,
      refreshToken,
      accessExpiresAt: access.expiresAt,
      refreshExpiresAt: session.expiresAt,
      sessionId: session.id,
    };
  }

  private async consumeRecoveryCode(user: UserRecord, code: string): Promise<boolean> {
    if (!user.mfa) return false;
    for (const [index, hash] of user.mfa.recoveryCodeHashes.entries()) {
      if (await this.crypto.verifyRecoveryCode(hash, code)) {
        user.mfa.recoveryCodeHashes.splice(index, 1);
        this.audit('auth.mfa.recovery_code_used', { user_id: user.id });
        return true;
      }
    }
    return false;
  }

  private recordFailure(user: UserRecord): void {
    user.failedLoginCount += 1;
    if (user.failedLoginCount >= 10) {
      user.lockedUntil = new Date(Date.now() + 15 * 60_000);
      user.failedLoginCount = 0;
    }
  }

  private requireUser(userId: string): UserRecord {
    const user = this.store.users.get(userId);
    if (!user) throw new UnauthorizedException('invalid_session');
    return user;
  }

  private audit(event: string, fields: Record<string, string>): void {
    process.stdout.write(`${JSON.stringify({ event, ...fields, at: new Date().toISOString() })}\n`);
  }
}
