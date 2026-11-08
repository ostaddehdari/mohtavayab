import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const json = (name) => JSON.parse(read(name));
const roadmap = json('roadmap/roadmap.json');
const progress = json('roadmap/progress.json');
const stage = roadmap.stages.find((item) => item.id === 'S06');
const errors = [];
const expected = stage?.works.flatMap((work) => work.tasks.map((task) => task.id)).sort() ?? [];
const completed = [...(progress.stages?.S06?.completed_tasks ?? [])].sort();

if (stage?.works.length !== 4) errors.push('S06 باید چهار Work داشته باشد.');
if (expected.length !== 20) errors.push('S06 باید بیست Task داشته باشد.');
if (JSON.stringify(expected) !== JSON.stringify(completed))
  errors.push('Taskهای S06 کامل یا منطبق نیستند.');
if (progress.stages?.S06?.status !== 'completed') errors.push('S06 completed نیست.');
const currentStageNumber = Number(progress.current_stage?.slice(1));
if (!Number.isInteger(currentStageNumber) || currentStageNumber <= 6)
  errors.push('مرحله جاری باید بعد از S06 باشد.');
if (
  progress.completed_stage_count < 6 ||
  progress.completed_work_count < 24 ||
  progress.completed_task_count < 120
)
  errors.push('شمارنده‌های پیشرفت S06 نادرست‌اند.');

for (const file of [
  'security/identity-policy.json',
  'infra/postgres/migrations/0001_identity.sql',
  'apps/api/src/auth/auth.controller.ts',
  'apps/api/src/auth/auth.service.ts',
  'apps/api/src/auth/oidc.service.ts',
  'apps/api/src/auth/risk-policy.service.ts',
  'apps/web/src/app/auth/page.tsx',
  'apps/web/src/app/security/page.tsx',
  'docs/security/AUTH_ARCHITECTURE_FA.md',
  'docs/security/OIDC_SESSION_RUNBOOK_FA.md',
  'docs/security/MFA_RECOVERY_RUNBOOK_FA.md',
  'docs/security/DEVICE_IP_POLICY_FA.md',
  'docs/security/STAGE_S06_ACCEPTANCE_FA.md',
])
  if (!fs.existsSync(path.join(root, file))) errors.push(`فایل مفقود: ${file}`);

const acceptance = read('docs/security/STAGE_S06_ACCEPTANCE_FA.md');
for (const taskId of expected)
  if (!acceptance.includes(taskId)) errors.push(`Evidence مفقود: ${taskId}`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(
  JSON.stringify({
    ok: true,
    stage: 'S06',
    works: 4,
    tasks: 20,
    next_stage: progress.current_stage,
  }),
);
