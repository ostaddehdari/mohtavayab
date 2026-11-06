import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const roadmap = JSON.parse(fs.readFileSync(path.join(root, 'roadmap', 'roadmap.json'), 'utf8'));
const errors = [];
const ids = new Set();

const addId = (id) => {
  if (ids.has(id)) errors.push(`شناسه تکراری: ${id}`);
  ids.add(id);
};

if (roadmap.releases.length !== 12) errors.push('تعداد ریلِیز باید ۱۲ باشد.');
if (roadmap.stages.length !== 60) errors.push('تعداد استیج باید ۶۰ باشد.');

let works = 0;
let tasks = 0;
for (const stage of roadmap.stages) {
  addId(stage.id);
  if (stage.works.length !== 4) errors.push(`${stage.id}: تعداد ورک باید ۴ باشد.`);
  works += stage.works.length;
  for (const work of stage.works) {
    addId(work.id);
    if (!work.id.startsWith(`${stage.id}-`)) errors.push(`${work.id}: پیشوند Stage نامعتبر است.`);
    if (work.tasks.length !== 5) errors.push(`${work.id}: تعداد تسک باید ۵ باشد.`);
    tasks += work.tasks.length;
    for (const task of work.tasks) {
      addId(task.id);
      if (!task.id.startsWith(`${work.id}-`)) errors.push(`${task.id}: پیشوند Work نامعتبر است.`);
      if (task.estimate_days < 0.5 || task.estimate_days > 2) errors.push(`${task.id}: برآورد خارج از بازه ۰٫۵ تا ۲ روز است.`);
      if (!task.done_when) errors.push(`${task.id}: معیار Done ندارد.`);
    }
  }
}

for (const stage of roadmap.stages) {
  for (const dependency of stage.depends_on) {
    if (!ids.has(dependency)) errors.push(`${stage.id}: وابستگی ناشناخته ${dependency}`);
  }
  for (const work of stage.works) {
    for (const task of work.tasks) {
      for (const dependency of task.depends_on) {
        if (!ids.has(dependency)) errors.push(`${task.id}: وابستگی ناشناخته ${dependency}`);
      }
    }
  }
}

if (works !== 240) errors.push(`تعداد Work نادرست: ${works}`);
if (tasks !== 1200) errors.push(`تعداد Task نادرست: ${tasks}`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, releases: 12, stages: 60, works, tasks }));

