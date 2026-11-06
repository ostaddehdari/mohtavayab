# حاکمیت تحویل

## سلسله‌مراتب

- Release: یک هدف محصولی بزرگ و قابل ارائه.
- Stage: چهار Work و بیست Task؛ یک Milestone قابل پذیرش.
- Work: پنج Task؛ یک Issue والد با مالک روشن.
- Task: ۰٫۵ تا ۲ نفر-روز؛ یک تغییر مستقل و یک Pull Request کوچک.

## تبدیل Roadmap به GitHub

| سطح برنامه | GitHub |
|---|---|
| Release | Project Roadmap / Release |
| Stage | Milestone با شناسه `Sxx` |
| Work | Issue والد با شناسه `Sxx-Wxx` |
| Task | Issue با شناسه `Sxx-Wxx-Txx` و PR متناظر |

## نام‌گذاری

- Branch: `feat/S21-W02-T03-telegram-session`
- Commit: `feat(S21-W02-T03): persist telegram session safely`
- PR: `[S21-W02-T03] ذخیره امن نشست تلگرام`

## Definition of Ready

- وابستگی‌ها بسته یا صریحاً Mock شده‌اند.
- سناریوی پذیرش و دادهٔ تست مشخص است.
- Permission، حالت خطا و اثر امنیتی تعیین شده است.
- قرارداد API/Schema در صورت نیاز نسخه دارد.
- مالک، برآورد و Reviewer معلوم‌اند.

## Definition of Done

- کد و Migration قابل بازگشت هستند.
- Unit، Integration و Contract/E2E متناسب سبز هستند.
- Permission و Tenant isolation تست شده‌اند.
- Log، Metric و Trace بدون Secret موجود است.
- Loading/Empty/Partial/Failed در UI پیاده شده است.
- مستند، Runbook و ADR مرتبط به‌روز است.
- دموی پذیرش یا Evidence در PR ثبت شده است.

## WIP و جریان

- هر توسعه‌دهنده فقط یک Task فعال دارد.
- هر تیم حداکثر دو Work فعال دارد.
- Providerهای مختلف می‌توانند پس از S08، S13، S16 و S18 موازی شوند.
- Analytics پیشرفته قبل از تثبیت Canonical Model شروع نمی‌شود.
- Release عمومی بدون Restore Drill و Security Gate ممنوع است.

## اولویت

`P0` توقف سامانه/نشت داده، `P1` شکست قابلیت اصلی، `P2` نقص قابل دورزدن، `P3` بهبود. هر P0 دارای Incident، Timeline و Postmortem بدون سرزنش است.

