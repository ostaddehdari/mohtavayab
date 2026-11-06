# ADR-0004: PostgreSQL به‌عنوان منبع حقیقت و Projectionهای تخصصی

- وضعیت: Accepted
- تاریخ: 2026-11-07
- تسک: S03-W03-T02

## Context

محصول هم تراکنش، هم جست‌وجو، هم تحلیل زمانی و هم گراف می‌خواهد؛ یک Store برای همهٔ الگوها بهینه نیست.

## Decision

PostgreSQL منبع حقیقت دامنه و MinIO/S3 منبع Binary است. OpenSearch، ClickHouse و Neo4j Projectionهای قابل‌بازسازی از Transactional Outbox هستند. Redis حقیقت پایدار نیست و Dual-write ممنوع است.

## Consequences

مالکیت و حذف روشن می‌ماند؛ Eventual Consistency و Reconciliation لازم است. Storeهای تخصصی فقط در استیج مربوط و بعد از Trigger اندازه‌گیری‌شده فعال می‌شوند.

## Alternatives

نوشتن هم‌زمان در چند Store و Database-per-feature از روز اول به‌دلیل ناسازگاری عملیاتی رد شدند.

## Revisit trigger

Benchmark معتبر نشان دهد PostgreSQL یا Projection انتخابی SLO/هزینه را تأمین نمی‌کند.

