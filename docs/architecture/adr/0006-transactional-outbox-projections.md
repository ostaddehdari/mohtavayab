# ADR-0006: Transactional Outbox برای Projectionها

- وضعیت: Accepted
- تاریخ: 2026-11-07
- تسک: S03-W03-T03

## Context

ثبت Canonical Content و به‌روزرسانی Search/Analytics/Graph نباید با Dual-write ناسازگار شود.

## Decision

Domain Mutation و Outbox Event در یک تراکنش PostgreSQL Commit می‌شوند. Consumerها Idempotent، نسخه‌دار و دارای Watermark هستند؛ Reconciliation اختلاف را کشف و Rebuild می‌کند.

## Consequences

Atomicity محلی و Recovery قابل اثبات است؛ Projectionها Eventually Consistent می‌شوند و UI باید Freshness را نمایش دهد.

## Alternatives

Distributed Transaction/2PC و Publish مستقیم پس از Commit به‌دلیل Coupling و Lost Event رد شدند.

## Revisit trigger

CDC رسمی می‌تواند روش انتقال Outbox را تغییر دهد، اما Semantic و Idempotency حفظ می‌شود.
