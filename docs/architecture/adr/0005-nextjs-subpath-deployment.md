# ADR-0005: استقرار Native زیر `/mohtavayab`

- وضعیت: Accepted
- تاریخ: 2026-11-07
- تسک: S03-W02-T03

## Context

سامانه باید کنار سرویس‌های دیگر روی `srun.ir/mohtavayab` منتشر شود و Asset، Callback و WebSocket نباید به Root وابسته باشند.

## Decision

Next.js با `basePath: '/mohtavayab'` Build می‌شود. Core API و تمام URLهای عمومی از `PUBLIC_BASE_URL` معتبر تولید می‌شوند؛ Nginx TLS/Proxy را انجام می‌دهد و Base Path را مخفی نمی‌کند.

## Consequences

Link/Asset/Callback در تمام محیط‌ها قابل پیش‌بینی است؛ تغییر Base Path نیازمند Build جدید و آزمون E2E است.

## Alternatives

Rewrite شفاف Root یا iframe به‌دلیل خطای Asset/OAuth و تجربهٔ ضعیف رد شد.

## Revisit trigger

اختصاص Subdomain مستقل؛ سازگاری Redirect برای URLهای موجود حفظ می‌شود.

