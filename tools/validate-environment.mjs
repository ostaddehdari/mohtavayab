import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const errors = [];

const workspace = YAML.parse(read('pnpm-workspace.yaml'));
for (const pattern of ['apps/*', 'packages/*']) {
  if (!workspace.packages?.includes(pattern))
    errors.push(`pnpm workspace pattern مفقود: ${pattern}`);
}

const compose = YAML.parse(read('infra/compose/compose.dev.yml'));
for (const service of ['postgres', 'redis', 'minio', 'temporal', 'temporal-ui', 'otel-collector']) {
  if (!compose.services?.[service]) errors.push(`Compose service مفقود: ${service}`);
}
for (const service of ['postgres', 'redis', 'minio']) {
  if (!compose.services?.[service]?.healthcheck) errors.push(`Healthcheck مفقود: ${service}`);
}
for (const [serviceName, service] of Object.entries(compose.services ?? {})) {
  for (const port of service.ports ?? []) {
    if (typeof port === 'string' && !port.startsWith('127.0.0.1:')) {
      errors.push(`${serviceName}: پورت توسعه باید فقط روی localhost Bind شود: ${port}`);
    }
  }
}
if (compose.networks?.data?.internal !== true) errors.push('شبکه data باید internal باشد.');

const env = Object.fromEntries(
  read('.env.example')
    .split('\n')
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const separator = line.indexOf('=');
      return [line.slice(0, separator), line.slice(separator + 1)];
    }),
);
for (const key of [
  'PUBLIC_BASE_URL',
  'POSTGRES_HOST',
  'POSTGRES_DB',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'REDIS_URL',
  'MINIO_ENDPOINT',
  'MINIO_ROOT_USER',
  'MINIO_ROOT_PASSWORD',
  'TEMPORAL_ADDRESS',
  'OTEL_EXPORTER_OTLP_ENDPOINT',
]) {
  if (!env[key]) errors.push(`Environment key مفقود یا خالی: ${key}`);
}
for (const key of ['POSTGRES_PASSWORD', 'MINIO_ROOT_PASSWORD']) {
  if (!env[key]?.startsWith('change-in-local-env'))
    errors.push(`${key} باید placeholder صریح باشد.`);
}

const nextConfig = read('apps/web/next.config.ts');
if (!nextConfig.includes("basePath: '/mohtavayab'")) errors.push('Next.js basePath نادرست است.');
const ci = read('.github/workflows/verify.yml');
for (const marker of [
  'contents: read',
  'pnpm install --frozen-lockfile',
  'uv sync --all-packages --frozen',
]) {
  if (!ci.includes(marker)) errors.push(`CI marker مفقود: ${marker}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(
  JSON.stringify({
    ok: true,
    compose_services: Object.keys(compose.services).length,
    base_path: '/mohtavayab',
  }),
);
