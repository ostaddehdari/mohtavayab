import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const releases = [
  { id: 'R01', title: 'کشف محصول و طراحی مبنا', goal: 'قفل‌کردن دامنه، ریسک، معماری و تجربه کاربری پیش از توسعه سنگین' },
  { id: 'R02', title: 'هسته پلتفرم', goal: 'ساخت زیرساخت چندمستاجری، امنیت، قرارداد Provider و گردش‌کار پایدار' },
  { id: 'R03', title: 'حساب‌ها، منابع و رسانه', goal: 'اتصال امن حساب‌ها و آماده‌سازی مدیریت ظرفیت و فایل' },
  { id: 'R04', title: 'استخراج و کتابخانه محتوا', goal: 'ساخت مسیر کامل Backfill، Watch و مدل محتوای واحد' },
  { id: 'R05', title: 'Providerهای MVP', goal: 'تحویل تلگرام، اینستاگرام، ایتا، بله و تلوبیون با آزمون واقعی' },
  { id: 'R06', title: 'گسترش Providerها ـ موج اول', goal: 'افزودن روبیکا، سروش، یوتیوب، پینترست و X' },
  { id: 'R07', title: 'گسترش Providerها ـ موج دوم', goal: 'افزودن TikTok، LinkedIn، Meta، وب/RSS و ویدئوی ایرانی' },
  { id: 'R08', title: 'جست‌وجو و مجموعه محتوا', goal: 'تحویل جست‌وجوی حرفه‌ای فارسی و Collection چندشبکه‌ای' },
  { id: 'R09', title: 'قوانین و هوش مصنوعی', goal: 'ویرایش غیرمخرب، AI Gateway و گردش تأیید' },
  { id: 'R10', title: 'انتقال و برنامه‌ریز انتشار', goal: 'انتقال امن چندمقصدی و تقویم اختصاصی هر شبکه' },
  { id: 'R11', title: 'تحلیل، ترند و گراف', goal: 'ساخت رصد هفتگی، تحلیل رقبا و روابط قابل استناد' },
  { id: 'R12', title: 'سخت‌سازی و عرضه', goal: 'آماده‌سازی Production و انتشار زیر srun.ir/mohtavayab' },
];

