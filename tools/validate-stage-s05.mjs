import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const json = (name) => JSON.parse(read(name));
const roadmap = json('roadmap/roadmap.json');
const progress = json('roadmap/progress.json');
const stage = roadmap.stages.find((item) => item.id === 'S05');
const errors = [];
const expected = stage?.works.flatMap((work) => work.tasks.map((task) => task.id)).sort() ?? [];
const completed = [...(progress.stages?.S05?.completed_tasks ?? [])].sort();

if (stage?.works.length !== 4) errors.push('S05 باید چهار Work داشته باشد.');
if (expected.length !== 20) errors.push('S05 باید بیست Task داشته باشد.');
if (JSON.stringify(expected) !== JSON.stringify(completed))
  errors.push('Taskهای S05 کامل یا منطبق نیستند.');
if (progress.stages?.S05?.status !== 'completed') errors.push('S05 completed نیست.');
const currentStageNumber = Number(progress.current_stage?.slice(1));
if (!Number.isInteger(currentStageNumber) || currentStageNumber <= 5)
  errors.push('مرحله جاری باید بعد از S05 باشد.');
if (
  progress.completed_stage_count < 5 ||
  progress.completed_work_count < 20 ||
  progress.completed_task_count < 100
)
  errors.push('شمارنده‌های پیشرفت S05 نادرست‌اند.');

for (const file of [
  'design/information-architecture.json',
  'design/tokens.json',
  'design/motion-budget.json',
  'docs/design/INFORMATION_ARCHITECTURE_FA.md',
  'docs/design/DASHBOARD_WIREFRAMES_FA.md',
  'docs/design/DESIGN_SYSTEM_RTL_FA.md',
  'docs/design/ACCESSIBILITY_MOTION_RUNBOOK_FA.md',
  'docs/design/STAGE_S05_ACCEPTANCE_FA.md',
  'apps/web/src/app/dashboard/page.tsx',
  'apps/web/src/components/dashboard/dashboard-shell.tsx',
  'packages/ui/src/index.tsx',
])
  if (!fs.existsSync(path.join(root, file))) errors.push(`فایل مفقود: ${file}`);

const acceptance = read('docs/design/STAGE_S05_ACCEPTANCE_FA.md');
for (const taskId of expected)
  if (!acceptance.includes(taskId)) errors.push(`Evidence مفقود: ${taskId}`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(
  JSON.stringify({
    ok: true,
    stage: 'S05',
    works: 4,
    tasks: 20,
    next_stage: progress.current_stage,
  }),
);
