# ADR-0001: Modular Monolith برای Control Plane

- وضعیت: Accepted
- تاریخ: 2026-11-07
- تسک: S03-W01-T02

## Context

دامنهٔ محصول بزرگ است، اما مرزهای نهایی سرویس‌ها و بار واقعی هنوز اثبات نشده‌اند. Microservice زودهنگام هزینهٔ تراکنش، نسخه‌بندی و عملیات را بالا می‌برد.

## Decision

Core به‌صورت Modular Monolith در NestJS ساخته می‌شود. هر ماژول API، Repository و Event خود را دارد؛ import چرخه‌ای، Join کنترل‌نشده و دسترسی مستقیم به جدول ماژول دیگر ممنوع است. مرز Provider از ابتدا Process/Container جداست.

## Consequences

تحویل و تراکنش‌های هسته ساده‌تر و Refactor کم‌هزینه‌تر است؛ در مقابل CI باید Dependency Boundary را کنترل کند. ماژول فقط با شواهد Scale، استقلال Release یا Isolation امنیتی استخراج می‌شود.

## Alternatives

Microservices کامل رد شد؛ Monolith بدون مرز نیز به‌دلیل Coupling رد شد.

## Revisit trigger

نیاز مستقل به Scale/Release، نقض SLO ناشی از Contention، یا Boundary امنیتی جدید.

