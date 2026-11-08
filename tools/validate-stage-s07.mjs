import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const json = (name) => JSON.parse(read(name));
const roadmap = json('roadmap/roadmap.json');
const progress = json('roadmap/progress.json');
const stage = roadmap.stages.find((item) => item.id === 'S07');
const errors = [];
const expected = stage?.works.flatMap((work) => work.tasks.map((task) => task.id)).sort() ?? [];
const completed = [...(progress.stages?.S07?.completed_tasks ?? [])].sort();

if (stage?.works.length !== 4) errors.push('S07 باید چهار Work داشته باشد.');
if (expected.length !== 20) errors.push('S07 باید بیست Task داشته باشد.');
if (JSON.stringify(expected) !== JSON.stringify(completed))
  errors.push('Taskهای S07 کامل یا منطبق نیستند.');
if (progress.stages?.S07?.status !== 'completed') errors.push('S07 completed نیست.');
const currentStageNumber = Number(progress.current_stage?.slice(1));
if (!Number.isInteger(currentStageNumber) || currentStageNumber <= 7)
  errors.push('مرحله جاری باید بعد از S07 باشد.');
if (
  progress.completed_stage_count < 7 ||
  progress.completed_work_count < 28 ||
  progress.completed_task_count < 140
)
  errors.push('شمارنده‌های پیشرفت S07 نادرست‌اند.');

for (const file of [
  'security/rbac-policy.json',
  'infra/postgres/migrations/0002_tenancy_rbac.sql',
  'apps/api/src/workspace/workspace.controller.ts',
  'apps/api/src/workspace/workspace.service.ts',
  'apps/api/src/database/database.service.ts',
  'apps/web/src/app/workspace/page.tsx',
  'docs/security/WORKSPACE_MEMBERSHIP_FA.md',
  'docs/security/RBAC_MATRIX_FA.md',
  'docs/security/TENANT_ISOLATION_FA.md',
  'docs/security/INVITATIONS_SERVICE_ACCOUNTS_FA.md',
  'docs/security/STAGE_S07_ACCEPTANCE_FA.md',
])
  if (!fs.existsSync(path.join(root, file))) errors.push(`فایل مفقود: ${file}`);

const acceptance = read('docs/security/STAGE_S07_ACCEPTANCE_FA.md');
for (const taskId of expected)
  if (!acceptance.includes(taskId)) errors.push(`Evidence مفقود: ${taskId}`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(
  JSON.stringify({
    ok: true,
    stage: 'S07',
    works: 4,
    tasks: 20,
    next_stage: progress.current_stage,
  }),
);
