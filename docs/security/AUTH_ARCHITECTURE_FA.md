# معماری احراز هویت هادی

## دامنه S06

هویت کاربر در این مرحله مستقل از Workspace ساخته شده است. ارتباط کاربر با Workspace و RBAC در S07 افزوده می‌شود. API واقعی ثبت‌نام، ورود، Refresh، خروج، MFA، بازیابی، نشست‌ها و OIDC در `apps/api/src/auth` قرار دارد. ذخیره‌ساز فعلی برای آزمون و دموی S06 درون‌حافظه‌ای است؛ قرارداد PostgreSQL در `infra/postgres/migrations/0001_identity.sql` آماده شده و جایگزینی Adapter در S07 شرط استقرار Production است.

## مرزهای اعتماد

```mermaid
flowchart RL
  B[مرورگر] -->|Cookie امن + CSRF| A[Auth API]
  A --> C[Crypto Service]
  A --> R[Risk Policy]
  A --> I[Identity Store]
  A --> O[OIDC Provider]
```

مرورگر هرگز Access Token یا Refresh Token را در Local Storage نمی‌گذارد. Cookieهای نشست در Production با `HttpOnly`، `Secure`، `SameSite=Lax` و `Path=/` صادر می‌شوند. Device ID تصادفی، اعتبار احراز هویت نیست و تنها سیگنال ریسک است.

## رمز عبور و رازها

- Argon2id با ۱۹ MiB حافظه، دو Iteration و یک Lane؛
- Salt توسط کتابخانه و Pepper از Secret Store؛
- Refresh Token و Reset Token فقط به‌شکل HMAC ذخیره می‌شوند؛
- راز TOTP با AES-256-GCM و کلید مستقل رمز می‌شود؛
- مقدار OTP، رمز عبور، توکن خام و IP خام وارد Audit نمی‌شوند.

## قراردادهای خطا

پیام ورود ناموفق برای ایمیل موجود و ناموجود یکسان است. بازیابی رمز همیشه `accepted: true` برمی‌گرداند تا وجود حساب افشا نشود. کدهای داخلی استاندارد شامل `invalid_credentials`، `invalid_mfa`، `invalid_session`، `refresh_reuse_detected` و `rate_limited` هستند.

سیاست ماشین‌خوان در `security/identity-policy.json` و قراردادهای ورودی/خروجی در `packages/contracts` نگهداری می‌شوند.
