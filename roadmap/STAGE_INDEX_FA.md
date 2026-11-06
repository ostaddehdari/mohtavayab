# نمای کلان برنامه اجرایی محتوا‌یاب

این فایل نمای مدیریتی برنامه است. جزئیات همهٔ ۱۲۰۰ تسک در [WBS_FA.md](./WBS_FA.md) و نسخهٔ ماشین‌خوان در [roadmap.json](./roadmap.json) قرار دارد.

- **12 ریلِیز**
- **60 استیج**
- **240 ورک**؛ دقیقاً ۴ ورک در هر استیج
- **1200 تسک**؛ دقیقاً ۵ تسک در هر ورک
- اندازهٔ هر تسک: ۰٫۵ تا ۲ نفر-روز و قابل تحویل در یک Pull Request کوچک

## ترتیب ریلِیزها

| ریلِیز | عنوان | هدف | استیج‌ها |
|---|---|---|---|
| R01 | کشف محصول و طراحی مبنا | قفل‌کردن دامنه، ریسک، معماری و تجربه کاربری پیش از توسعه سنگین | S01، S02، S03، S04، S05 |
| R02 | هسته پلتفرم | ساخت زیرساخت چندمستاجری، امنیت، قرارداد Provider و گردش‌کار پایدار | S06، S07، S08، S09، S10 |
| R03 | حساب‌ها، منابع و رسانه | اتصال امن حساب‌ها و آماده‌سازی مدیریت ظرفیت و فایل | S11، S12، S13، S14، S15 |
| R04 | استخراج و کتابخانه محتوا | ساخت مسیر کامل Backfill، Watch و مدل محتوای واحد | S16، S17، S18، S19، S20 |
| R05 | Providerهای MVP | تحویل تلگرام، اینستاگرام، ایتا، بله و تلوبیون با آزمون واقعی | S21، S22، S23، S24، S25 |
| R06 | گسترش Providerها ـ موج اول | افزودن روبیکا، سروش، یوتیوب، پینترست و X | S26، S27، S28، S29، S30 |
| R07 | گسترش Providerها ـ موج دوم | افزودن TikTok، LinkedIn، Meta، وب/RSS و ویدئوی ایرانی | S31، S32، S33، S34، S35 |
| R08 | جست‌وجو و مجموعه محتوا | تحویل جست‌وجوی حرفه‌ای فارسی و Collection چندشبکه‌ای | S36، S37، S38، S39، S40 |
| R09 | قوانین و هوش مصنوعی | ویرایش غیرمخرب، AI Gateway و گردش تأیید | S41، S42، S43، S44، S45 |
| R10 | انتقال و برنامه‌ریز انتشار | انتقال امن چندمقصدی و تقویم اختصاصی هر شبکه | S46، S47، S48، S49، S50 |
| R11 | تحلیل، ترند و گراف | ساخت رصد هفتگی، تحلیل رقبا و روابط قابل استناد | S51، S52، S53، S54، S55 |
| R12 | سخت‌سازی و عرضه | آماده‌سازی Production و انتشار زیر srun.ir/mohtavayab | S56، S57، S58، S59، S60 |

## فهرست ۶۰ استیج

