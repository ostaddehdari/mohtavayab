# استقرار روی srun.ir/mohtavayab

## قرارداد مسیر

برنامه در ریشه دامنه نیست و باید از روز اول با Base Path ساخته شود:

```env
NEXT_PUBLIC_BASE_PATH=/mohtavayab
NEXT_PUBLIC_APP_URL=https://srun.ir/mohtavayab
PUBLIC_API_BASE_URL=https://srun.ir/mohtavayab/api
```

در Next.js مقدار `basePath` و در صورت نیاز `assetPrefix` از تنظیمات Build خوانده می‌شود. هیچ Link، Redirect، Cookie Path، Callback OAuth یا Asset URL نباید `/` را فرض کند.

## مسیرهای عمومی

| مسیر | سرویس |
|---|---|
| `/mohtavayab` | Next.js Web |
| `/mohtavayab/api` | NestJS API |
| `/mohtavayab/ws` | WebSocket/SSE |
| `/mohtavayab/auth/callback/*` | OAuth callbacks |
| `/mohtavayab/healthz` | سلامت سطح برنامه |

## الگوی Nginx

```nginx
location = /mohtavayab {
    return 308 /mohtavayab/;
}

location /mohtavayab/api/ {
    proxy_pass http://mohtavayab_api/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Prefix /mohtavayab;
}

location /mohtavayab/ {
    proxy_pass http://mohtavayab_web/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

کانفیگ واقعی باید شامل WebSocket upgrade، timeout مناسب آپلود، محدودیت اندازه، rate limit، CSP، HSTS و شناسه درخواست باشد.

## محیط‌ها

- Local: Docker Compose و دادهٔ Seed.
- Preview: یک محیط موقت برای هر PR.
- Staging: دامنه/مسیر جدا با Providerهای Sandbox و حساب تست.
- Production: Blue/Green یا Rolling، Migration کنترل‌شده و Smoke Test پس از انتشار.

## دروازه انتشار

1. Roadmap validation و تست‌های Unit/Integration/E2E سبز.
2. Build با `basePath=/mohtavayab` و تست مستقیم همه Assetها.
3. Migration Dry Run و نسخه پشتیبان.
4. Health check، Smoke test ورود، استخراج نمونه و Publish به مقصد آزمایشی.
5. امکان Rollback نسخه برنامه و Migration.
6. ثبت Release note، Known issues و شماره Runbook.

