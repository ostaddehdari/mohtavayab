import { Injectable } from '@nestjs/common';
import type {
  MfaChallengeRecord,
  OidcTransaction,
  ResetRecord,
  SessionRecord,
  UserRecord,
} from './auth.types.js';

@Injectable()
export class AuthStore {
  readonly users = new Map<string, UserRecord>();
  readonly userIdByEmail = new Map<string, string>();
  readonly sessions = new Map<string, SessionRecord>();
  readonly challenges = new Map<string, MfaChallengeRecord>();
  readonly resets = new Map<string, ResetRecord>();
  readonly oidcTransactions = new Map<string, OidcTransaction>();
  readonly oidcUserIds = new Map<string, string>();

  findUserByEmail(email: string): UserRecord | undefined {
    const id = this.userIdByEmail.get(email);
    return id ? this.users.get(id) : undefined;
  }

  revokeFamily(familyId: string, reason: string, now = new Date()): void {
    for (const session of this.sessions.values()) {
      if (session.familyId === familyId && !session.revokedAt) {
        session.revokedAt = now;
        session.revokeReason = reason;
      }
    }
  }

  revokeUserSessions(userId: string, reason: string, now = new Date()): void {
    for (const session of this.sessions.values()) {
      if (session.userId === userId && !session.revokedAt) {
        session.revokedAt = now;
        session.revokeReason = reason;
      }
    }
  }
}
