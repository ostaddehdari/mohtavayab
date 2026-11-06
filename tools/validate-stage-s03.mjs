import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const roadmap = readJson('roadmap/roadmap.json');
const progress = readJson('roadmap/progress.json');
const system = readJson('architecture/system-model.json');
const threats = readJson('architecture/threat-register.json');
const decisions = readJson('architecture/decision-register.json');
const stage = roadmap.stages.find((item) => item.id === 'S03');
const errors = [];

const expectedTasks = stage?.works.flatMap((work) => work.tasks.map((task) => task.id)).sort() ?? [];
const completedTasks = [...(progress.stages?.S03?.completed_tasks ?? [])].sort();
if (stage?.works.length !== 4) errors.push('S03 باید چهار Work داشته باشد.');
if (expectedTasks.length !== 20) errors.push('S03 باید بیست Task داشته باشد.');
if (JSON.stringify(expectedTasks) !== JSON.stringify(completedTasks)) errors.push('Taskهای S03 کامل یا منطبق نیستند.');
if (progress.stages?.S03?.status !== 'completed') errors.push('S03 completed نیست.');
const currentStageNumber = Number(progress.current_stage?.slice(1));
if (!Number.isInteger(currentStageNumber) || currentStageNumber <= 3) errors.push('Current stage باید بعد از S03 باشد.');

const docs = {
  'docs/architecture/CORE_PROVIDER_BOUNDARIES_FA.md': ['## دامنه و معیار پذیرش', '## قرارداد درخواست و پاسخ', '## امنیت، مجوز و تله‌متری', '## معیار پذیرش W01'],
  'docs/architecture/DEPLOYMENT_NETWORK_MODEL_FA.md': ['## توپولوژی Production', '## Zoneها و Trust Boundaryها', '## شکست و عملیات', '## معیار پذیرش W02'],
  'docs/architecture/DATA_STORES_DECISION_FA.md': ['## ماتریس تصمیم', '## سازگاری و انتشار Projection', '## شرط ورود ClickHouse و Neo4j', '## معیار پذیرش W03'],
  'docs/architecture/THREAT_MODEL_FA.md': ['## رجیستر تهدیدهای اولویت‌دار', '## Release Gate امنیتی', '## ریسک‌های پذیرفته‌شده فعلی', '## معیار پذیرش W04'],
  'docs/architecture/ARCHITECTURE_RUNBOOK_FA.md': ['## ماتریس Triage', '## چک‌لیست تغییر معماری'],
  'docs/architecture/STAGE_S03_ACCEPTANCE_FA.md': ['## شواهد ۲۰ تسک', '## Exit Gate', '## ورودی استیج بعد']
};

for (const [file, markers] of Object.entries(docs)) {
  const full = path.join(root, file);
  const content = fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : '';
  if (!content) errors.push(`فایل مفقود: ${file}`);
  for (const marker of markers) if (!content.includes(marker)) errors.push(`${file}: بخش مفقود ${marker}`);
}

const zoneIds = new Set(system.zones?.map((item) => item.id));
const componentMap = new Map(system.components?.map((item) => [item.id, item]));
for (const required of ['edge', 'application', 'workflow', 'provider-execution', 'data', 'observability', 'admin', 'external']) {
  if (!zoneIds.has(required)) errors.push(`Zone مفقود: ${required}`);
}
for (const component of system.components ?? []) if (!zoneIds.has(component.zone)) errors.push(`Zone نامعتبر برای ${component.id}`);
for (const connection of system.connections ?? []) {
  if (!componentMap.has(connection.from) || !componentMap.has(connection.to)) errors.push(`Connection نامعتبر: ${connection.id}`);
}
const providerToData = (system.connections ?? []).filter((connection) =>
  connection.from === 'provider-runner' && componentMap.get(connection.to)?.zone === 'data' && connection.to !== 'vault' && connection.to !== 'minio'
);
if (providerToData.length) errors.push('Provider Runner دسترسی مستقیم غیرمجاز به Data Plane دارد.');
const minioConnection = system.connections?.find((item) => item.from === 'provider-runner' && item.to === 'minio');
if (minioConnection?.auth !== 'single-object-ttl') errors.push('دسترسی Runner به MinIO باید Presigned و محدود باشد.');
for (const store of system.data_stores ?? []) {
  if (!store.system_of_record && store.rebuildable !== true) errors.push(`Projection باید قابل Rebuild باشد: ${store.id}`);
}

if ((threats.threats ?? []).length < 18) errors.push('Threat Register باید حداقل ۱۸ تهدید داشته باشد.');
const criticalThreats = (threats.threats ?? []).filter((item) => item.severity === 'critical');
for (const threat of criticalThreats) {
  if (!threat.owner || !threat.prevent?.length || !threat.detect?.length || !threat.respond) errors.push(`کنترل تهدید بحرانی ناقص: ${threat.id}`);
}
for (const category of ['spoofing', 'tampering', 'repudiation', 'information-disclosure', 'denial-of-service', 'elevation-of-privilege']) {
  if (!(threats.threats ?? []).some((item) => item.category === category)) errors.push(`STRIDE category مفقود: ${category}`);
}

if ((decisions.decisions ?? []).length < 6) errors.push('حداقل ۶ ADR لازم است.');
for (const decision of decisions.decisions ?? []) {
  if (decision.status !== 'accepted') errors.push(`ADR پذیرفته نشده: ${decision.id}`);
  if (!fs.existsSync(path.join(root, decision.file))) errors.push(`فایل ADR مفقود: ${decision.file}`);
}

const acceptance = fs.readFileSync(path.join(root, 'docs/architecture/STAGE_S03_ACCEPTANCE_FA.md'), 'utf8');
for (const taskId of expectedTasks) if (!acceptance.includes(taskId)) errors.push(`Evidence مفقود: ${taskId}`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  stage: 'S03',
  works: stage.works.length,
  tasks: expectedTasks.length,
  adrs: decisions.decisions.length,
  threats: threats.threats.length,
  next_stage: progress.current_stage
}));
