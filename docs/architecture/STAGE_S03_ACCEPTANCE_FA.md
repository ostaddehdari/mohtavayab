# گزارش پذیرش S03 — معماری کلان و ADRها

## نتیجه

استیج S03 با ۴ Work و ۲۰ Task تکمیل شد. مرز Core/Provider، توپولوژی شبکه، مالکیت Storeها، ۶ ADR و Threat Model هجده‌تهدیدی به‌صورت انسانی و ماشین‌خوان قفل شدند. این خروجی قرارداد ورودی S04 و مبنای S06 تا S10 است.

## شواهد ۲۰ تسک

| Task | شواهد قابل بازبینی | نتیجه |
|---|---|---|
| S03-W01-T01 | دامنه و معیار پذیرش در `CORE_PROVIDER_BOUNDARIES_FA.md` | پاس |
| S03-W01-T02 | Envelope، Typed Error و ADR-0001 | پاس |
| S03-W01-T03 | مسیر E2E و ADR-0002 | پاس |
| S03-W01-T04 | Grant، Telemetry، Failure/Recovery | پاس |
| S03-W01-T05 | ممنوعیت‌ها، مدل ماشین‌خوان و Validator | پاس |
| S03-W02-T01 | Zoneها، محیط‌ها و معیار پذیرش در `DEPLOYMENT_NETWORK_MODEL_FA.md` | پاس |
| S03-W02-T02 | Connection Contract و ADR-0003 | پاس |
| S03-W02-T03 | Subpath، noVNC، Egress و ADR-0005 | پاس |
| S03-W02-T04 | RPO/RTO، Failure Matrix و Telemetry | پاس |
| S03-W02-T05 | Mermaid، System Model و Runbook | پاس |
| S03-W03-T01 | Store Matrix و معیار ورود فناوری | پاس |
| S03-W03-T02 | مالکیت/Tenant Isolation و ADR-0004 | پاس |
| S03-W03-T03 | Outbox E2E و ADR-0006 | پاس |
| S03-W03-T04 | Retention/Delete/Backup/Reconcile | پاس |
| S03-W03-T05 | Triggerهای ClickHouse/Neo4j و Validator | پاس |
| S03-W04-T01 | دارایی، Actor و Trust Boundary | پاس |
| S03-W04-T02 | STRIDE، Abuse Case و Threat Register | پاس |
| S03-W04-T03 | ۶ ADR و Decision Register | پاس |
| S03-W04-T04 | Prevent/Detect/Respond، Incident و Release Gate | پاس |
| S03-W04-T05 | Riskهای پذیرفته، Runbook و آزمون خودکار | پاس |

## تصمیم‌های قفل‌شده

1. Core یک Modular Monolith مرزبندی‌شده است؛ Providerها Runner ایزوله‌اند.
2. Provider هیچ دسترسی مستقیم به Data Plane ندارد و Secret فقط با Grant کوتاه‌عمر می‌گیرد.
3. Temporal Orchestrator پایدار است؛ Domain State در PostgreSQL می‌ماند.
4. PostgreSQL و MinIO منابع حقیقت‌اند؛ Search/Analytics/Graph Projection قابل‌بازسازی هستند.
5. Projection با Transactional Outbox و Reconciliation، بدون Dual-write ساخته می‌شود.
6. سایت Native زیر `/mohtavayab` Build و منتشر می‌شود.

## دموی پذیرش

سناریوی رومیزی تأییدشده: درخواست استخراج Tenant-scoped از Edge وارد Core می‌شود، Policy Snapshot و Workflow می‌سازد، Runner بدون DB Access با Grant کوتاه به Provider متصل می‌شود، نتیجهٔ Raw/Canonical و Outbox در Core Commit می‌شود و Projection قابل Replay است. سناریوهای Rate Limit، Secret leak prevention، Publish timeout/reconcile، Projection lag و Deletion Replay در اسناد Failure پوشش داده شده‌اند.

## Exit Gate

- [x] هر ۲۰ Task در Evidence Map ثبت است.
- [x] ۶ ADR با وضعیت Accepted و Revisit Trigger موجود است.
- [x] Architecture، Threat و Decision Register ماشین‌خوان هستند.
- [x] Permission، Telemetry، Failure و Runbook پوشش داده شده‌اند.
- [x] Validatorهای Roadmap، S01، S02 و S03 سبز هستند.
- [x] اسناد پایه و README به‌روز شده‌اند.

## ورودی استیج بعد

S04 باید بر همین قراردادها Monorepo `pnpm/Turborepo`، استاندارد TypeScript/Python، Dev Container/Compose، CI و کنترل Boundary را بسازد. در S04 هنوز Provider SDK کامل، Temporal Workflow محصولی یا Storeهای تحلیلی پیاده نمی‌شوند؛ آن‌ها متعلق به S08/S09/S36/S51/S54 هستند.