| استیج | ریلِیز | عنوان | وابستگی | خروجی |
|---|---|---|---|---|
| S01 | R01 | تعریف محصول، پرسونا و KPI | — | منشور محصول و مرز دامنه؛ پرسونا و سفر کاربر؛ KPI و رویدادهای اندازه‌گیری؛ بک‌لاگ و اولویت‌بندی |
| S02 | R01 | حقوق، حریم خصوصی و سیاست استفاده | S01 | مبنای قانونی و رضایت؛ طبقه‌بندی داده و PII؛ سیاست Provider رسمی و غیررسمی؛ نگهداری، حذف و Export |
| S03 | R01 | معماری کلان و ADRها | S01، S02 | مرزبندی Core و Provider؛ مدل استقرار و شبکه؛ انتخاب پایگاه‌های داده؛ ADR و Threat Model |
| S04 | R01 | Monorepo و محیط توسعه | S03 | ساختار pnpm/Turborepo؛ استاندارد TypeScript و Python؛ Dev Container و Compose؛ CI پایه و کنترل کیفیت |
| S05 | R01 | تحقیق UX و Design System RTL | S01 | معماری اطلاعات؛ وایرفریم داشبوردها؛ توکن‌ها و کامپوننت‌ها؛ نمونه تعاملی و دسترس‌پذیری |
| S06 | R02 | احراز هویت، OIDC و MFA | S03، S04 | ورود و ثبت‌نام؛ OIDC و Session؛ MFA و بازیابی؛ Device و IP Policy |
| S07 | R02 | Workspace، چندمستاجری و RBAC | S06 | مدل Workspace و عضویت؛ Role و Permission؛ Tenant Isolation؛ دعوت و Service Account |
| S08 | R02 | Provider Registry و SDK | S03، S04 | Manifest و Capability؛ قرارداد عملیات Provider؛ Typed Error و Versioning؛ Contract Test Kit |
| S09 | R02 | Temporal و موتور Workflow | S04، S08 | Worker و Task Queue؛ Retry و Timeout؛ Schedule و Signal؛ Versioning و Recovery |
| S10 | R02 | مشاهده‌پذیری، تنظیمات و Audit | S06، S07، S09 | OpenTelemetry و Trace؛ Log و Metric؛ Feature Flag و Kill Switch؛ Audit Trail و داشبورد سلامت |
| S11 | R03 | Wizard اتصال حساب | S07، S08 | Schema فرم احراز هویت؛ OTP، 2FA و OAuth؛ Bot Token و API Key؛ وضعیت اتصال و Revoke |
| S12 | R03 | Vault، Session و noVNC | S10، S11 | Secret Vault و Envelope Encryption؛ Browser Container ایزوله؛ noVNC موقت و Consent؛ Rotation و Session Recovery |
| S13 | R03 | Account Pool، Lease و Budget | S11، S12 | مدل Pool و Purpose Tag؛ Lease و Heartbeat؛ Budget و Rate Limit؛ Cooldown و Quarantine |
| S14 | R03 | منابع، مقصدها و پوشه‌بندی | S08، S11 | Source Resolver؛ Destination Registry؛ گروه و برچسب؛ Health و آخرین Sync |
| S15 | R03 | رسانه، MinIO و پردازش فایل | S04، S10 | Object Storage و Lifecycle؛ Upload/Download قابل ادامه؛ Metadata و Thumbnail؛ Checksum، Dedup و Transcode |
| S16 | R04 | Canonical Model و Migration | S07، S08، S15 | Content و Source؛ Identity و Interaction؛ Media و Metric Snapshot؛ Migration و Seed |
| S17 | R04 | Extraction Job و Backfill | S09، S13، S14، S16 | Wizard ساخت Job؛ Range و Strategy؛ Subtask و Progress؛ Pause، Resume و Cancel |
| S18 | R04 | Cursor، Checkpoint و Idempotency | S16، S17 | Cursor Schema نسخه‌دار؛ Checkpoint تراکنشی؛ Unique Key و Hash؛ Recovery و Replay |
| S19 | R04 | Watch و صف انتظار | S09، S18 | Waiting Queue؛ Polling و Webhook؛ Backoff و Jitter؛ Freshness SLA و Alert |
| S20 | R04 | کتابخانه محتوای چندشبکه‌ای | S05، S16، S17 | Grid و Table؛ نمای جزئیات محتوا؛ Raw/Processed و Diff؛ Bulk Action و Download |
| S21 | R05 | Provider تلگرام | S08، S13، S18، S20 | انتقال مفاهیم teltest؛ Telethon Session و Pool؛ History، Watch و Media؛ Forward و Publish |
| S22 | R05 | Provider اینستاگرام | S08، S12، S13، S18، S20 | اتصال instradar و aiograpi؛ Playwright/noVNC و Challenge؛ Post، Reel، Story و Comment؛ Metrics، Media و Publish |
| S23 | R05 | Provider ایتا | S08، S13، S18، S20 | EitaaBun Adapter؛ OTP، Session و Pool؛ History، Watch و Media؛ Forward و Publish |
| S24 | R05 | Provider بله | S08، S13، S18، S20 | bale-sdk Adapter؛ OTP، Session و Pool؛ History، Watch و Media؛ Forward و Publish |
| S25 | R05 | Provider تلوبیون | S08، S15، S18، S20 | اتصال TelewebionCrowler؛ کاتالوگ و Program Resolver؛ Queue، Resume و Checkpoint؛ Permalink، Metadata و مجوز رسانه |
| S26 | R06 | Provider روبیکا | S08، S13، S18، S20 | POC کتابخانه‌های Rubx/Pyrubi؛ ورود، Session و Pool؛ History، Watch و Media؛ Publish و گواهی Provider |
| S27 | R06 | Provider سروش‌پلاس | S08، S13، S18، S20 | ارزیابی API و SplusPy؛ ورود و مدیریت نشست؛ History، Watch و Media؛ Publish و گواهی Provider |
| S28 | R06 | Provider یوتیوب | S08، S13، S15، S20 | OAuth و Channel Registry؛ YouTube Data API؛ yt-dlp و Media Policy؛ Upload، Shorts و Metrics |
| S29 | R06 | Provider پینترست | S08، S13، S15، S20 | OAuth و Board Registry؛ Search و Pin Extraction؛ PinterestDownloader Fallback؛ Create Pin و Metrics |
| S30 | R06 | Provider X / Twitter | S08، S13، S15، S20 | OAuth و API رسمی؛ Search، Timeline و Thread؛ Media و Metrics؛ Twikit آزمایشی و Risk Flag |
| S31 | R07 | Provider TikTok | S08، S13، S15، S20 | API و روش اتصال؛ Profile، Video و Search؛ Media و Metrics؛ Publish/Export و Risk Gate |
| S32 | R07 | Provider LinkedIn | S08، S13، S15، S20 | OAuth و Organization؛ Post و Comment؛ Media و Analytics؛ Publish و Permission Review |
| S33 | R07 | Facebook و Threads | S08، S13، S15، S20 | Meta OAuth و Asset Registry؛ Page/Profile Content؛ Comment و Insight؛ Publish و Capability Split |
| S34 | R07 | وب، خبر، RSS و Sitemap | S08، S15، S16، S20 | RSS/Atom Reader؛ Crawler و Robots Policy؛ Article Extraction و Canonical URL؛ Change Detection و Screenshot Metadata |
| S35 | R07 | آپارات، Vimeo و ویدئوی عمومی | S08، S13، S15، S20 | Account و Channel Resolver؛ Metadata و Playlist؛ Media و Caption؛ Upload و Metrics |
| S36 | R08 | نرمال‌سازی و ایندکس فارسی | S16، S20 | Normalizer فارسی؛ Analyzer و Tokenizer؛ Indexer افزایشی؛ Reindex و Golden Dataset |
| S37 | R08 | جست‌وجوی Faceted و Hybrid | S36 | Query DSL؛ Facet و Range؛ BM25 و Vector؛ Highlight و Relevance |
| S38 | R08 | Saved Search، Alert و Export | S37 | ذخیره Query؛ اشتراک و Permission؛ Alert و Digest؛ CSV/XLSX/JSONL Export |
| S39 | R08 | Collection چندشبکه‌ای | S20، S37 | Collection دستی؛ Collection پویا؛ Drag and Drop و Pin؛ Bulk Action و Snapshot |
| S40 | R08 | جزئیات محتوا، Provenance و دانلود | S20، S37 | Permalink و Provider Badge؛ Provenance و Run Trace؛ Media Preview و Download؛ Version، Relation و Metric |
| S41 | R09 | Rule Engine: Filter و Sanitize | S16، S20 | Rule DSL؛ Keyword/Regex/Domain Filter؛ Link و HTML Sanitizer؛ Dry Run و Rule Test |
| S42 | R09 | Transform و Media Pipeline | S15، S41 | Prefix/Suffix/Template؛ Attribution و Link Rewrite؛ Resize/Transcode/Watermark؛ Destination Validation |
| S43 | R09 | AI Gateway و Prompt Registry | S10، S16 | OpenAI-compatible Gateway؛ Local Model Connector؛ Prompt Version و JSON Schema؛ Budget، Fallback و Circuit Breaker |
| S44 | R09 | وظایف هوش مصنوعی محتوا | S43 | خلاصه و بازنویسی؛ ترجمه و عنوان؛ Tag/Topic/Entity؛ Sentiment و Similarity |
| S45 | R09 | نسخه‌بندی، Diff و Approval | S41، S42، S43، S44 | Content Version؛ Before/After Diff؛ یک/دو مرحله Approval؛ Human Override و Audit |
| S46 | R10 | Capability Form مقصد | S08، S14، S45 | JSON Schema فرم انتشار؛ Dynamic Form Renderer؛ Server Validation؛ Provider Preset و Preview |
| S47 | R10 | Transfer Engine و Native Forward | S09، S15، S18، S45، S46 | Selector و Transfer Plan؛ Native Forward؛ Copy و Re-upload؛ Multi-destination Fan-out |
| S48 | R10 | آپلود رسانه و سازگاری مقصد | S15، S42، S47 | Compatibility Matrix؛ Streaming/Temp Cache؛ Multipart Resume؛ Post-upload Verify |
| S49 | R10 | تقویم و صف انتشار | S05، S46، S47 | Day/Week/Month Calendar؛ Drag and Drop؛ Timezone و Conflict؛ Recurring و Blackout |
| S50 | R10 | Receipt، Retry و ایمنی انتشار | S09، S47، S48، S49 | Delivery Receipt؛ Retry/Dead Letter؛ Dry Run و Allowlist؛ Cancel Window و Incident Action |
| S51 | R11 | Metric Snapshot و Trend Engine | S16، S18، S36 | Metric Collector؛ Window Aggregation؛ Baseline/Lift/Burst؛ Trend Drill-down |
| S52 | R11 | گزارش هفتگی هشتگ و موضوع | S51 | Hashtag/Topic Model؛ Unique Author و Diversity؛ Engagement و Spam Penalty؛ Weekly Report و Export |
| S53 | R11 | تحلیل رقبا و Benchmark | S14، S37، S51 | Competitor Registry؛ Publishing Cadence؛ Content/Hashtag Benchmark؛ Outlier و Best Time |
| S54 | R11 | گراف تعامل و انتشار | S16، S18، S51 | Interaction Edge ETL؛ Neo4j Projection؛ Centrality و Community؛ Cascade و Evidence Drill-down |
| S55 | R11 | Entity Resolution و Graph UI | S05، S54 | Candidate Matching؛ Confidence و Evidence؛ Human Merge/Undo؛ Interactive Graph و Timeline |
| S56 | R12 | کارایی، ظرفیت و هزینه | S10، S18، S37، S51 | Load Model؛ Horizontal Scaling؛ Query/Storage Tuning؛ Cost Dashboard و Quota |
| S57 | R12 | امنیت، تست نفوذ و Supply Chain | S02، S10، S12 | SAST/DAST/Secret Scan؛ SBOM و Image Signing؛ Pentest و Remediation؛ Abuse Detection و Suspension |
| S58 | R12 | پشتیبان‌گیری و Disaster Recovery | S10، S15، S16 | Backup و PITR؛ Object Versioning؛ Restore Drill؛ RPO/RTO و Runbook |
| S59 | R12 | Pilot، مهاجرت و آموزش | S20، S25، S40، S45، S50، S55 | Pilot Workspace؛ Migration از پروژه‌های قبلی؛ Training و Help Center؛ Feedback و Go/No-Go |
| S60 | R12 | استقرار srun.ir/mohtavayab و عرضه | S56، S57، S58، S59 | Next.js basePath؛ Nginx و TLS؛ Blue/Green و Health Check؛ Launch، SLA و عملیات روز دوم |

## مسیرهای تحویل

- **MVP داخلی:** S01 تا S25، سپس S36 تا S50 برای جست‌وجو، Rule و انتقال.
- **Provider Expansion:** استیج‌های S26 تا S35 فقط پس از گواهی Contract و حساب آزمایشی فعال می‌شوند.
- **Analytics:** S51 تا S55 پس از تثبیت Canonical Model و کیفیت داده اجرا می‌شوند.
- **Production:** S56 تا S60؛ انتشار عمومی فقط پس از Restore Drill، Pentest و Go/No-Go پایلوت.

## سیاست اجرا

هر Stage یک Milestone، هر Work یک Issue والد و هر Task یک Issue/PR مستقل است. شناسهٔ Stage/Work/Task باید در نام Branch، عنوان PR، پیام Commit و رویداد Audit درج شود.
