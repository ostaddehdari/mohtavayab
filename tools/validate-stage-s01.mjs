import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const roadmap = readJson('roadmap/roadmap.json');
const progress = readJson('roadmap/progress.json');
const stage = roadmap.stages.find((item) => item.id === 'S01');
const errors = [];

if (!stage) errors.push('S01 در Roadmap پیدا نشد.');

const expectedTasks = stage
  ? stage.works.flatMap((work) => work.tasks.map((task) => task.id)).sort()
  : [];
const completedTasks = [...(progress.stages?.S01?.completed_tasks ?? [])].sort();

if (stage?.works.length !== 4) errors.push('S01 باید چهار Work داشته باشد.');
if (expectedTasks.length !== 20) errors.push('S01 باید بیست Task داشته باشد.');
if (JSON.stringify(expectedTasks) !== JSON.stringify(completedTasks)) {
  errors.push('فهرست Taskهای تکمیل‌شده با Roadmap یکسان نیست.');
}
if (progress.stages?.S01?.status !== 'completed') errors.push('وضعیت S01 کامل نیست.');
if (progress.current_stage === 'S01') errors.push('Current stage نباید روی S01 تکمیل‌شده باقی بماند.');

const requiredDocs = {
  'docs/product/PRODUCT_CHARTER_FA.md': ['## چشم‌انداز', '## خارج از دامنه', '## معیار پذیرش W01'],
  'docs/product/PERSONAS_JOURNEYS_FA.md': ['## پرسوناهای اصلی', '## Journey 01', '## معیار پذیرش W02'],
  'docs/product/KPI_EVENT_TAXONOMY_FA.md': ['## North Star', '## قرارداد مشترک Event', '## معیار پذیرش W03'],
  'docs/product/BACKLOG_PRIORITIZATION_FA.md': ['## مدل اولویت‌بندی', '## Critical Path', '## معیار پذیرش W04'],
  'docs/product/STAGE_S01_ACCEPTANCE_FA.md': ['## شواهد ۲۰ تسک', '## Exit Gate', '## ورودی استیج بعد']
};

for (const [file, markers] of Object.entries(requiredDocs)) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) {
    errors.push(`فایل مفقود: ${file}`);
    continue;
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  for (const marker of markers) {
    if (!content.includes(marker)) errors.push(`${file}: بخش لازم پیدا نشد: ${marker}`);
  }
}

const acceptance = fs.readFileSync(path.join(root, 'docs/product/STAGE_S01_ACCEPTANCE_FA.md'), 'utf8');
for (const taskId of expectedTasks) {
  if (!acceptance.includes(taskId)) errors.push(`Evidence برای ${taskId} ثبت نشده است.`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  stage: 'S01',
  works: stage.works.length,
  tasks: expectedTasks.length,
  current_stage: progress.current_stage
}));

