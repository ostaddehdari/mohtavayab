import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const roadmap = readJson('roadmap/roadmap.json');
const progress = readJson('roadmap/progress.json');
const privacy = readJson('policies/privacy-baseline.json');
const providers = readJson('policies/provider-risk-register.json');
const retention = readJson('policies/retention-defaults.json');
const stage = roadmap.stages.find((item) => item.id === 'S02');
const errors = [];

const expectedTasks = stage?.works.flatMap((work) => work.tasks.map((task) => task.id)).sort() ?? [];
const completedTasks = [...(progress.stages?.S02?.completed_tasks ?? [])].sort();
if (stage?.works.length !== 4) errors.push('S02 باید چهار Work داشته باشد.');
if (expectedTasks.length !== 20) errors.push('S02 باید بیست Task داشته باشد.');
if (JSON.stringify(expectedTasks) !== JSON.stringify(completedTasks)) errors.push('Taskهای S02 کامل یا منطبق نیستند.');
if (progress.stages?.S02?.status !== 'completed') errors.push('S02 completed نیست.');
if (progress.current_stage !== 'S03') errors.push('Current stage باید S03 باشد.');

const docs = {
  'docs/legal/LEGAL_BASIS_CONSENT_FA.md': ['## Purpose Registry', '## Consent Receipt Contract', '## معیار پذیرش W01'],
  'docs/legal/DATA_CLASSIFICATION_PII_FA.md': ['## سطوح طبقه‌بندی', '### C4', '## معیار پذیرش W02'],
  'docs/legal/PROVIDER_GOVERNANCE_FA.md': ['## طبقات ریسک', '## Go/No-Go Gate', '## معیار پذیرش W03'],
  'docs/legal/RETENTION_DELETION_EXPORT_FA.md': ['## Deletion Workflow', '## Export Workflow', '## معیار پذیرش W04'],
  'docs/legal/STAGE_S02_ACCEPTANCE_FA.md': ['## شواهد ۲۰ تسک', '## Exit Gate', '## ورودی استیج بعد']
};

for (const [file, markers] of Object.entries(docs)) {
  const content = fs.existsSync(path.join(root, file)) ? fs.readFileSync(path.join(root, file), 'utf8') : '';
  if (!content) errors.push(`فایل مفقود: ${file}`);
  for (const marker of markers) if (!content.includes(marker)) errors.push(`${file}: بخش مفقود ${marker}`);
}

for (const dataClass of ['C0', 'C1', 'C2', 'C3', 'C4']) {
  if (!privacy.data_classes?.[dataClass]) errors.push(`Data class مفقود: ${dataClass}`);
}
if (privacy.data_classes?.C4?.ai_cloud !== 'prohibited') errors.push('C4 باید از AI ابری منع شود.');
if (privacy.data_classes?.C4?.export !== 'prohibited') errors.push('C4 باید از Export منع شود.');
if (!providers.tiers?.E || providers.providers.some((p) => !p.production_state)) errors.push('Provider risk register ناقص است.');
if (!retention.entries.some((item) => item.id === 'RET-BACKUP' && item.restore_requires_deletion_replay)) errors.push('Backup deletion replay تعریف نشده است.');
for (const secret of ['password', 'otp', 'access_token', 'session_cookie', 'private_key']) {
  if (!retention.export_exclusions.includes(secret)) errors.push(`Export exclusion مفقود: ${secret}`);
}

const acceptance = fs.readFileSync(path.join(root, 'docs/legal/STAGE_S02_ACCEPTANCE_FA.md'), 'utf8');
for (const taskId of expectedTasks) if (!acceptance.includes(taskId)) errors.push(`Evidence مفقود: ${taskId}`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(JSON.stringify({ok: true, stage: 'S02', works: 4, tasks: 20, next_stage: 'S03'}));

