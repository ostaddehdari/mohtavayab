import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const roadmap = readJson('roadmap/roadmap.json');
const progress = readJson('roadmap/progress.json');
const packageJson = readJson('package.json');
const stage = roadmap.stages.find((item) => item.id === 'S04');
const errors = [];

const expectedTasks =
  stage?.works.flatMap((work) => work.tasks.map((task) => task.id)).sort() ?? [];
const completedTasks = [...(progress.stages?.S04?.completed_tasks ?? [])].sort();
if (stage?.works.length !== 4) errors.push('S04 باید چهار Work داشته باشد.');
if (expectedTasks.length !== 20) errors.push('S04 باید بیست Task داشته باشد.');
if (JSON.stringify(expectedTasks) !== JSON.stringify(completedTasks))
  errors.push('Taskهای S04 کامل یا منطبق نیستند.');
if (progress.stages?.S04?.status !== 'completed') errors.push('S04 completed نیست.');
const currentStageNumber = Number(progress.current_stage?.slice(1));
if (!Number.isInteger(currentStageNumber) || currentStageNumber <= 4)
  errors.push('Current stage باید بعد از S04 باشد.');

const requiredFiles = [
  'pnpm-workspace.yaml',
  'pnpm-lock.yaml',
  'turbo.json',
  'tsconfig.base.json',
  'eslint.config.mjs',
  'pyproject.toml',
  'uv.lock',
  '.env.example',
  '.devcontainer/devcontainer.json',
  'infra/compose/compose.dev.yml',
  '.github/workflows/verify.yml',
  'apps/web/package.json',
  'apps/web/next.config.ts',
  'apps/web/src/app/page.tsx',
  'apps/api/package.json',
  'apps/api/src/main.ts',
  'packages/contracts/src/index.ts',
  'providers/python-template/src/mohtavayab_provider_template/contract.py',
  'tools/validate-architecture-boundaries.mjs',
  'tools/validate-environment.mjs',
  'docs/development/DEVELOPMENT_ENVIRONMENT_FA.md',
  'docs/development/STAGE_S04_ACCEPTANCE_FA.md',
];
for (const file of requiredFiles)
  if (!fs.existsSync(path.join(root, file))) errors.push(`فایل مفقود: ${file}`);

if (packageJson.packageManager !== 'pnpm@12.18.0') errors.push('pnpm باید Pin شده باشد.');
for (const script of [
  'build',
  'lint',
  'typecheck',
  'test',
  'quality',
  'check:boundaries',
  'check:environment',
]) {
  if (!packageJson.scripts?.[script]) errors.push(`Root script مفقود: ${script}`);
}
if (!read('apps/web/next.config.ts').includes("basePath: '/mohtavayab'"))
  errors.push('basePath وب نادرست است.');
if (!read('apps/api/src/main.ts').includes("setGlobalPrefix('mohtavayab/api')"))
  errors.push('API prefix نادرست است.');
if (!read('tsconfig.base.json').includes('"strict": true'))
  errors.push('TypeScript strict فعال نیست.');
if (!read('pyproject.toml').includes('strict = true')) errors.push('mypy strict فعال نیست.');
for (const marker of ['pnpm lint', 'pnpm typecheck', 'pnpm test', 'pnpm build']) {
  if (!read('.github/workflows/verify.yml').includes(marker))
    errors.push(`CI gate مفقود: ${marker}`);
}

const acceptance = read('docs/development/STAGE_S04_ACCEPTANCE_FA.md');
for (const taskId of expectedTasks)
  if (!acceptance.includes(taskId)) errors.push(`Evidence مفقود: ${taskId}`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(
  JSON.stringify({
    ok: true,
    stage: 'S04',
    works: stage.works.length,
    tasks: expectedTasks.length,
    apps: ['web', 'api'],
    next_stage: progress.current_stage,
  }),
);
