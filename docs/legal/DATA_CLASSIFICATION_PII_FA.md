# طبقه‌بندی داده، PII و کنترل‌های فنی

شناسه تحویل: `S02-W02`  
نسخه: `1.0.0`

## اصل

کنترل دسترسی، رمزگذاری، Log، Retention، Export و AI routing از `data_class` و `purpose_code` مشتق می‌شوند. عمومی‌بودن یک پست لزوماً Personal Data بودن نام، تصویر، شناسه، موقعیت یا ارتباطات آن را از بین نمی‌برد.

## سطوح طبقه‌بندی

| کلاس | نام | نمونه | کنترل حداقلی |
|---|---|---|---|
| C0 | عمومی غیرشخصی | نام Provider، مستند فنی، آمار کاملاً تجمیعی | Integrity، cache policy |
| C1 | داخلی | تنظیمات Workspace، backlog، feature flag | Auth، tenant scope، audit تغییر |
| C2 | شخصی/شناسه‌پذیر | handle، avatar، متن منتسب، IP، device، interaction | encryption، RBAC، retention، export/delete |
| C3 | حساس/پرریسک | موقعیت دقیق، عقیده/سلامت استنباطی، کودک، graph identity | deny-by-default، DPIA، field-level control، human approval |
| C4 | Secret/Credential | password، OTP، access token، cookie، session، private key | Vault only، never log/export/index، rotation |

## برچسب‌های تکمیلی

`direct_identifier`، `indirect_identifier`، `provider_data`، `user_generated`، `special_category_candidate`، `child_risk`، `biometric_candidate`، `security_data`، `financial`، `legal_hold` و `export_restricted`.

برچسب «candidate» مانع استفاده قطعی برای استنباط می‌شود تا تأیید انسانی/حقوقی انجام شود.

## Data Inventory

| دامنه | داده | Class | محل | Index | AI cloud | Export |
|---|---|---:|---|---|---|---|
| Account | token/session | C4 | Vault reference | ممنوع | ممنوع | ممنوع |
| Account | handle/display name | C2 | PostgreSQL | محدود | ممنوع پیش‌فرض | مالک Workspace |
| Content | raw text/permalink | C2 | PostgreSQL/OpenSearch | tenant-aware | با Policy | بله با provenance |
| Media | image/video/audio | C2/C3 | MinIO/S3 | metadata only | با Approval | signed URL کوتاه |
| Identity | username/avatar | C2 | PostgreSQL/Neo4j | محدود | ممنوع پیش‌فرض | با Scope |
| Interaction | mention/reply/follow | C2/C3 | PostgreSQL/Neo4j | graph ACL | ممنوع پیش‌فرض | با Evidence |
| Event | actor pseudonym/correlation | C2 | analytics store | aggregate | خیر | محدود |
| Audit | actor/action/resource | C2/security | append-only store | محدود | خیر | admin/legal فقط |
| Export | selected dataset | مطابق بالاترین Class | object storage موقت | خیر | خیر | دریافت‌کننده تأییدشده |

## Data Contract

هر Schema حاوی metadata زیر است:

```json
{
  "data_class": "C2",
  "purpose_codes": ["PUR-INGEST", "PUR-SEARCH"],
  "retention_policy_id": "RET-CONTENT-DEFAULT",
  "provider_policy_id": "telegram-current",
  "residency_region": "configured",
  "export_policy": "workspace_admin",
  "ai_policy": "local_only",
  "legal_hold": false
}
```

## کنترل‌های اجباری

### C2

- TLS در انتقال و encryption at rest؛
- `tenant_id` اجباری در رکورد، Query و Index؛
- RBAC و purpose-aware authorization؛
- Signed URL کوتاه برای رسانه؛
- عدم ثبت body در Log/Trace؛
- Retention و deletion propagation؛
- Export با Audit و checksum.

### C3

- deny-by-default و feature flag؛
- DPIA/LIA و تأیید Legal/Security؛
- Field-level encryption یا جداسازی Store؛
- عدم ارسال به AI ابری مگر مجوز صریح؛
- عدم نمایش در Graph عمومی؛
- review انسانی برای inference و merge identity.

### C4

- فقط Secret Manager/Vault؛
- envelope encryption و کلید مجزا؛
- استفاده از reference، نه value، در Core DB؛
- redaction در exception، telemetry و support؛
- rotation، expiry و revoke؛
- ممنوعیت backup/export معمولی و ممنوعیت ورود به AI/Search.

## Pseudonymization و De-identification

- Analytics از `actor_pseudo_id` دوره‌ای استفاده می‌کند.
- Salt هر Workspace جدا و در Vault است.
- Aggregate فقط وقتی ناشناس تلقی می‌شود که بازشناسایی معقولاً ممکن نباشد.
- Hash کردن handle به‌تنهایی anonymization نیست.
- Dataset تست از داده ساختگی یا fixture مجاز ساخته می‌شود؛ Production dump ممنوع است.

## Data Loss Prevention

- Secret scan در CI، Log pipeline و Export؛
- MIME sniffing، malware scan و archive-bomb limits؛
- Content inspection برای token/cookie/private key؛
- سقف ردیف و ستون در Export؛
- Watermark یا trace ID برای Exportهای پرریسک؛
- alert برای download/export غیرعادی.

## Incident و Breach

هر رخداد شامل زمان کشف، Class، Tenantهای متاثر، داده، Provider، containment، evidence و تصمیم notification است. Notification deadline را Legal profile تعیین می‌کند؛ برای داده‌های مشمول GDPR، ارزیابی مهلت ۷۲ ساعته انجام می‌شود.

## معیار پذیرش W02

- C0 تا C4 و برچسب‌های پرریسک تعریف شده‌اند.
- Data Inventory محل، Index، AI و Export را مشخص می‌کند.
- C4 هرگز وارد Log، Search، Export یا AI نمی‌شود.
- تست tenant isolation و redaction جزو Contract هر Store است.
- Retention و Provider policy با Data Contract پیوند دارند.

## منابع رسمی

- GDPR Article 5 و Article 32: https://eur-lex.europa.eu/eli/reg/2016/679/oj
- EDPB Data Protection by Design and by Default: https://www.edpb.europa.eu/documents/guideline/guidelines-42019-article-25-data-protection-design-and-default_en

