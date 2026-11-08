import { isIP } from 'node:net';
import { Injectable } from '@nestjs/common';
import { CryptoService } from './crypto.service.js';
import type { RequestSignals, SessionRecord } from './auth.types.js';

type AttemptBucket = { count: number; resetsAt: number };

@Injectable()
export class RiskPolicyService {
  private readonly attempts = new Map<string, AttemptBucket>();

  constructor(private readonly crypto: CryptoService) {}

  assertLoginAllowed(email: string, ip: string, now = Date.now()): boolean {
    const key = this.crypto.tokenHash(`${email}|${this.ipPrefix(ip)}`);
    const current = this.attempts.get(key);
    if (!current || current.resetsAt <= now) {
      this.attempts.set(key, { count: 1, resetsAt: now + 15 * 60_000 });
      return true;
    }
    current.count += 1;
    return current.count <= 8;
  }

  clearLoginAttempts(email: string, ip: string): void {
    this.attempts.delete(this.crypto.tokenHash(`${email}|${this.ipPrefix(ip)}`));
  }

  deviceIdHash(deviceId: string): string {
    return this.crypto.tokenHash(`device:${deviceId}`);
  }

  ipPrefixHash(ip: string): string {
    return this.crypto.tokenHash(`ip:${this.ipPrefix(ip)}`);
  }

  userAgentHash(userAgent: string): string {
    return this.crypto.tokenHash(`ua:${userAgent.slice(0, 512)}`);
  }

  deviceLabel(userAgent: string): string {
    const browser = /Firefox/i.test(userAgent)
      ? 'Firefox'
      : /Edg/i.test(userAgent)
        ? 'Edge'
        : /Chrome/i.test(userAgent)
          ? 'Chrome'
          : /Safari/i.test(userAgent)
            ? 'Safari'
            : 'مرورگر ناشناس';
    const os = /Windows/i.test(userAgent)
      ? 'Windows'
      : /Android/i.test(userAgent)
        ? 'Android'
        : /iPhone|iPad/i.test(userAgent)
          ? 'iOS'
          : /Linux/i.test(userAgent)
            ? 'Linux'
            : 'دستگاه ناشناس';
    return `${browser} روی ${os}`;
  }

  requiresStepUp(signals: RequestSignals, sessions: SessionRecord[]): boolean {
    const deviceHash = this.deviceIdHash(signals.deviceId);
    const ipHash = this.ipPrefixHash(signals.ip);
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60_000;
    return !sessions.some(
      (session) =>
        !session.revokedAt &&
        session.assurance === 'mfa' &&
        session.deviceIdHash === deviceHash &&
        session.ipPrefixHash === ipHash &&
        session.lastSeenAt.getTime() >= thirtyDaysAgo,
    );
  }

  private ipPrefix(ip: string): string {
    const normalized = ip.replace(/^::ffff:/, '');
    if (isIP(normalized) === 4) return normalized.split('.').slice(0, 3).join('.');
    if (isIP(normalized) === 6) return normalized.split(':').slice(0, 4).join(':');
    return 'unknown';
  }
}
