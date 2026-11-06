# ADR-0002: Runner ایزوله برای Providerها

- وضعیت: Accepted
- تاریخ: 2026-11-07
- تسک: S03-W01-T03

## Context

کتابخانه‌ها، زبان‌ها، نشست‌ها و ریسک Providerها ناهمگون‌اند و برخی غیررسمی هستند.

## Decision

هر Provider/نسخه در Image مستقل، Task Queue جدا، Egress Allowlist و Secret Grant کوتاه‌عمر اجرا می‌شود. Runner به Core DB و Projectionها دسترسی ندارد و فقط Contract نسخه‌دار می‌بیند.

## Consequences

Fault/Supply-chain containment و Rollback مستقل به‌دست می‌آید؛ هزینهٔ Image و Observability بیشتر می‌شود. Registry، Certification و Kill Switch اجباری‌اند.

## Alternatives

نصب همهٔ SDKها در Core و اجرای Plugin درون‌فرآیند به‌دلیل Blast Radius رد شدند.

## Revisit trigger

Provider رسمی کاملاً Stateless می‌تواند روی Pool مشترک اجرا شود، اما Boundary قرارداد حذف نمی‌شود.

