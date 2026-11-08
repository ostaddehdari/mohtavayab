import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';
import { hash, verify, type Algorithm } from '@node-rs/argon2';
import { Injectable } from '@nestjs/common';
import { jwtVerify, SignJWT, type JWTPayload } from 'jose';
import * as OTPAuth from 'otpauth';
import { AuthConfig } from './auth.config.js';
import type { Assurance } from './auth.types.js';

const argonPolicy = {
  algorithm: 2 as Algorithm,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
  outputLen: 32,
};

@Injectable()
export class CryptoService {
  private readonly jwtKey: Uint8Array;
  private readonly encryptionKey: Buffer;

  constructor(private readonly config: AuthConfig) {
    this.jwtKey = new TextEncoder().encode(config.jwtSecret);
    this.encryptionKey = createHash('sha256').update(config.mfaEncryptionKey).digest();
  }

  hashPassword(password: string): Promise<string> {
    return hash(password, {
      ...argonPolicy,
      secret: Buffer.from(this.config.passwordPepper),
    });
  }

  verifyPassword(encoded: string, password: string): Promise<boolean> {
    return verify(encoded, password, { secret: Buffer.from(this.config.passwordPepper) });
  }

  hashRecoveryCode(code: string): Promise<string> {
    return hash(code, argonPolicy);
  }

  verifyRecoveryCode(encoded: string, code: string): Promise<boolean> {
    return verify(encoded, code);
  }

  randomToken(bytes = 32): string {
    return randomBytes(bytes).toString('base64url');
  }

  randomRecoveryCode(): string {
    const value = randomBytes(8).toString('hex').toUpperCase();
    return `${value.slice(0, 8)}-${value.slice(8)}`;
  }

  tokenHash(value: string): string {
    return createHmac('sha256', this.config.tokenPepper).update(value).digest('base64url');
  }

  safeEqual(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
  }

  encryptSecret(value: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `v1.${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
  }

  decryptSecret(value: string): string {
    const [version, iv, tag, ciphertext] = value.split('.');
    if (version !== 'v1' || !iv || !tag || !ciphertext) throw new Error('invalid encrypted secret');
    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.encryptionKey,
      Buffer.from(iv, 'base64url'),
    );
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertext, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  }

  createTotpSecret(email: string): { base32: string; uri: string } {
    const secret = new OTPAuth.Secret({ size: 20 });
    const totp = new OTPAuth.TOTP({
      issuer: 'هادی / محتوا‌یاب',
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret,
    });
    return { base32: secret.base32, uri: totp.toString() };
  }

  verifyTotp(base32: string, code: string): boolean {
    const totp = new OTPAuth.TOTP({
      issuer: 'هادی / محتوا‌یاب',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(base32),
    });
    return totp.validate({ token: code, window: 1 }) !== null;
  }

  async signAccessToken(input: {
    userId: string;
    sessionId: string;
    assurance: Assurance;
  }): Promise<{ token: string; expiresAt: Date }> {
    const expiresAt = new Date(Date.now() + this.config.accessTtlSeconds * 1000);
    const token = await new SignJWT({ sid: input.sessionId, amr: [input.assurance] })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setSubject(input.userId)
      .setIssuer(this.config.issuer)
      .setAudience(this.config.audience)
      .setIssuedAt()
      .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
      .setJti(this.randomToken(16))
      .sign(this.jwtKey);
    return { token, expiresAt };
  }

  async verifyAccessToken(token: string): Promise<JWTPayload & { sid: string; sub: string }> {
    const result = await jwtVerify(token, this.jwtKey, {
      issuer: this.config.issuer,
      audience: this.config.audience,
      algorithms: ['HS256'],
    });
    const { sid, sub } = result.payload;
    if (typeof sid !== 'string' || typeof sub !== 'string') throw new Error('invalid token claims');
    return { ...result.payload, sid, sub };
  }
}
