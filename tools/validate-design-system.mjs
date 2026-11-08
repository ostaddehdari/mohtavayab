import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const json = (name) => JSON.parse(read(name));
const errors = [];
const webPackage = json('apps/web/package.json');
const motionBudget = json('design/motion-budget.json');
const ia = json('design/information-architecture.json');
const styles = read('apps/web/src/app/styles.css');

for (const dependency of [
  'motion',
  'gsap',
  'lenis',
  'three',
  '@rive-app/react-canvas',
  '@fortawesome/react-fontawesome',
  '@mohtavayab/ui',
]) {
  if (!webPackage.dependencies?.[dependency]) errors.push(`وابستگی رابط مفقود: ${dependency}`);
}

const engines = new Set(motionBudget.engines?.map((engine) => engine.id));
for (const engine of ['motion', 'gsap-scrolltrigger', 'lenis', 'three', 'rive']) {
  if (!engines.has(engine)) errors.push(`موتور حرکت در بودجه مفقود: ${engine}`);
}

for (const file of [
  'apps/web/src/components/landing/smooth-scroll.tsx',
  'apps/web/src/components/landing/story-reveal.tsx',
  'apps/web/src/components/landing/network-canvas.tsx',
  'apps/web/src/components/landing/rive-transfer.tsx',
  'apps/web/src/components/dashboard/dashboard-shell.tsx',
  'packages/ui/src/tokens.css',
  'design/tokens.json',
])
  if (!fs.existsSync(path.join(root, file))) errors.push(`فایل طراحی مفقود: ${file}`);

if (!read('apps/web/src/components/landing/smooth-scroll.tsx').includes("import('lenis')"))
  errors.push('Lenis باید Lazy باشد.');
if (
  !read('apps/web/src/components/landing/story-reveal.tsx').includes("import('gsap/ScrollTrigger')")
)
  errors.push('ScrollTrigger باید فعال باشد.');
if (!read('apps/web/src/components/landing/network-canvas.tsx').includes("import('three')"))
  errors.push('Three.js باید Lazy باشد.');
if (!read('apps/web/src/components/landing/landing-page.tsx').includes('dynamic('))
  errors.push('Rive باید Dynamic import شود.');
if (!styles.includes('@media (prefers-reduced-motion: reduce)'))
  errors.push('CSS Reduced Motion مفقود است.');
if (!styles.includes('right: 0') || !styles.includes('var(--sidebar-expanded)'))
  errors.push('سایدبار راست جمع‌شونده مفقود است.');
if (ia.direction !== 'rtl') errors.push('معماری اطلاعات باید RTL باشد.');

const rivePath = path.join(root, 'apps/web/public/rive/transfer-demo.riv');
if (!fs.existsSync(rivePath)) errors.push('دارایی Rive مفقود است.');
else {
  const sha = crypto.createHash('sha256').update(fs.readFileSync(rivePath)).digest('hex');
  if (sha !== '46bb250cde0b0223a15faddac33d08fa00d4b6acebc2e4e827391ae0113768a3')
    errors.push('Checksum دارایی Rive نادرست است.');
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(
  JSON.stringify({
    ok: true,
    direction: ia.direction,
    engines: [...engines],
    sidebar: { expanded: 280, compact: 80 },
    reduced_motion: true,
  }),
);
