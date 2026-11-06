# پرسوناها و سفرهای اصلی کاربر

شناسه تحویل: `S01-W02`  
نسخه: `1.0.0`

## پرسوناهای اصلی

### P01 ـ مالک Workspace: مریم، مدیر شبکه رسانه‌ای

- هدف: کنترل ۱۰ تا ۵۰ ادمین، صدها منبع و چند مقصد بدون اختلاط دسترسی.
- درد: نشست‌های پراکنده، نبود گزارش هزینه/سلامت، خطای انسانی در انتشار.
- نیاز: نقش، سهمیه، Audit، وضعیت Provider، گزارش مدیریتی و Kill Switch مقصد.
- موفقیت: در کمتر از یک ساعت Workspace را راه‌اندازی و مسئولیت‌ها را تفکیک کند.

### P02 ـ ادمین عملیات: علی، مسئول حساب‌ها و صف‌ها

- هدف: اتصال حساب، ساخت Pool، رفع Challenge و ادامه Job شکست‌خورده.
- درد: محدودشدن حساب، نامشخص‌بودن Cursor، دانلود ناقص رسانه.
- نیاز: Health، Lease، Budget، Cooldown، Quarantine، Resume و Run log.
- موفقیت: بدون دست‌کاری دیتابیس علت توقف را بفهمد و مسیر امن بازیابی را اجرا کند.

### P03 ـ تحلیلگر: نرگس، پژوهشگر رسانه و رقبا

- هدف: یافتن محتوا، ترند و شبکه تعامل با امکان بازکردن شاهد اصلی.
- درد: جست‌وجوی ضعیف فارسی، داده تکراری و نمودار بدون Provenance.
- نیاز: Search/Facet، Saved Search، Collection، Export، Trend و Graph drill-down.
- موفقیت: گزارشی تکرارپذیر بسازد که هر ادعا به Source و Permalink برگردد.

### P04 ـ ویراستار: رضا، آماده‌ساز محتوا

- هدف: تبدیل محتوای خام به نسخه مناسب مقصد بدون نابودکردن اصل.
- درد: کپی‌کاری دستی، لینک‌های ناخواسته و نبود تاریخچه تغییر.
- نیاز: Rule، Preview، Diff، AI Task، Version و Approval.
- موفقیت: تغییر دسته‌ای را Dry Run کند و تفاوت قبل/بعد را دقیق ببیند.

### P05 ـ ناشر: سارا، مدیر تقویم کانال‌ها

- هدف: چینش محتوا در تقویم و ارسال مطمئن به چند شبکه.
- درد: تفاوت تنظیمات Providerها، ارسال تکراری و شکست بی‌خبر.
- نیاز: Capability Form، Drag and Drop، Receipt، Retry و Cancel window.
- موفقیت: وضعیت هر مقصد را مستقل ببیند و شکست یک مقصد بقیه را متوقف نکند.

### P06 ـ مدیر سامانه: امیر، Super Admin

- هدف: سلامت کل پلتفرم بدون مشاهده غیرضروری داده مشتری.
- درد: تغییر API خصوصی، Worker ناسالم و هزینه نامعلوم.
- نیاز: Provider Registry، Feature Flag، Kill Switch، Capacity، Plan و Audit پشتیبانی.
- موفقیت: Provider مشکل‌دار را مستقل غیرفعال و اثر آن را به Workspaceهای مربوط اعلام کند.

### P07 ـ توسعه‌دهنده یکپارچه‌سازی

- هدف: اجرای Job و دریافت نتیجه از طریق API قابل پیش‌بینی.
- درد: خطاهای بدون Type، عملیات غیرIdempotent و مستند ناقص.
- نیاز: Service Account، Scope، Webhook، Correlation ID و OpenAPI/SDK.
- موفقیت: Integration پس از Retry یا Restart نتیجه تکراری نسازد.

## نقش و دسترسی

| قابلیت | Owner | Admin | Analyst | Editor | Publisher | Viewer | Super Admin |
|---|---:|---:|---:|---:|---:|---:|---:|
| مدیریت اعضا و سهمیه | ✓ | محدود | — | — | — | — | سیاست کل |
| اتصال حساب و Pool | ✓ | ✓ | — | — | — | — | سلامت، بدون Secret |
| Backfill/Watch | ✓ | ✓ | ✓ | مشاهده | مشاهده | مشاهده | عملیات زیرساخت |
| Search/Collection | ✓ | ✓ | ✓ | ✓ | مشاهده | مشاهده | فقط پشتیبانی مجاز |
| Rule/AI/Version | ✓ | ✓ | مشاهده | ✓ | مشاهده | — | سیاست AI |
| انتشار | ✓ | ✓ | — | ارسال برای تأیید | ✓ | — | Kill Switch |
| Analytics/Graph | ✓ | ✓ | ✓ | مشاهده | مشاهده | مشاهده | سلامت سرویس |

## Journey 01 ـ راه‌اندازی و اتصال حساب

