# گزارش پذیرش استیج S02

عنوان: حقوق، حریم خصوصی و سیاست استفاده  
وضعیت: `completed`  
تاریخ: ۱۴۰۵/۰۸/۱۶ ـ ۲۰۲۶/۱۱/۰۷

> این استیج خط‌مشی مهندسی را تحویل می‌دهد. تأیید نهایی متن Privacy Notice، Terms، DPA و حوزه‌های قضایی پیش از Production بر عهده وکیل منتخب پروژه است.

## خروجی‌ها

1. [مبنای قانونی و رضایت](./LEGAL_BASIS_CONSENT_FA.md)
2. [طبقه‌بندی داده و PII](./DATA_CLASSIFICATION_PII_FA.md)
3. [سیاست Provider رسمی و غیررسمی](./PROVIDER_GOVERNANCE_FA.md)
4. [نگهداری، حذف و Export](./RETENTION_DELETION_EXPORT_FA.md)
5. [Privacy baseline ماشین‌خوان](../../policies/privacy-baseline.json)
6. [Provider risk register](../../policies/provider-risk-register.json)
7. [Retention defaults](../../policies/retention-defaults.json)

## شواهد ۲۰ تسک

| تسک | وضعیت | Evidence |
|---|---|---|
| S02-W01-T01 | done | حوزه، نقش Controller/Processor و Purpose Registry |
| S02-W01-T02 | done | Consent Receipt contract و legal profile |
| S02-W01-T03 | done | جریان اتصال، revoke و rights request |
| S02-W01-T04 | done | LIA/DPIA، reconsent و failure states |
| S02-W01-T05 | done | معیار W01، منابع رسمی و validator |
| S02-W02-T01 | done | کلاس C0 تا C4 و برچسب‌های پرریسک |
| S02-W02-T02 | done | Data inventory و metadata contract |
| S02-W02-T03 | done | RBAC، encryption، redaction و DLP controls |
| S02-W02-T04 | done | pseudonymization، incident و breach path |
| S02-W02-T05 | done | معیار W02 و تست C4 restrictions |
| S02-W03-T01 | done | Tier A تا E و Go/No-Go gate |
| S02-W03-T02 | done | Provider Policy Profile schema |
| S02-W03-T03 | done | rules برای YouTube/Pinterest/Meta/X و ایرانی‌ها |
| S02-W03-T04 | done | Terms Monitor، kill switch و reconsent |
| S02-W03-T05 | done | معیار W03 و risk register ماشین‌خوان |
| S02-W04-T01 | done | retention baseline و effective policy |
| S02-W04-T02 | done | deletion/export contracts و deadline engine |
| S02-W04-T03 | done | حذف چندStore، tombstone و backup suppression |
| S02-W04-T04 | done | legal hold، partial failure و audit certificate |
| S02-W04-T05 | done | معیار W04، policy JSON و validator |

## Exit Gate

- [x] چهار Work و بیست Task دارای Evidence هستند.
- [x] Purpose و Consent نسخه‌دار و قابل لغو است.
- [x] C4 از Log/Search/AI/Export منع شده است.
- [x] Provider غیررسمی Production پیش‌فرض ندارد.
- [x] retention/deletion از سخت‌گیرانه‌ترین Policy پیروی می‌کند.
- [x] deletion propagation، restore suppression و Export scope تعریف شده است.
- [x] منابع رسمی و تاریخ بازبینی ثبت شده‌اند.
- [x] `node tools/validate-stage-s02.mjs` موفق است.

## تصمیم‌های قفل‌شده

- داده عمومی همچنان می‌تواند Personal Data باشد.
- هیچ Job بدون Purpose/Policy معتبر اجرا نمی‌شود.
- Password، Token، Cookie و OTP کلاس C4 و خارج Core telemetry هستند.
- Provider رسمی مسیر ترجیحی و Provider غیررسمی Pilot-gated است.
- مهلت حذف hard-coded نیست و از Policy profile نسخه‌دار می‌آید.
- Legal review پیش از Production یک Release Gate است.

## ورودی استیج بعد

S03 باید این Policyها را به مرز Core/Provider، مدل شبکه، انتخاب Storeها، ADR و Threat Model تبدیل کند.

