# هادی / محتوا‌یاب

سامانهٔ جامع اتصال حساب‌ها، استخراج و رصد داده، جست‌وجوی فارسی، تحلیل ترند و ارتباط کاربران، مدیریت محتوا و انتقال زمان‌بندی‌شده میان شبکه‌های اجتماعی.

> مقصد انتشار: **https://srun.ir/mohtavayab**  
> وضعیت مخزن: **S01 و S02 تکمیل شده‌اند؛ استیج بعد S03 ـ معماری کلان و ADRها**

## وضعیت اجرا

- ✅ **S01 ـ تعریف محصول، پرسونا و KPI:** تکمیل‌شده در ۱۶ آبان ۱۴۰۵
- ✅ **S02 ـ حقوق، حریم خصوصی و سیاست استفاده:** تکمیل‌شده در ۱۶ آبان ۱۴۰۵
- ⏭️ **S03 ـ معماری کلان و ADRها:** استیج بعدی
- [گزارش پذیرش S01](docs/product/STAGE_S01_ACCEPTANCE_FA.md)
- [گزارش پذیرش S02](docs/legal/STAGE_S02_ACCEPTANCE_FA.md)
- [ثبت ماشین‌خوان پیشرفت](roadmap/progress.json)

## اندازهٔ برنامه اجرایی

| سطح | تعداد | قاعده |
|---|---:|---|
| ریلِیز | ۱۲ | هر ریلِیز یک خروجی محصولی قابل ارزیابی دارد |
| استیج | ۶۰ | هر استیج دقیقاً ۴ ورک و ۲۰ تسک دارد |
| ورک | ۲۴۰ | هر ورک دقیقاً ۵ تسک دارد |
| تسک | ۱۲۰۰ | هر تسک ۰٫۵ تا ۲ نفر-روز و یک PR کوچک است |

- [نمای کلان ۶۰ استیج](roadmap/STAGE_INDEX_FA.md)
- [WBS کامل ۱۲۰۰ تسک](roadmap/WBS_FA.md)
- [نسخهٔ ماشین‌خوان Roadmap](roadmap/roadmap.json)
- [معماری فنی](docs/ARCHITECTURE_FA.md)
- [سیستم طراحی و تجربه کاربری](docs/UI_UX_FA.md)
- [حاکمیت تحویل و Definition of Done](docs/DELIVERY_GOVERNANCE_FA.md)
- [استقرار روی srun.ir/mohtavayab](docs/DEPLOYMENT_SRUN_FA.md)
- [ماتریس Providerها](docs/PROVIDER_MATRIX_FA.md)
- [منشور محصول](docs/product/PRODUCT_CHARTER_FA.md)
- [پرسوناها و سفرهای کاربر](docs/product/PERSONAS_JOURNEYS_FA.md)
- [KPI و Event Taxonomy](docs/product/KPI_EVENT_TAXONOMY_FA.md)
- [بک‌لاگ و اولویت‌بندی](docs/product/BACKLOG_PRIORITIZATION_FA.md)
- [مبنای قانونی و رضایت](docs/legal/LEGAL_BASIS_CONSENT_FA.md)
- [طبقه‌بندی داده و PII](docs/legal/DATA_CLASSIFICATION_PII_FA.md)
- [سیاست Providerها](docs/legal/PROVIDER_GOVERNANCE_FA.md)
- [نگهداری، حذف و Export](docs/legal/RETENTION_DELETION_EXPORT_FA.md)

## تصمیم‌های اصلی

- Frontend: **Next.js + React + TypeScript** برای استفاده درست از Motion و اکوسیستم React.
- رابط: RTL واقعی، **Vazirmatn** خودمیزبان، Font Awesome به‌صورت SVG، سایدبار راست جمع‌شونده.
- انیمیشن: Motion برای داشبورد؛ GSAP + ScrollTrigger، Lenis، Three.js و Rive به‌صورت انتخابی و Lazy در Landing و نماهای تحلیلی.
- Backend: **NestJS** برای Core و Workerهای مستقل Python/Bun برای Providerها.
- Workflow: **Temporal**؛ داده عملیاتی PostgreSQL؛ جست‌وجو OpenSearch؛ تحلیل ClickHouse؛ گراف Neo4j؛ رسانه MinIO/S3.
- Providerها با Contract، Capability Matrix، Kill Switch و آزمون حساب واقعی از Core جدا می‌مانند.

## مسیر کوتاه MVP

۱. S01 تا S20: دامنه، Core، حساب، رسانه، استخراج و کتابخانه محتوا.  
۲. S21 تا S25: تلگرام، اینستاگرام، ایتا، بله و تلوبیون.  
۳. S36 تا S40: جست‌وجوی فارسی و Collection.  
۴. S41 تا S50: Rule، AI، انتقال و تقویم انتشار.  
۵. S51 تا S60: تحلیل، سخت‌سازی، پایلوت و عرضه.

## کنترل صحت Roadmap

```bash
node tools/validate-roadmap.mjs
node tools/validate-stage-s01.mjs
node tools/validate-stage-s02.mjs
```

این فرمان تعدادها، یکتایی شناسه‌ها، وابستگی‌ها، اندازهٔ تسک‌ها و ساختار ۴×۵ هر استیج را کنترل می‌کند.

## قاعدهٔ مهم

این سامانه فقط دادهٔ عمومی یا داده‌ای را پردازش می‌کند که حساب متصل برای آن مجوز دارد. دورزدن CAPTCHA، DRM، محدودیت دسترسی یا استخراج دادهٔ خصوصی خارج از دامنهٔ محصول است.

