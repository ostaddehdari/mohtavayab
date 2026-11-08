import { Injectable } from '@nestjs/common';

function requiredSecret(name: string, fallback: string): string {
  const value = process.env[name] ?? fallback;
  if (
    process.env.NODE_ENV === 'production' &&
    (value.startsWith('change-in-') || value.length < 32)
  ) {
    throw new Error(`${name} must be supplied by the production secret store`);
  }
  return value;
}

@Injectable()
export class AuthConfig {
  readonly passwordPepper = requiredSecret(
    'AUTH_PASSWORD_PEPPER',
    'change-in-local-env-password-pepper-32-chars',
  );
  readonly tokenPepper = requiredSecret(
    'AUTH_TOKEN_PEPPER',
    'change-in-local-env-token-pepper-32-chars',
  );
  readonly jwtSecret = requiredSecret(
    'AUTH_JWT_SECRET',
    'change-in-local-env-jwt-secret-at-least-32-chars',
  );
  readonly mfaEncryptionKey = requiredSecret(
    'AUTH_MFA_ENCRYPTION_KEY',
    'change-in-local-env-mfa-key-at-least-32-chars',
  );
  readonly accessTtlSeconds = Number(process.env.AUTH_ACCESS_TTL_SECONDS ?? 900);
  readonly refreshTtlSeconds = Number(process.env.AUTH_REFRESH_TTL_SECONDS ?? 2_592_000);
  readonly secureCookies = process.env.NODE_ENV === 'production';
  readonly accessCookieName = this.secureCookies ? '__Host-mh_access' : 'mh_access';
  readonly refreshCookieName = this.secureCookies ? '__Host-mh_refresh' : 'mh_refresh';
  readonly issuer = 'https://srun.ir/mohtavayab';
  readonly audience = 'mohtavayab-web';
}
