# سیستم طراحی و تجربه کاربری RTL

## فناوری رابط

- Next.js + React + TypeScript
- CSS Variables و پکیج مستقل `@mohtavayab/ui` برای Tokenها و اجزای پایه
- Vazirmatn به‌صورت WOFF2 خودمیزبان
- `@fortawesome/react-fontawesome` و پکیج‌های SVG؛ از Webfont و pseudo-element استفاده نشود
- Motion برای Micro-interactionهای داشبورد

## پوسته داشبورد

- سایدبار در سمت راست: ۲۸۰ پیکسل در حالت باز و ۸۰ پیکسل در حالت فشرده.
- در عرض کمتر از ۱۰۲۴ پیکسل، Sidebar به Drawer تبدیل می‌شود.
- وضعیت جمع‌شدن در نمونهٔ S05 در Local Storage ذخیره می‌شود و در S07 به پروفایل کاربر منتقل خواهد شد.
- Header چسبان شامل جست‌وجوی سراسری، وضعیت صف، اعلان، Workspace switcher و پروفایل است.
- محتوای صفحه دارای Breadcrumb، عنوان، Action اصلی و Status summary ثابت است.

## نقشه صفحات

1. صفحهٔ عمومی و معرفی محصول
2. ورود، MFA و انتخاب Workspace
3. خانهٔ کاربر و سلامت Providerها
4. حساب‌ها و Account Pool
5. منابع و رقبا
6. استخراج و صف انتظار
7. کتابخانه محتوا
8. جست‌وجوی پیشرفته و Saved Search
9. Collection
10. استودیوی ویرایش، Rule و AI
11. مقصدها و انتقال
12. تقویم انتشار
13. تحلیل، ترند و رقبا
14. گراف ارتباط
15. پنل ادمین سامانه
16. عملیات، Audit و تنظیمات

## کاربرد درست انیمیشن‌ها

| ابزار                | محل استفاده                                            | محدودیت                                    |
| -------------------- | ------------------------------------------------------ | ------------------------------------------ |
| Motion               | Sidebar، Modal، List transition، Drag & Drop، Feedback | ابزار پیش‌فرض داشبورد                      |
| GSAP + ScrollTrigger | Landing، Storytelling محصول و نمودارهای روایی          | داخل صفحات داده‌محور عمومی نشود            |
| Lenis                | فقط Landing عمومی                                      | روی Table، Calendar و Virtual List غیرفعال |
| Three.js             | Hero، نمای اختیاری شبکه و افکت برند                    | Lazy، سقف FPS و fallback دوبعدی            |
| Rive                 | Empty state، onboarding و وضعیت اتصال                  | فایل کوچک و بدون وابستگی به عملکرد اصلی    |

## قواعد کارایی و دسترس‌پذیری

- `prefers-reduced-motion` تمام حرکت‌های غیرضروری را خاموش می‌کند.
- Core Web Vitals صفحهٔ عمومی: LCP کمتر از ۲٫۵ ثانیه، CLS کمتر از ۰٫۱ و INP کمتر از ۲۰۰ms.
- Three.js، Rive، GSAP و Editorهای سنگین با Dynamic Import بارگیری می‌شوند.
- صفحه بدون WebGL و با اینترنت ضعیف باید کاملاً قابل استفاده بماند.
- Focus، Keyboard navigation، Contrast و Screen reader برای WCAG AA تست می‌شوند.
- اعداد، تاریخ و متن فارسی درست نمایش داده می‌شوند؛ شناسه، URL و کد در بلوک LTR قرار می‌گیرند.

## حالت‌های اجباری هر صفحه

`Loading`، `Empty`، `Partial`، `Failed`، `Permission denied`، `Needs action`، `Rate limited`، `Offline` و `Stale data` باید طراحی و تست شوند.
