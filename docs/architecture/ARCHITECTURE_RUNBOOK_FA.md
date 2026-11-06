# Runbook معماری و Failure Triage

> دامنه: S03 — این Runbook قراردادی است و فرمان‌های اجرایی در S04/S10/S58 افزوده می‌شوند.

## اصول عملیات

1. ابتدا Impact و Tenant/Providerهای درگیر را با شناسه‌های Opaque مشخص کنید؛ Payload یا Secret را در Ticket کپی نکنید.
2. Correlation ID را از Edge تا Workflow/Runner/Commit دنبال کنید.
3. برای Publish مبهم، پیش از Retry وضعیت مقصد را Reconcile کنید.
4. برای Provider مشکوک Kill Switch همان Provider/Operation را فعال کنید؛ کل پلتفرم آخرین گزینه است.
5. هر Restore باید Deletion Replay و Tenant Isolation Check را اجرا کند.

## ماتریس Triage

| علامت | بررسی اول | مهار | بازیابی | Evidence بستن رخداد |
|---|---|---|---|---|
| Cross-tenant denial | Audit + RLS policy | Freeze route/tenant | patch و negative test | query test + review |
| Provider error spike | SLO، version، rate limit | circuit breaker | rollback image/session re-auth | success window |
| Publish unknown | idempotency + provider lookup | pause destination | reconcile/receipt | unique provider post ID |
| Projection lag | outbox age/watermark | throttle backfill | replay idempotent consumer | zero diff sample |
| Vault/grant failure | broker health/TTL | stop new dispatch | restore/rotate grant path | no C4 in telemetry |
| Media scan hit | checksum/object key | quarantine/delete URL | rescan clean derivative | scan receipt |
| Storage pressure | growth/quota | stop low-priority upload | extend/expire per policy | capacity forecast |
| Telemetry leak | field/classification | stop sink/rotate secret | redacted re-ingest if allowed | integrity-preserving purge record |

## Runbookهای الزامی آینده

- S04: Local/CI bootstrap و dependency health.
- S09: Workflow replay، stuck activity، task queue migration.
- S10: alert routing، log/trace lookup، kill switch و audit export.
- S12: Vault outage، rotation، noVNC takeover.
- S15: malware quarantine، object restore و checksum mismatch.
- S36/S51/S54: reindex، analytics reload و graph reprojection.
- S58: PITR، full restore، deletion replay و RTO/RPO drill.

## چک‌لیست تغییر معماری

- ADR جدید یا Supersede ثبت شد.
- `architecture/system-model.json` و Threat Register به‌روز شد.
- Data Class و Retention هر Flow تعیین شد.
- Permission، Failure، Telemetry و Rollback مشخص است.
- Validator و Acceptance Evidence سبز است.

