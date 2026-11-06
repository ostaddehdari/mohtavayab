# ADR-0003: Temporal برای گردش‌کار پایدار

- وضعیت: Accepted
- تاریخ: 2026-11-07
- تسک: S03-W02-T02

## Context

Backfill، Watch، Publish، Human Approval، Retry و انتظارهای چندروزه باید پس از Crash ادامه یابند.

## Decision

Temporal موتور Orchestration است. Workflow فقط منطق Deterministic دارد؛ I/O در Activity است. Secret/Payload C4 وارد History نمی‌شود. Domain State در PostgreSQL باقی می‌ماند.

## Consequences

Retry/Timer/Signal/Recovery استاندارد می‌شود؛ تیم باید Determinism، Versioning و History Growth را رعایت کند.

## Alternatives

Cron + Redis Queue و State Machine سفارشی به‌دلیل Recovery و Human Wait پیچیده رد شدند.

## Revisit trigger

عدم تأمین SLO/هزینه پس از Benchmark و Proof of Recovery در S09.