const stageRows = [
  ['R01','تعریف محصول، پرسونا و KPI',['منشور محصول و مرز دامنه','پرسونا و سفر کاربر','KPI و رویدادهای اندازه‌گیری','بک‌لاگ و اولویت‌بندی'],[]],
  ['R01','حقوق، حریم خصوصی و سیاست استفاده',['مبنای قانونی و رضایت','طبقه‌بندی داده و PII','سیاست Provider رسمی و غیررسمی','نگهداری، حذف و Export'],['S01']],
  ['R01','معماری کلان و ADRها',['مرزبندی Core و Provider','مدل استقرار و شبکه','انتخاب پایگاه‌های داده','ADR و Threat Model'],['S01','S02']],
  ['R01','Monorepo و محیط توسعه',['ساختار pnpm/Turborepo','استاندارد TypeScript و Python','Dev Container و Compose','CI پایه و کنترل کیفیت'],['S03']],
  ['R01','تحقیق UX و Design System RTL',['معماری اطلاعات','وایرفریم داشبوردها','توکن‌ها و کامپوننت‌ها','نمونه تعاملی و دسترس‌پذیری'],['S01']],

  ['R02','احراز هویت، OIDC و MFA',['ورود و ثبت‌نام','OIDC و Session','MFA و بازیابی','Device و IP Policy'],['S03','S04']],
  ['R02','Workspace، چندمستاجری و RBAC',['مدل Workspace و عضویت','Role و Permission','Tenant Isolation','دعوت و Service Account'],['S06']],
  ['R02','Provider Registry و SDK',['Manifest و Capability','قرارداد عملیات Provider','Typed Error و Versioning','Contract Test Kit'],['S03','S04']],
  ['R02','Temporal و موتور Workflow',['Worker و Task Queue','Retry و Timeout','Schedule و Signal','Versioning و Recovery'],['S04','S08']],
  ['R02','مشاهده‌پذیری، تنظیمات و Audit',['OpenTelemetry و Trace','Log و Metric','Feature Flag و Kill Switch','Audit Trail و داشبورد سلامت'],['S06','S07','S09']],

  ['R03','Wizard اتصال حساب',['Schema فرم احراز هویت','OTP، 2FA و OAuth','Bot Token و API Key','وضعیت اتصال و Revoke'],['S07','S08']],
  ['R03','Vault، Session و noVNC',['Secret Vault و Envelope Encryption','Browser Container ایزوله','noVNC موقت و Consent','Rotation و Session Recovery'],['S10','S11']],
  ['R03','Account Pool، Lease و Budget',['مدل Pool و Purpose Tag','Lease و Heartbeat','Budget و Rate Limit','Cooldown و Quarantine'],['S11','S12']],
  ['R03','منابع، مقصدها و پوشه‌بندی',['Source Resolver','Destination Registry','گروه و برچسب','Health و آخرین Sync'],['S08','S11']],
  ['R03','رسانه، MinIO و پردازش فایل',['Object Storage و Lifecycle','Upload/Download قابل ادامه','Metadata و Thumbnail','Checksum، Dedup و Transcode'],['S04','S10']],

  ['R04','Canonical Model و Migration',['Content و Source','Identity و Interaction','Media و Metric Snapshot','Migration و Seed'],['S07','S08','S15']],
  ['R04','Extraction Job و Backfill',['Wizard ساخت Job','Range و Strategy','Subtask و Progress','Pause، Resume و Cancel'],['S09','S13','S14','S16']],
  ['R04','Cursor، Checkpoint و Idempotency',['Cursor Schema نسخه‌دار','Checkpoint تراکنشی','Unique Key و Hash','Recovery و Replay'],['S16','S17']],
  ['R04','Watch و صف انتظار',['Waiting Queue','Polling و Webhook','Backoff و Jitter','Freshness SLA و Alert'],['S09','S18']],
  ['R04','کتابخانه محتوای چندشبکه‌ای',['Grid و Table','نمای جزئیات محتوا','Raw/Processed و Diff','Bulk Action و Download'],['S05','S16','S17']],

  ['R05','Provider تلگرام',['انتقال مفاهیم teltest','Telethon Session و Pool','History، Watch و Media','Forward و Publish'],['S08','S13','S18','S20']],
  ['R05','Provider اینستاگرام',['اتصال instradar و aiograpi','Playwright/noVNC و Challenge','Post، Reel، Story و Comment','Metrics، Media و Publish'],['S08','S12','S13','S18','S20']],
  ['R05','Provider ایتا',['EitaaBun Adapter','OTP، Session و Pool','History، Watch و Media','Forward و Publish'],['S08','S13','S18','S20']],
  ['R05','Provider بله',['bale-sdk Adapter','OTP، Session و Pool','History، Watch و Media','Forward و Publish'],['S08','S13','S18','S20']],
  ['R05','Provider تلوبیون',['اتصال TelewebionCrowler','کاتالوگ و Program Resolver','Queue، Resume و Checkpoint','Permalink، Metadata و مجوز رسانه'],['S08','S15','S18','S20']],

  ['R06','Provider روبیکا',['POC کتابخانه‌های Rubx/Pyrubi','ورود، Session و Pool','History، Watch و Media','Publish و گواهی Provider'],['S08','S13','S18','S20']],
  ['R06','Provider سروش‌پلاس',['ارزیابی API و SplusPy','ورود و مدیریت نشست','History، Watch و Media','Publish و گواهی Provider'],['S08','S13','S18','S20']],
  ['R06','Provider یوتیوب',['OAuth و Channel Registry','YouTube Data API','yt-dlp و Media Policy','Upload، Shorts و Metrics'],['S08','S13','S15','S20']],
  ['R06','Provider پینترست',['OAuth و Board Registry','Search و Pin Extraction','PinterestDownloader Fallback','Create Pin و Metrics'],['S08','S13','S15','S20']],
  ['R06','Provider X / Twitter',['OAuth و API رسمی','Search، Timeline و Thread','Media و Metrics','Twikit آزمایشی و Risk Flag'],['S08','S13','S15','S20']],

  ['R07','Provider TikTok',['API و روش اتصال','Profile، Video و Search','Media و Metrics','Publish/Export و Risk Gate'],['S08','S13','S15','S20']],
  ['R07','Provider LinkedIn',['OAuth و Organization','Post و Comment','Media و Analytics','Publish و Permission Review'],['S08','S13','S15','S20']],
  ['R07','Facebook و Threads',['Meta OAuth و Asset Registry','Page/Profile Content','Comment و Insight','Publish و Capability Split'],['S08','S13','S15','S20']],
  ['R07','وب، خبر، RSS و Sitemap',['RSS/Atom Reader','Crawler و Robots Policy','Article Extraction و Canonical URL','Change Detection و Screenshot Metadata'],['S08','S15','S16','S20']],
  ['R07','آپارات، Vimeo و ویدئوی عمومی',['Account و Channel Resolver','Metadata و Playlist','Media و Caption','Upload و Metrics'],['S08','S13','S15','S20']],

  ['R08','نرمال‌سازی و ایندکس فارسی',['Normalizer فارسی','Analyzer و Tokenizer','Indexer افزایشی','Reindex و Golden Dataset'],['S16','S20']],
  ['R08','جست‌وجوی Faceted و Hybrid',['Query DSL','Facet و Range','BM25 و Vector','Highlight و Relevance'],['S36']],
  ['R08','Saved Search، Alert و Export',['ذخیره Query','اشتراک و Permission','Alert و Digest','CSV/XLSX/JSONL Export'],['S37']],
  ['R08','Collection چندشبکه‌ای',['Collection دستی','Collection پویا','Drag and Drop و Pin','Bulk Action و Snapshot'],['S20','S37']],
  ['R08','جزئیات محتوا، Provenance و دانلود',['Permalink و Provider Badge','Provenance و Run Trace','Media Preview و Download','Version، Relation و Metric'],['S20','S37']],

  ['R09','Rule Engine: Filter و Sanitize',['Rule DSL','Keyword/Regex/Domain Filter','Link و HTML Sanitizer','Dry Run و Rule Test'],['S16','S20']],
  ['R09','Transform و Media Pipeline',['Prefix/Suffix/Template','Attribution و Link Rewrite','Resize/Transcode/Watermark','Destination Validation'],['S15','S41']],
  ['R09','AI Gateway و Prompt Registry',['OpenAI-compatible Gateway','Local Model Connector','Prompt Version و JSON Schema','Budget، Fallback و Circuit Breaker'],['S10','S16']],
  ['R09','وظایف هوش مصنوعی محتوا',['خلاصه و بازنویسی','ترجمه و عنوان','Tag/Topic/Entity','Sentiment و Similarity'],['S43']],
  ['R09','نسخه‌بندی، Diff و Approval',['Content Version','Before/After Diff','یک/دو مرحله Approval','Human Override و Audit'],['S41','S42','S43','S44']],

  ['R10','Capability Form مقصد',['JSON Schema فرم انتشار','Dynamic Form Renderer','Server Validation','Provider Preset و Preview'],['S08','S14','S45']],
  ['R10','Transfer Engine و Native Forward',['Selector و Transfer Plan','Native Forward','Copy و Re-upload','Multi-destination Fan-out'],['S09','S15','S18','S45','S46']],
  ['R10','آپلود رسانه و سازگاری مقصد',['Compatibility Matrix','Streaming/Temp Cache','Multipart Resume','Post-upload Verify'],['S15','S42','S47']],
  ['R10','تقویم و صف انتشار',['Day/Week/Month Calendar','Drag and Drop','Timezone و Conflict','Recurring و Blackout'],['S05','S46','S47']],
  ['R10','Receipt، Retry و ایمنی انتشار',['Delivery Receipt','Retry/Dead Letter','Dry Run و Allowlist','Cancel Window و Incident Action'],['S09','S47','S48','S49']],

  ['R11','Metric Snapshot و Trend Engine',['Metric Collector','Window Aggregation','Baseline/Lift/Burst','Trend Drill-down'],['S16','S18','S36']],
  ['R11','گزارش هفتگی هشتگ و موضوع',['Hashtag/Topic Model','Unique Author و Diversity','Engagement و Spam Penalty','Weekly Report و Export'],['S51']],
  ['R11','تحلیل رقبا و Benchmark',['Competitor Registry','Publishing Cadence','Content/Hashtag Benchmark','Outlier و Best Time'],['S14','S37','S51']],
  ['R11','گراف تعامل و انتشار',['Interaction Edge ETL','Neo4j Projection','Centrality و Community','Cascade و Evidence Drill-down'],['S16','S18','S51']],
  ['R11','Entity Resolution و Graph UI',['Candidate Matching','Confidence و Evidence','Human Merge/Undo','Interactive Graph و Timeline'],['S05','S54']],

  ['R12','کارایی، ظرفیت و هزینه',['Load Model','Horizontal Scaling','Query/Storage Tuning','Cost Dashboard و Quota'],['S10','S18','S37','S51']],
  ['R12','امنیت، تست نفوذ و Supply Chain',['SAST/DAST/Secret Scan','SBOM و Image Signing','Pentest و Remediation','Abuse Detection و Suspension'],['S02','S10','S12']],
  ['R12','پشتیبان‌گیری و Disaster Recovery',['Backup و PITR','Object Versioning','Restore Drill','RPO/RTO و Runbook'],['S10','S15','S16']],
  ['R12','Pilot، مهاجرت و آموزش',['Pilot Workspace','Migration از پروژه‌های قبلی','Training و Help Center','Feedback و Go/No-Go'],['S20','S25','S40','S45','S50','S55']],
  ['R12','استقرار srun.ir/mohtavayab و عرضه',['Next.js basePath','Nginx و TLS','Blue/Green و Health Check','Launch، SLA و عملیات روز دوم'],['S56','S57','S58','S59']],
];

