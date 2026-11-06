# ماتریس Providerها

## مسیرهای اولویت‌دار

| Stage | Provider | مسیر فنی اولیه | سطح ریسک | شرط فعال‌سازی Production |
|---|---|---|---|---|
| S21 | Telegram | Telethon و مفاهیم `teltest` | متوسط | حساب تست، FloodWait، همه رسانه‌ها و Forward |
| S22 | Instagram | `instradar`، aiograpi، Playwright، gallery-dl | بالا | noVNC، Challenge، Pool و Kill Switch |
| S23 | Eitaa | EitaaBun | بالا | ۱۰۰۰ پیام، رسانه، Resume و Publish واقعی |
| S24 | Bale | bale-sdk | بالا | گواهی RPC، Session، Media و Forward |
| S25 | Telewebion | TelewebionCrowler | متوسط | Queue/Resume و تعیین دقیق مجوز دانلود |
| S26 | Rubika | POC با Rubx/Pyrubi | بالا | انتخاب یک SDK پس از Benchmark و Contract Test |
| S27 | Soroush+ | API رسمی در اولویت، SplusPy آزمایشی | بالا | Permission و تست حساب واقعی |
| S28 | YouTube | Data API v3، OAuth، yt-dlp | کم/متوسط | Quota، resumable upload و policy review |
| S29 | Pinterest | API رسمی، SDK، Downloader fallback | متوسط | OAuth scopes و تست Pin/Board/Media |
| S30 | X | API رسمی؛ Twikit فقط آزمایشی | بالا | هزینه/سهمیه و Risk Gate |
| S31 | TikTok | API رسمی در اولویت | بالا | Scope، region policy و قابلیت واقعی |
| S32 | LinkedIn | API رسمی | متوسط | App review و Organization permission |
| S33 | Facebook/Threads | Meta APIs | متوسط | Asset permission و تفکیک Capability |
| S34 | Web/RSS | RSS، Sitemap و Crawler مجاز | کم | Robots/ToS و Canonical URL |
| S35 | Aparat/Vimeo | API رسمی یا Downloader مجاز | متوسط | Media policy و Upload test |

## گواهی مشترک

هر Provider باید ورود، خروج، Resolve Source، Backfill، Watch، Cursor، Retry، Media Matrix، Metrics، Publish/Forward در صورت ادعا، Rate limit، Revoke و پاک‌سازی دادهٔ تست را پاس کند. قابلیت تست‌نشده در UI نمایش داده نمی‌شود.

