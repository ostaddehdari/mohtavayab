import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

function filesBelow(relative, extensions = ['.ts', '.tsx', '.mjs', '.py']) {
  const base = path.join(root, relative);
  if (!fs.existsSync(base)) return [];
  const output = [];
  const walk = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (['node_modules', 'dist', '.next', '.venv'].includes(entry.name)) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else if (extensions.includes(path.extname(entry.name))) output.push(absolute);
    }
  };
  walk(base);
  return output;
}

const rules = [
  {
    scope: 'providers',
    forbidden: [
      /@prisma\/client/,
      /typeorm/,
      /from ['"]pg['"]/,
      /import postgres/,
      /@elastic/,
      /neo4j/,
      /clickhouse/,
    ],
    reason: 'Provider Runner نباید کلاینت Data Plane داشته باشد.',
  },
  {
    scope: 'apps/web',
    forbidden: [/apps\/api/, /@mohtavayab\/api/],
    reason: 'Web نباید Source داخلی API را import کند.',
  },
  {
    scope: 'apps/api',
    forbidden: [/providers\//, /provider-template/],
    reason: 'Core API نباید پیاده‌سازی Provider را import کند.',
  },
  {
    scope: 'packages/contracts',
    forbidden: [/apps\//, /providers\//],
    reason: 'Contracts باید مستقل از App و Provider باشد.',
  },
];

for (const rule of rules) {
  for (const file of filesBelow(rule.scope)) {
    const content = fs.readFileSync(file, 'utf8');
    for (const pattern of rule.forbidden) {
      if (pattern.test(content)) errors.push(`${path.relative(root, file)}: ${rule.reason}`);
    }
  }
}

for (const file of filesBelow('apps')) {
  const content = fs.readFileSync(file, 'utf8');
  if (/console\.log\s*\(\s*(request|req)\.(body|headers)/.test(content)) {
    errors.push(`${path.relative(root, file)}: ثبت body/header درخواست ممنوع است.`);
  }
}

const system = JSON.parse(
  fs.readFileSync(path.join(root, 'architecture/system-model.json'), 'utf8'),
);
const dataComponents = new Set(
  system.components
    .filter((component) => component.zone === 'data')
    .map((component) => component.id),
);
const directProviderData = system.connections.filter(
  (connection) =>
    connection.from === 'provider-runner' &&
    dataComponents.has(connection.to) &&
    !['vault', 'minio'].includes(connection.to),
);
if (directProviderData.length)
  errors.push('system-model: دسترسی مستقیم Provider به Data Plane پیدا شد.');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(
  JSON.stringify({
    ok: true,
    rules: rules.length,
    scanned_scopes: rules.map((item) => item.scope),
  }),
);
