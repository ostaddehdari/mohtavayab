# سیاست Provider رسمی و غیررسمی

شناسه تحویل: `S02-W03`  
نسخه: `1.0.0`

## اصل

وجود کتابخانه فنی به معنی مجازبودن استفاده Production نیست. هر Adapter علاوه بر Contract Test فنی، یک `Provider Policy Profile` دارد که روش دسترسی، Terms، Scope، محدودیت ذخیره، حذف، نمایش، انتشار، هزینه، ریسک حساب و تاریخ بازبینی را ثبت می‌کند.

## طبقات ریسک

| Tier | روش | وضعیت پیش‌فرض | نمونه کنترل |
|---|---|---|---|
| A | API رسمی و Scope مصوب | قابل Production پس از App review | OAuth، quota، terms monitor |
| B | API رسمی با محدودیت داده/Review | محدود به Capability تأییدشده | allowlist و provider-specific retention |
| C | SDK غیررسمی حساب واقعی با مجوز مالک | Pilot فقط، خاموش برای مشتری عمومی | account isolation، low budget، kill switch |
| D | Browser automation یا public scraping مبهم | تحقیق/POC، نه Production | legal review و robots/terms gate |
| E | bypass، credential theft، private access یا evasion | ممنوع | build/deploy block |

## Go/No-Go Gate

Provider فقط وقتی فعال می‌شود که موارد زیر `pass` باشند:

1. روش دسترسی و Terms URL ثبت و در ۳۰ روز اخیر بازبینی شده باشد؛
2. حساب/داده متعلق به کاربر یا دسترسی عمومی مجاز باشد؛
3. Scopeها کمینه و Consent Receipt موجود باشد؛
4. Storage/refresh/deletion/display rules به Policy Engine ترجمه شده باشد؛
5. Contract، Media Matrix، Rate limit، Revoke و Kill Switch تست شده باشند؛
6. Risk owner و rollback مشخص باشند؛
7. UI برچسب رسمی/غیررسمی و محدودیت واقعی را نشان دهد؛
8. Capability تست‌نشده اعلام نشود.

هر `fail` موجب غیرفعال‌بودن Provider است. `conditional` فقط در Pilot محدود و با expiry قابل استفاده است.

## Provider Policy Profile

```json
{
  "provider_code": "youtube",
  "access_tier": "A",
  "terms_url": "https://developers.google.com/youtube/terms/api-services-terms-of-service",
  "policy_url": "https://developers.google.com/youtube/terms/developer-policies",
  "reviewed_at": "2026-11-07",
  "review_due_at": "2026-12-07",
  "storage_rules": ["refresh_or_delete_authorized_data_within_30d"],
  "deletion_rules": ["user_request_within_7d"],
  "prohibited_actions": ["credential_collection", "policy_evasion"],
  "production_state": "disabled_until_certified",
  "risk_owner": "provider-compliance"
}
```

## قواعد مشترک

- API رسمی مسیر ترجیحی است؛ fallback غیررسمی خودکار نیست.
- Password یا session cookie کاربر از UI عمومی جمع‌آوری نمی‌شود؛ noVNC/OTP در Container ایزوله اجرا می‌شود.
- Proxy rotation برای دورزدن enforcement ممنوع است.
- Rate limit با Budget و Backoff رعایت می‌شود؛ خطا با حساب دیگر پنهان نمی‌شود.
- حذف یا revoke در Provider به توقف Watch/Publish و deletion workflow محلی منجر می‌شود.
- Terms change رویداد `provider_policy_changed` و در صورت اثر، `needs_reconsent` تولید می‌کند.
- هر Provider مستقل deploy، rollback و kill می‌شود.

## قواعد شناخته‌شده Providerها

### YouTube

- Privacy policy عمومی و توضیح دقیق داده/هدف الزامی است.
- برخی Authorized/Non-Authorized API Data باید حداکثر پس از ۳۰ روز حذف یا refresh شوند.
- درخواست حذف داده کاربر باید در سریع‌ترین زمان و حداکثر هفت روز اجرا شود.
- خاتمه دسترسی API می‌تواند حذف API Data را الزام کند.

### Pinterest

- استفاده و ذخیره فقط در حدود Terms و Developer Guidelines است.
- Scraping خودکار خارج از روش مجاز ممنوع است.
- ذخیره بسیاری از Pinterest Data بدون رضایت کتبی مجاز نیست.
- در محرک‌هایی مانند لغو رضایت، درخواست حذف، خاتمه یا بی‌نیازی، حذف بدون تأخیر و حداکثر طی ۳۰ روز لازم است.

### Meta

- Privacy policy باید عمومی، قابل دسترس و غیرمسدود جغرافیایی باشد.
- هدف، داده و روش درخواست حذف باید روشن باشد.
- درخواست کاربر/Meta، پایان نیاز یا پایان سرویس deletion workflow را فعال می‌کند.
- Login credential یا access token نباید خارج از مسیر مجاز جمع‌آوری/اشتراک شود.

### X

- Developer Agreement/Policy و Display requirements بخشی از Contract هستند.
- حذف‌های Provider باید از Compliance mechanism دریافت و اعمال شوند.
- Policy profile باید deadline حذف جاری را از منبع رسمی نسخه‌دار کند؛ مقدار hard-coded بدون بازبینی ممنوع است.

### Providerهای ایرانی و SDKهای غیررسمی

- تا زمان بررسی حقوقی و Terms قابل استناد در Tier C/D باقی می‌مانند.
- فقط حساب آزمایشی متعلق به تیم، Budget محافظه‌کارانه و Source مجاز استفاده می‌شود.
- قابلیت Production به‌صورت پیش‌فرض خاموش است.
- عدم وجود Terms روشن، مجوز ضمنی ایجاد نمی‌کند.

## Terms Monitor

- بازبینی ماهانه برای Provider فعال؛
- ذخیره URL، hash، تاریخ مشاهده و خلاصه تغییر؛
- توقف خودکار قابلیت متاثر در تغییر ناسازگار؛
- تیکت Legal/Engineering و migration/deletion plan؛
- ثبت تأیید پیش از re-enable.

## معیار پذیرش W03

- Tier A تا E و Gate اجرایی تعریف شده‌اند.
- Profile ماشین‌خوان برای Terms/Storage/Delete/Risk وجود دارد.
- Provider غیررسمی به‌طور پیش‌فرض Production نیست.
- Terms change، Kill Switch و Reconsent مسیر مشخص دارند.
- Policyهای رسمی از Capability فنی جدا شده‌اند.

## منابع رسمی Providerها

- YouTube API Services Terms: https://developers.google.com/youtube/terms/api-services-terms-of-service
- YouTube Developer Policies: https://developers.google.com/youtube/terms/developer-policies
- Pinterest Developer and API Terms: https://developers.pinterest.com/terms/
- Meta Platform Terms: https://developers.facebook.com/terms
- X Developer policies and agreements: https://t.co/devpolicy

