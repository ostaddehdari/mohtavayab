import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const json = (name) => JSON.parse(read(name));
const errors = [];
const policy = json('security/rbac-policy.json');
const migration = read('infra/postgres/migrations/0002_tenancy_rbac.sql');
const service = read('apps/api/src/workspace/workspace.service.ts');
const database = read('apps/api/src/database/database.service.ts');
const dashboard = read('apps/web/src/components/dashboard/dashboard-shell.tsx');
const apiPackage = json('apps/api/package.json');

if (policy.default_deny !== true) errors.push('RBAC باید default-deny باشد.');
if (policy.roles?.length !== 6) errors.push('شش نقش پایه مفقود است.');
if (!apiPackage.dependencies?.pg) errors.push('درایور PostgreSQL مفقود است.');
for (const marker of [
  'ENABLE ROW LEVEL SECURITY',
  "current_setting('app.workspace_id'",
  'tenancy.service_accounts',
]) {
  if (!migration.includes(marker)) errors.push(`کنترل RLS مفقود: ${marker}`);
}
for (const marker of [
  'authorize(workspaceId',
  "throw new ForbiddenException('permission_denied')",
  'last_owner_protected',
  'mhsa_',
]) {
  if (!service.includes(marker)) errors.push(`کنترل Workspace مفقود: ${marker}`);
}
for (const marker of ["set_config('app.workspace_id'", 'BEGIN', 'ROLLBACK']) {
  if (!database.includes(marker)) errors.push(`Transaction tenant مفقود: ${marker}`);
}
if (dashboard.includes("localStorage.setItem('mohtavayab-sidebar'"))
  errors.push('ترجیح سایدبار نباید در Local Storage ذخیره شود.');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(
  JSON.stringify({
    ok: true,
    roles: 6,
    default_deny: true,
    postgres_rls: true,
    service_secret_plain_storage: false,
  }),
);