const taskTemplates = [
  { key: 'A', title: (work) => `تعریف دامنه، سناریو و معیار پذیرش «${work}»`, type: 'analysis', estimate_days: 0.5 },
  { key: 'D', title: (work) => `طراحی قرارداد، مدل داده و خطاهای «${work}»`, type: 'design', estimate_days: 1 },
  { key: 'I', title: (work) => `پیاده‌سازی مسیر انتهابه‌انتهای «${work}»`, type: 'implementation', estimate_days: 2 },
  { key: 'H', title: (work) => `افزودن مجوز، تله‌متری و حالت‌های شکست «${work}»`, type: 'hardening', estimate_days: 1 },
  { key: 'V', title: (work) => `آزمون، مستند و دموی پذیرش «${work}»`, type: 'verification', estimate_days: 0.5 },
];

const ownerFor = (title) => {
  if (/UX|UI|داشبورد|تقویم|فرم|Graph UI|Design/.test(title)) return 'frontend-product';
  if (/Provider|تلگرام|اینستاگرام|ایتا|بله|روبیکا|سروش|یوتیوب|پینترست|Twitter|TikTok|LinkedIn|Facebook|Threads|آپارات|Vimeo|تلوبیون/.test(title)) return 'provider-engineering';
  if (/OpenSearch|جست‌وجو|ClickHouse|Metric|Trend|گراف|Neo4j|Entity|Benchmark/.test(title)) return 'data-search';
  if (/امنیت|Vault|OIDC|RBAC|MFA|Supply|حریم/.test(title)) return 'security-platform';
  if (/استقرار|Nginx|Backup|Disaster|Observability|Temporal|Workflow|CI|ظرفیت/.test(title)) return 'platform-sre';
  return 'backend-fullstack';
};