| مرحله | اقدام | پاسخ سامانه | شکست و بازیابی | رویداد اصلی |
|---|---|---|---|---|
| انتخاب Provider | کاربر «حساب جدید» را می‌زند | فرم مبتنی بر Auth Schema | Provider غیرفعال → توضیح و مسیر جایگزین | `account_connect_started` |
| احراز هویت | OTP/OAuth/noVNC | Secret خارج از Core UI ثبت می‌شود | OTP منقضی/Challenge → Needs Action | `account_auth_challenged` |
| بررسی | Health و Capability اجرا می‌شود | دسترسی‌های واقعی نمایش داده می‌شود | Capability ناقص → فعال‌سازی محدود | `account_connected` |
| Pool | حساب به Pool افزوده می‌شود | Budget و Purpose تعیین می‌شود | تضاد Policy → Validation | `account_pool_member_added` |
| پایان | Source پیشنهادی یا Job ساخته می‌شود | Next best action نمایش داده می‌شود | — | `onboarding_step_completed` |

## Journey 02 ـ Backfill و Watch منبع رقیب

1. Analyst URL/Handle را وارد و Source را Resolve می‌کند.
2. ابتدا/تاریخ/ID، انواع محتوا و سیاست رسانه را انتخاب می‌کند.
3. Preview برآورد حجم، حساب Pool و محدودیت را نشان می‌دهد.
4. Job وارد Queue می‌شود و Progress، Cursor و Subtask قابل مشاهده است.
5. پس از پایان Backfill، در صورت انتخاب کاربر به Waiting/Watch می‌رود.
6. اگر Worker قطع شود، از Checkpoint ادامه می‌دهد؛ Duplicate ساخته نمی‌شود.
7. نتیجه با Provider، Source، External ID و Permalink در Library دیده می‌شود.

## Journey 03 ـ پژوهش و Collection چندشبکه‌ای

1. جست‌وجوی «ایران» با نرمال‌سازی ی/ک و نیم‌فاصله اجرا می‌شود.
2. Analyst با Provider، تاریخ، رسانه و تعامل Facet می‌کند.
3. نتیجه را باز و Source/Permalink/Provenance را بررسی می‌کند.
4. موارد منتخب از حداقل سه Provider وارد Collection می‌شوند.
5. ترتیب با Drag and Drop تنظیم و Snapshot ذخیره می‌شود.
6. Collection به Export، گزارش یا Transfer Plan تبدیل می‌شود.

## Journey 04 ـ ویرایش و تأیید

1. Editor نسخه Raw را فقط‌خواندنی باز می‌کند.
2. Rule حذف لینک/کلمه ممنوع را Dry Run می‌کند.
3. در صورت نیاز AI با Prompt نسخه‌دار خروجی پیشنهاد می‌دهد.
4. Diff قبل/بعد، هشدار طول و سازگاری مقصد نمایش داده می‌شود.
5. نسخه برای Publisher ارسال یا رد می‌شود؛ دلیل تصمیم در Audit می‌ماند.

## Journey 05 ـ زمان‌بندی و انتشار چندمقصدی

1. Publisher Collection یا Saved Search را به Plan تبدیل می‌کند.
2. برای هر مقصد Capability Form اختصاصی تکمیل می‌شود.
3. کارت‌ها در تقویم روز/هفته/ماه چیده و Conflict بررسی می‌شود.
4. Preview نهایی و Dry Run اجرا می‌شود.
5. هر مقصد Receipt مستقل می‌گیرد؛ شکست یک مقصد بقیه را متوقف نمی‌کند.
6. Retry، Cancel و Needs Action از Operations Center قابل اجراست.

## Journey 06 ـ رخداد محدودشدن حساب

1. Worker خطای RateLimit/FloodWait/Challenge را Typed ثبت می‌کند.
2. Scheduler حساب را به Cooldown یا Quarantine می‌برد و Lease را آزاد می‌کند.
3. Job در Backoff می‌ماند یا با حساب سالم و Cursor سازگار ادامه می‌یابد.
4. Admin علت، زمان بازگشت، Runهای متاثر و اقدام لازم را می‌بیند.
5. هیچ Secret یا Cookie در اعلان و Log نمایش داده نمی‌شود.

## الزامات مشترک تجربه

- هر سفر دارای Loading، Empty، Partial، Failed، Permission Denied و Needs Action است.
- عملیات طولانی Progress، زمان آخرین Heartbeat و امکان Resume دارد.
- متن فارسی RTL و شناسه/URL/کد LTR نمایش داده می‌شود.
- حرکت‌ها با `prefers-reduced-motion` خاموش می‌شوند.
- عملیات مخرب نیازمند Scope روشن، Preview و تأیید است.
- Support impersonation فقط زمان‌دار، رضایت‌محور و Audit شده است.

## معیار پذیرش W02

- حداقل هفت پرسونا با هدف، درد، نیاز و تعریف موفقیت مشخص‌اند.
- شش سفر بحرانی، Happy Path و Failure Recovery دارند.
- نقش‌ها با Capabilityهای محصول و Tenant isolation سازگارند.
- Journeyها رویدادهای قابل اندازه‌گیری و حالت‌های UI را مشخص می‌کنند.

