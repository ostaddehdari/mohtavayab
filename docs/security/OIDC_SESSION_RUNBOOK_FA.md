# Runbook نشست و OIDC

## نشست محلی

Access Token امضاشده ۱۵ دقیقه عمر دارد و فقط شناسه کاربر، نشست و سطح اطمینان را حمل می‌کند. Refresh Token یک مقدار تصادفی ۲۵۶ بیتی و ۳۰روزه است که در هر استفاده می‌چرخد. اگر توکن قدیمی دوباره ارائه شود، تمام Token Family لغو و رویداد `auth.refresh.reuse_detected` ثبت می‌شود.

## OIDC

فقط Authorization Code Flow پذیرفته می‌شود. هر تراکنش `state`، `nonce` و PKCE verifier مستقل دارد و پس از ده دقیقه یا اولین Callback حذف می‌شود. PKCE همیشه `S256` است. Discovery و اعتبارسنجی امضا، Issuer، Audience و ID Token توسط `openid-client` انجام می‌شود.

متغیرهای هر Provider:

```text
OIDC_<NAME>_ISSUER
OIDC_<NAME>_CLIENT_ID
OIDC_<NAME>_CLIENT_SECRET
OIDC_<NAME>_REDIRECT_URI
```

Provider با Client ID غیرفعال پاسخ `oidc_provider_disabled` می‌دهد. `return_to` فقط مسیر نسبی تک‌اسلش است؛ URL خارجی پذیرفته نمی‌شود.

## عملیات حادثه

1. در مشاهدهٔ replay، Token Family را لغو کنید؛
2. در افشای کلید JWT، کلید را Rotate و همه نشست‌ها را باطل کنید؛
3. در افشای OIDC Client Secret، آن را نزد Provider Rotate کنید؛
4. رویدادها را با `correlation_id` بررسی کنید، نه با توکن یا IP خام؛
5. پس از تغییر رمز یا فعال‌شدن MFA، نشست‌های قبلی لغو می‌شوند.