let stageNumber = 0;
const stages = stageRows.map(([release, title, workTitles, deps]) => {
  stageNumber += 1;
  const stageId = `S${String(stageNumber).padStart(2, '0')}`;
  const works = workTitles.map((workTitle, workIndex) => {
    const workId = `${stageId}-W${String(workIndex + 1).padStart(2, '0')}`;
    const tasks = taskTemplates.map((template, taskIndex) => ({
      id: `${workId}-T${String(taskIndex + 1).padStart(2, '0')}`,
      title: template.title(workTitle),
      type: template.type,
      estimate_days: template.estimate_days,
      owner_role: ownerFor(workTitle),
      depends_on: taskIndex === 0 ? [] : [`${workId}-T${String(taskIndex).padStart(2, '0')}`],
      done_when: taskIndex === 4
        ? 'آزمون خودکار سبز، مستند به‌روز، تله‌متری قابل مشاهده و پذیرش مالک محصول ثبت شده باشد.'
        : 'خروجی قابل بازبینی در Pull Request ثبت و معیار پذیرش مرتبط پاس شده باشد.',
    }));
    return {
      id: workId,
      title: workTitle,
      owner_role: ownerFor(workTitle),
      target_person_days: 5,
      tasks,
    };
  });
  return {
    id: stageId,
    release,
    title,
    depends_on: deps,
    target_duration_weeks: '1-3',
    target_person_days: 20,
    works,
    exit_gate: 'تمام ۲۰ تسک بسته، تست‌های قرارداد/یکپارچه سبز، مستند و Runbook به‌روز و دموی پذیرش تأیید شده باشد.',
  };
});

