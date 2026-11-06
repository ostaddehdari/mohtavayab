# مبنای قانونی، رضایت و شفافیت

شناسه تحویل: `S02-W01`  
نسخه: `1.0.0`  
وضعیت: خط‌مشی مهندسی؛ نیازمند تأیید وکیل در هر حوزه قضایی

> این سند جایگزین مشاوره حقوقی نیست. پیش از عرضه عمومی باید حوزه‌های قضایی، نقش Controller/Processor، شرایط استفاده شبکه‌ها و متن قرارداد مشتری توسط وکیل بررسی شود.

## اصل تصمیم

هر عملیات پردازش باید پیش از اجرا دارای `purpose_code`، مبنای مستند، دامنه داده، مدت نگهداری، گیرندگان و مسیر لغو/اعتراض باشد. «داده عمومی» به معنی «داده بدون محدودیت حقوقی یا حریم خصوصی» نیست.

اگر محصول به افراد در EEA عرضه شود یا رفتار آن‌ها را پایش کند، ارزیابی شمول GDPR و سایر مقررات لازم است. مبانی طراحی این سند شامل قانونمندی، شفافیت، محدودیت هدف، کمینه‌سازی، صحت و محدودیت نگهداری است.

## نقش‌ها

| سناریو | نقش پیشنهادی محتوا‌یاب | نقش Workspace | تصمیم لازم |
|---|---|---|---|
| مدیریت اعضا و حساب خود محصول | Controller | Data subject/customer | Privacy notice و مبنای قرارداد/الزام/منافع مشروع |
| استخراج به دستور مشتری | Processor یا independent controller بسته به هدف | Controller یا joint controller | DPA و تعیین دستور پردازش |
| تحلیل تجمیعی سلامت سرویس | Controller | منبع داده محدود | De-identification و opt-out/notice |
| AI ابری روی متن مشتری | Processor + subprocessor chain | Controller | رضایت/قرارداد، محل داده و فهرست subprocessors |
| Provider API | API client تحت شرایط Provider | Account holder | Scope و terms record اختصاصی |

نقش نهایی با نام‌گذاری قراردادی تعیین نمی‌شود؛ واقعیت تصمیم‌گیری درباره هدف و ابزار پردازش باید بررسی شود.

## Purpose Registry

| کد | هدف | داده حداقلی | مبنای قابل بررسی | پیش‌فرض |
|---|---|---|---|---|
| `PUR-AUTH` | ورود و امنیت حساب | شناسه، MFA، Device/session | قرارداد، منافع مشروع امنیتی یا الزام قانونی | فعال |
| `PUR-CONNECT` | اتصال حساب Provider | Scope، token/session reference | دستور و مجوز صریح دارنده حساب + قرارداد | نیازمند اقدام کاربر |
| `PUR-INGEST` | استخراج منبع مجاز | محتوا، نویسنده، زمان، media metadata | قرارداد/دستور مشتری؛ در صورت personal data ارزیابی مبنای مستقل | خاموش تا ساخت Job |
| `PUR-MONITOR` | Watch و Metric refresh | Cursor و snapshot | همان مبنای Source + محدودیت هدف | opt-in برای هر Source |
| `PUR-SEARCH` | ایندکس و جست‌وجو | متن/metadata لازم | سازگار با هدف ingest | فعال در Workspace |
| `PUR-AI` | پردازش AI | نسخه انتخابی محتوا | قرارداد/رضایت و سیاست خروج داده | خاموش برای مدل ابری |
| `PUR-PUBLISH` | انتقال و انتشار | نسخه مقصد و receipt | دستور Publisher مجاز | Preview/Approval |
| `PUR-ANALYTICS` | KPI محصول | رویداد pseudonymous | منافع مشروع/رضایت برحسب حوزه | کمینه و قابل کنترل |
| `PUR-SECURITY` | تشخیص سوءاستفاده | Audit/security metadata | منافع مشروع/الزام امنیتی | فعال و محدود |

## شرایط معتبر رضایت

- مشخص، آگاهانه، آزادانه و قابل اثبات باشد.
- Purpose، Provider، Scope، داده، مدت و گیرنده را جداگانه نشان دهد.
- اتصال حساب با پذیرش تبلیغات یا AI ابری Bundle نشود.
- عدم رضایت نباید قابلیت نامرتبط را مسدود کند.
- لغو به سادگی اعطا باشد و اثر آینده آن روشن نمایش داده شود.
- نسخه متن اطلاع‌رسانی و Policy ثبت شود؛ خود متن Secret یا Credential نباشد.
- رضایت پیش‌فرض خاموش، checkbox از پیش انتخاب‌شده ممنوع و UI گمراه‌کننده ممنوع است.

