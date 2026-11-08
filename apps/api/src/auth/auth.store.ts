import { randomUUID } from 'node:crypto';
import { Injectable, type OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import type {
  Assurance,
  MfaChallengeRecord,
  OidcTransaction,
  ResetRecord,
  SessionRecord,
  UserRecord,
} from './auth.types.js';

@Injectable()
export class AuthStore implements OnModuleInit {
  readonly users = new Map<string, UserRecord>();
  readonly userIdByEmail = new Map<string, string>();
  readonly sessions = new Map<string, SessionRecord>();
  readonly challenges = new Map<string, MfaChallengeRecord>();
  readonly resets = new Map<string, ResetRecord>();
  readonly oidcTransactions = new Map<string, OidcTransaction>();
  readonly oidcUserIds = new Map<string, string>();

  constructor(private readonly database: DatabaseService = { enabled: false } as DatabaseService) {}

  async onModuleInit(): Promise<void> {
    if (!this.database.enabled) return;
    const users = await this.database.query<{
      id: string;
      email_normalized: string;
      display_name: string;
      password_hash: string;
      status: 'active' | 'locked';
      failed_login_count: number;
      locked_until?: Date;
      created_at: Date;
    }>(`SELECT u.id,u.email_normalized,u.display_name,p.password_hash,u.status,u.failed_login_count,u.locked_until,u.created_at
        FROM identity.users u JOIN identity.password_credentials p ON p.user_id=u.id`);
    for (const row of users) {
      const user: UserRecord = {
        id: row.id,
        email: row.email_normalized,
        displayName: row.display_name,
        passwordHash: row.password_hash,
        status: row.status,
        createdAt: new Date(row.created_at),
        failedLoginCount: row.failed_login_count,
        ...(row.locked_until ? { lockedUntil: new Date(row.locked_until) } : {}),
      };
      this.users.set(user.id, user);
      this.userIdByEmail.set(user.email, user.id);
    }
    const methods = await this.database.query<{
      id: string;
      user_id: string;
      encrypted_secret: string;
      enabled_at: Date;
    }>(
      'SELECT id,user_id,encrypted_secret,enabled_at FROM identity.mfa_methods WHERE disabled_at IS NULL',
    );
    for (const method of methods) {
      const codes = await this.database.query<{ code_hash: string }>(
        'SELECT code_hash FROM identity.mfa_recovery_codes WHERE mfa_method_id=$1 AND consumed_at IS NULL',
        [method.id],
      );
      const user = this.users.get(method.user_id);
      if (user)
        user.mfa = {
          id: method.id,
          encryptedSecret: method.encrypted_secret,
          enabledAt: new Date(method.enabled_at),
          recoveryCodeHashes: codes.map((item) => item.code_hash),
        };
    }
    const sessions = await this.database.query<{
      id: string;
      family_id: string;
      user_id: string;
      refresh_token_hash: string;
      previous_refresh_hashes: string[];
      assurance: Assurance;
      device_id_hash: string;
      device_label: string;
      ip_prefix_hash: string;
      user_agent_hash: string;
      created_at: Date;
      last_seen_at: Date;
      expires_at: Date;
      revoked_at?: Date;
      revoke_reason?: string;
    }>('SELECT * FROM identity.sessions');
    for (const row of sessions)
      this.sessions.set(row.id, {
        id: row.id,
        familyId: row.family_id,
        userId: row.user_id,
        refreshHash: row.refresh_token_hash,
        previousRefreshHashes: row.previous_refresh_hashes,
        assurance: row.assurance,
        deviceIdHash: row.device_id_hash,
        deviceLabel: row.device_label,
        ipPrefixHash: row.ip_prefix_hash,
        userAgentHash: row.user_agent_hash,
        createdAt: new Date(row.created_at),
        lastSeenAt: new Date(row.last_seen_at),
        expiresAt: new Date(row.expires_at),
        ...(row.revoked_at ? { revokedAt: new Date(row.revoked_at) } : {}),
        ...(row.revoke_reason ? { revokeReason: row.revoke_reason } : {}),
      });
    const identities = await this.database.query<{
      issuer: string;
      subject: string;
      user_id: string;
    }>('SELECT issuer,subject,user_id FROM identity.oidc_identities');
    for (const row of identities) this.oidcUserIds.set(`${row.issuer}:${row.subject}`, row.user_id);
  }

  findUserByEmail(email: string): UserRecord | undefined {
    const id = this.userIdByEmail.get(email);
    return id ? this.users.get(id) : undefined;
  }

  async saveUser(user: UserRecord): Promise<void> {
    this.users.set(user.id, user);
    this.userIdByEmail.set(user.email, user.id);
    if (!this.database.enabled) return;
    await this.database.query(
      `INSERT INTO identity.users (id,email_normalized,display_name,status,failed_login_count,locked_until,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO UPDATE SET display_name=EXCLUDED.display_name,status=EXCLUDED.status,failed_login_count=EXCLUDED.failed_login_count,locked_until=EXCLUDED.locked_until,updated_at=now()`,
      [
        user.id,
        user.email,
        user.displayName,
        user.status,
        user.failedLoginCount,
        user.lockedUntil,
        user.createdAt,
      ],
    );
    await this.database.query(
      `INSERT INTO identity.password_credentials (user_id,password_hash) VALUES ($1,$2)
       ON CONFLICT (user_id) DO UPDATE SET password_hash=EXCLUDED.password_hash,changed_at=now()`,
      [user.id, user.passwordHash],
    );
    if (user.mfa) {
      await this.database.query(
        `INSERT INTO identity.mfa_methods (id,user_id,kind,encrypted_secret,enabled_at) VALUES ($1,$2,'totp',$3,$4)
         ON CONFLICT (id) DO UPDATE SET encrypted_secret=EXCLUDED.encrypted_secret,enabled_at=EXCLUDED.enabled_at,disabled_at=NULL`,
        [user.mfa.id, user.id, user.mfa.encryptedSecret, user.mfa.enabledAt],
      );
      await this.database.query('DELETE FROM identity.mfa_recovery_codes WHERE mfa_method_id=$1', [
        user.mfa.id,
      ]);
      for (const hash of user.mfa.recoveryCodeHashes)
        await this.database.query(
          'INSERT INTO identity.mfa_recovery_codes (id,mfa_method_id,code_hash) VALUES ($1,$2,$3)',
          [randomUUID(), user.mfa.id, hash],
        );
    }
  }

  async saveSession(session: SessionRecord): Promise<void> {
    this.sessions.set(session.id, session);
    if (!this.database.enabled) return;
    await this.database.query(
      `INSERT INTO identity.sessions (id,family_id,user_id,refresh_token_hash,previous_refresh_hashes,assurance,device_id_hash,device_label,ip_prefix_hash,user_agent_hash,created_at,last_seen_at,expires_at,revoked_at,revoke_reason)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (id) DO UPDATE SET refresh_token_hash=EXCLUDED.refresh_token_hash,previous_refresh_hashes=EXCLUDED.previous_refresh_hashes,last_seen_at=EXCLUDED.last_seen_at,ip_prefix_hash=EXCLUDED.ip_prefix_hash,user_agent_hash=EXCLUDED.user_agent_hash,revoked_at=EXCLUDED.revoked_at,revoke_reason=EXCLUDED.revoke_reason`,
      [
        session.id,
        session.familyId,
        session.userId,
        session.refreshHash,
        session.previousRefreshHashes,
        session.assurance,
        session.deviceIdHash,
        session.deviceLabel,
        session.ipPrefixHash,
        session.userAgentHash,
        session.createdAt,
        session.lastSeenAt,
        session.expiresAt,
        session.revokedAt,
        session.revokeReason,
      ],
    );
  }

  async saveReset(reset: ResetRecord): Promise<void> {
    this.resets.set(reset.id, reset);
    if (!this.database.enabled) return;
    await this.database.query(
      `INSERT INTO identity.password_reset_tokens (id,user_id,token_hash,expires_at,consumed_at) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (id) DO UPDATE SET consumed_at=EXCLUDED.consumed_at`,
      [reset.id, reset.userId, reset.tokenHash, reset.expiresAt, reset.consumedAt],
    );
  }

  async saveOidcIdentity(identityKey: string, userId: string): Promise<void> {
    this.oidcUserIds.set(identityKey, userId);
    if (!this.database.enabled) return;
    const separator = identityKey.indexOf(':');
    await this.database.query(
      `INSERT INTO identity.oidc_identities (id,user_id,issuer,subject) VALUES ($1,$2,$3,$4)
       ON CONFLICT (issuer,subject) DO UPDATE SET user_id=EXCLUDED.user_id`,
      [randomUUID(), userId, identityKey.slice(0, separator), identityKey.slice(separator + 1)],
    );
  }

  async revokeFamily(familyId: string, reason: string, now = new Date()): Promise<void> {
    for (const session of this.sessions.values())
      if (session.familyId === familyId && !session.revokedAt) {
        session.revokedAt = now;
        session.revokeReason = reason;
      }
    if (this.database.enabled)
      await this.database.query(
        'UPDATE identity.sessions SET revoked_at=$2,revoke_reason=$3 WHERE family_id=$1 AND revoked_at IS NULL',
        [familyId, now, reason],
      );
  }

  async revokeUserSessions(userId: string, reason: string, now = new Date()): Promise<void> {
    for (const session of this.sessions.values())
      if (session.userId === userId && !session.revokedAt) {
        session.revokedAt = now;
        session.revokeReason = reason;
      }
    if (this.database.enabled)
      await this.database.query(
        'UPDATE identity.sessions SET revoked_at=$2,revoke_reason=$3 WHERE user_id=$1 AND revoked_at IS NULL',
        [userId, now, reason],
      );
  }
}
