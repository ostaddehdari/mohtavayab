# مدل Workspace و عضویت

Workspace مرز اصلی مالکیت و دسترسی داده در هادی است. کاربر می‌تواند عضو چند Workspace باشد، اما هر درخواست فقط یک Workspace فعال دارد. ساخت Workspace به‌صورت اتمیک، عضویت `owner` و ترجیح Workspace فعال را ایجاد می‌کند.

## چرخه وضعیت

Workspace یکی از وضعیت‌های `active`، `suspended` یا `deleting` را دارد. عضویت نیز `active` یا `suspended` است. سرویس پیش از هر خواندن یا نوشتن، وجود Workspace فعال، عضویت فعال و Permission لازم را بررسی می‌کند. شناسه Workspace از ورودی کاربر به Query آزاد تزریق نمی‌شود.

## ترجیحات کاربر

Workspace فعال و حالت `expanded/compact` سایدبار در `tenancy.user_preferences` ذخیره می‌شود. Local Storage فقط در نمونه S05 استفاده می‌شد و در S07 حذف شده است. تغییر Workspace تنها وقتی پذیرفته می‌شود که عضویت فعال وجود داشته باشد.

## PostgreSQL

`DatabaseService` در حالت `AUTH_STORE_DRIVER=postgres` فعال است. در Production این حالت اجباری است و AuthStore هنگام آغاز، هویت‌ها، MFA، نشست‌ها و OIDC را از PostgreSQL بازیابی می‌کند. حالت `memory` فقط برای تست و توسعه سریع است.