const roadmap = {
  schema_version: '1.0.0',
  project: 'هادی / mohtavayab',
  repository: 'ostaddehdari/mohtavayab',
  deployment_url: 'https://srun.ir/mohtavayab',
  generated_from: 'Mohtavayab comprehensive technical proposal; reviewed 2026-11-06',
  planning_rules: {
    stage_count: stages.length,
    works_per_stage: 4,
    tasks_per_work: 5,
    work_count: stages.length * 4,
    task_count: stages.length * 4 * 5,
    task_size: '0.5 تا 2 نفر-روز؛ هر تسک باید در یک PR کوچک قابل بازبینی باشد.',
    wip_limit: 'حداکثر 2 ورک فعال برای هر تیم و حداکثر 1 تسک فعال برای هر توسعه‌دهنده.',
  },
  releases,
  stages,
};

const counts = {
  releases: releases.length,
  stages: stages.length,
  works: stages.reduce((sum, stage) => sum + stage.works.length, 0),
  tasks: stages.reduce((sum, stage) => sum + stage.works.reduce((n, work) => n + work.tasks.length, 0), 0),
};

if (counts.releases !== 12 || counts.stages !== 60 || counts.works !== 240 || counts.tasks !== 1200) {
  throw new Error(`Invalid roadmap counts: ${JSON.stringify(counts)}`);
}

fs.writeFileSync(path.join(root, 'roadmap', 'roadmap.json'), `${JSON.stringify(roadmap, null, 2)}\n`);

