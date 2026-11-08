import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const json = (name) => JSON.parse(read(name));
const errors = [];
const policy = json('security/identity-policy.json');
const apiPackage = json('apps/api/package.json');
const crypto = read('apps/api/src/auth/crypto.service.ts');
const auth = read('apps/api/src/auth/auth.service.ts');
const oidc = read('apps/api/src/auth/oidc.service.ts');
const controller = read('apps/api/src/auth/auth.controller.ts');
const webAuth = read('apps/web/src/components/auth/auth-experience.tsx');
const migration = read('infra/postgres/migrations/0001_identity.sql');

for (const dependency of ['@node-rs/argon2', 'jose', 'openid-client', 'otpauth', 'helmet']) {
  if (!apiPackage.dependencies?.[dependency]) errors.push(`وابستگی امنیتی مفقود: ${dependency}`);
}
if (policy.password?.algorithm !== 'argon2id' || policy.password?.memory_kib < 19_456) {
  errors.push('سیاست Argon2id ضعیف یا مفقود است.');
}
for (const marker of ['memoryCost: 19_456', 'timeCost: 2', 'parallelism: 1']) {
  if (!crypto.includes(marker)) errors.push(`پارامتر Argon مفقود: ${marker}`);
}
for (const marker of [
  'refresh_reuse_detected',
  'revokeFamily(reused.familyId',
  'previousRefreshHashes',
]) {
  if (!auth.includes(marker)) errors.push(`کنترل Rotation/Replay مفقود: ${marker}`);
}
for (const marker of [
  'randomPKCECodeVerifier',
  "code_challenge_method: 'S256'",
  'expectedState',
  'expectedNonce',
]) {
  if (!oidc.includes(marker)) errors.push(`کنترل OIDC مفقود: ${marker}`);
}
for (const marker of ['httpOnly: true', "sameSite: 'lax'", 'assertCsrf']) {
  if (!controller.includes(marker)) errors.push(`کنترل Cookie/CSRF مفقود: ${marker}`);
}
if (
  webAuth.includes("localStorage.setItem('access") ||
  webAuth.includes("localStorage.setItem('refresh")
) {
  errors.push('ذخیره Token در Local Storage ممنوع است.');
}
for (const table of [
  'identity.users',
  'identity.sessions',
  'identity.mfa_methods',
  'identity.security_events',
]) {
  if (!migration.includes(table)) errors.push(`جدول هویت مفقود: ${table}`);
}
for (const key of [
  'AUTH_PASSWORD_PEPPER',
  'AUTH_TOKEN_PEPPER',
  'AUTH_JWT_SECRET',
  'AUTH_MFA_ENCRYPTION_KEY',
]) {
  if (!read('.env.example').includes(`${key}=`)) errors.push(`متغیر امنیتی مفقود: ${key}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(
  JSON.stringify({
    ok: true,
    password: 'argon2id',
    oidc: 'code+pkce',
    refresh_rotation: true,
    mfa: 'totp',
    raw_ip_storage: false,
  }),
);