## Consent Receipt Contract

```json
{
  "receipt_id": "uuid",
  "tenant_id": "uuid",
  "actor_id": "uuid",
  "subject_id": "uuid|null",
  "purpose_codes": ["PUR-CONNECT"],
  "provider_code": "youtube",
  "scope_codes": ["read_channel", "publish_video"],
  "notice_version": "privacy-1.0.0",
  "provider_terms_version": "2026-11-07",
  "granted_at": "ISO-8601",
  "expires_at": null,
  "revoked_at": null,
  "evidence_hash": "sha256",
  "capture_channel": "web",
  "legal_profile_id": "uuid"
}
```

IP کامل و User-Agent خام فقط وقتی ضرورت اثبات و سیاست نگهداری مصوب دارد ذخیره شود؛ در حالت عادی شناسه رویداد و Evidence hash کافی است.

## جریان اتصال حساب

1. نمایش نام Provider، رسمی/غیررسمی‌بودن، Scopeها، ریسک، داده دریافتی و مدت نگهداری.
2. دریافت اقدام مثبت کاربر و ثبت Consent Receipt.
3. انتقال به OAuth/OTP/noVNC بدون دریافت رمز در Core.
4. اجرای Capability check و نمایش دسترسی واقعی.
5. امکان Revoke فوری؛ توقف Jobهای وابسته و شروع deletion workflow طبق Policy.
6. اتصال مجدد نیازمند Receipt تازه در صورت تغییر Scope یا Terms است.

## Legitimate Interest Assessment Gate

هر پردازش مبتنی بر منافع مشروع باید سه بخش ثبت‌شده داشته باشد:

- Purpose test: هدف واقعی و مشروع چیست؟
- Necessity test: آیا روش کم‌داده‌تری وجود دارد؟
- Balancing test: انتظار معقول، حساسیت، اثر، کودکان و امکان اعتراض چیست؟

نتیجه `allow`، `allow_with_controls` یا `deny` است. پایش گسترده، داده حساس، کودکان یا Entity Resolution پرریسک بدون DPIA و تأیید حقوقی فعال نمی‌شود.

## حقوق و درخواست‌ها

پلتفرم باید مسیر احراز هویت و ثبت درخواست برای Access، Correction، Export/Portability، Restriction، Objection، Withdrawal و Erasure داشته باشد. مهلت عملیاتی پیش‌فرض ۳۰ روز است، اما Provider یا قانون می‌تواند مهلت کوتاه‌تری تحمیل کند.

## Failure States

- مبنا یا Purpose مفقود: Job ساخته نمی‌شود.
- Scope تغییرکرده: Account در `needs_reconsent` قرار می‌گیرد.
- Consent لغوشده: پردازش آینده متوقف و deletion workflow آغاز می‌شود.
- تضاد قرارداد/Provider: سخت‌گیرانه‌ترین Policy اجرا و پرونده به Legal review می‌رود.
- درخواست شخص بدون احراز: داده تحویل/حذف نمی‌شود؛ جریان Verification آغاز می‌گردد.

## معیار پذیرش W01

- Purpose Registry و نقش‌های پردازشی تعریف شده‌اند.
- رضایت granular، نسخه‌دار، قابل لغو و قابل اثبات است.
- اتصال حساب بدون Consent Receipt و Scope معتبر ممکن نیست.
- LIA/DPIA gate و حقوق موضوع داده مسیر اجرایی دارند.
- خطاهای `missing_basis`، `needs_reconsent` و `legal_hold` مشخص‌اند.

## منابع رسمی

- GDPR، به‌ویژه مواد 3، 5، 6، 17، 20، 25، 30 و 32: https://eur-lex.europa.eu/eli/reg/2016/679/oj
- EDPB Guidelines 4/2019، Data Protection by Design and by Default: https://www.edpb.europa.eu/documents/guideline/guidelines-42019-article-25-data-protection-design-and-default_en
- EDPB Guidelines 05/2020 on consent: https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-052020-consent-under-regulation-2016679_en