const index = [];
index.push('# نمای کلان برنامه اجرایی محتوا‌یاب');
index.push('');
index.push('این فایل نمای مدیریتی برنامه است. جزئیات همهٔ ۱۲۰۰ تسک در [WBS_FA.md](./WBS_FA.md) و نسخهٔ ماشین‌خوان در [roadmap.json](./roadmap.json) قرار دارد.');
index.push('');
index.push(`- **${counts.releases} ریلِیز**`);
index.push(`- **${counts.stages} استیج**`);
index.push(`- **${counts.works} ورک**؛ دقیقاً ۴ ورک در هر استیج`);
index.push(`- **${counts.tasks} تسک**؛ دقیقاً ۵ تسک در هر ورک`);
index.push('- اندازهٔ هر تسک: ۰٫۵ تا ۲ نفر-روز و قابل تحویل در یک Pull Request کوچک');
index.push('');
index.push('## ترتیب ریلِیزها');
index.push('');
index.push('| ریلِیز | عنوان | هدف | استیج‌ها |');
index.push('|---|---|---|---|');
for (const release of releases) {
  const ids = stages.filter((stage) => stage.release === release.id).map((stage) => stage.id).join('، ');
  index.push(`| ${release.id} | ${release.title} | ${release.goal} | ${ids} |`);
}
index.push('');
index.push('## فهرست ۶۰ استیج');
index.push('');
index.push('| استیج | ریلِیز | عنوان | وابستگی | خروجی |');
index.push('|---|---|---|---|---|');
for (const stage of stages) {
  const workNames = stage.works.map((work) => work.title).join('؛ ');
  index.push(`| ${stage.id} | ${stage.release} | ${stage.title} | ${stage.depends_on.join('، ') || '—'} | ${workNames} |`);
}
index.push('');
index.push('## مسیرهای تحویل');
index.push('');
index.push('- **MVP داخلی:** S01 تا S25، سپس S36 تا S50 برای جست‌وجو، Rule و انتقال.');
index.push('- **Provider Expansion:** استیج‌های S26 تا S35 فقط پس از گواهی Contract و حساب آزمایشی فعال می‌شوند.');
index.push('- **Analytics:** S51 تا S55 پس از تثبیت Canonical Model و کیفیت داده اجرا می‌شوند.');
index.push('- **Production:** S56 تا S60؛ انتشار عمومی فقط پس از Restore Drill، Pentest و Go/No-Go پایلوت.');
index.push('');
index.push('## سیاست اجرا');
index.push('');
index.push('هر Stage یک Milestone، هر Work یک Issue والد و هر Task یک Issue/PR مستقل است. شناسهٔ Stage/Work/Task باید در نام Branch، عنوان PR، پیام Commit و رویداد Audit درج شود.');
fs.writeFileSync(path.join(root, 'roadmap', 'STAGE_INDEX_FA.md'), `${index.join('\n')}\n`);

const wbs = [];
wbs.push('# ساختار شکست کار (WBS) ـ هادی / mohtavayab');
wbs.push('');
wbs.push('> منبع حقیقت ماشین‌خوان این سند `roadmap/roadmap.json` است. این فایل برای مرور انسانی تولید شده است.');
wbs.push('');
wbs.push('## قواعد ثابت');
wbs.push('');
wbs.push('- هر استیج ۴ ورک و هر ورک ۵ تسک دارد؛ بنابراین هر استیج دقیقاً ۲۰ تسک دارد.');
wbs.push('- تسک نباید بیشتر از دو نفر-روز باشد. تسک بزرگ‌تر باید پیش از شروع شکسته شود.');
wbs.push('- هیچ قابلیت بدون حالت‌های Loading، Empty، Partial، Failed، Permission denied و Needs action تکمیل نیست.');
wbs.push('- Provider فقط بعد از Contract Test، تست رسانه واقعی و Kill Switch قابل فعال‌سازی است.');
wbs.push('- تعریف Done شامل کد، تست، Migration، Telemetry، مستند، Runbook و دموی پذیرش است.');
wbs.push('');
for (const release of releases) {
  wbs.push(`## ${release.id} ـ ${release.title}`);
  wbs.push('');
  wbs.push(release.goal);
  wbs.push('');
  for (const stage of stages.filter((item) => item.release === release.id)) {
    wbs.push(`### ${stage.id} ـ ${stage.title}`);
    wbs.push('');
    wbs.push(`**وابستگی:** ${stage.depends_on.join('، ') || 'ندارد'}  `);
    wbs.push(`**بودجه:** ${stage.target_person_days} نفر-روز  `);
    wbs.push(`**دروازه خروج:** ${stage.exit_gate}`);
    wbs.push('');
    for (const work of stage.works) {
      wbs.push(`#### ${work.id} ـ ${work.title}`);
      wbs.push('');
      wbs.push(`مالک پیشنهادی: \`${work.owner_role}\` | بودجه: ${work.target_person_days} نفر-روز`);
      wbs.push('');
      for (const task of work.tasks) {
        wbs.push(`- [ ] **${task.id}** — ${task.title} — ${task.estimate_days} نفر-روز`);
      }
      wbs.push('');
    }
  }
}
fs.writeFileSync(path.join(root, 'roadmap', 'WBS_FA.md'), `${wbs.join('\n')}\n`);

console.log(JSON.stringify(counts));
