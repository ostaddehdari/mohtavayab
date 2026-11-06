# محیط توسعهٔ هادی / محتوا‌یاب

> شناسه تحویل: S04-W01 تا S04-W04 — این سند محیط توسعه را آماده می‌کند و به معنی نصب Production نیست.

## دامنه و معیار پذیرش

خروجی S04 باید از یک Clone تمیز با نسخه‌های Pin‌شده نصب شود، Web/API/Contracts/Python Template را Build/Test کند، سرویس‌های محلی را با شبکهٔ محدود بالا بیاورد و همان Quality Gate را در GitHub Actions اجرا کند.

## ساختار Monorepo

```text
apps/
  web/                 Next.js 16، RTL و basePath
  api/                 NestJS 12 و health API
packages/
  contracts/           قراردادهای Runtime مستقل
providers/
  python-template/     الگوی ایزوله بدون DB client
infra/
  compose/             زیرساخت Local
  observability/       OTel redaction baseline
tools/                 validatorهای معماری و Stage
```

`pnpm-workspace.yaml` تنها `apps/*` و `packages/*` را مدیریت می‌کند. Python با uv workspace مستقل است. Turborepo ترتیب Build و Cache را کنترل می‌کند؛ وابستگی Workspace چرخه‌ای ممنوع است.

## نسخه‌های مبنا

| ابزار                     |                      نسخه Pin شده | نقش                       |
| ------------------------- | --------------------------------: | ------------------------- |
| Node.js                   |                            24.15+ | Runtime و Tooling         |
| pnpm                      |                           12.18.0 | Workspace و Lockfile      |
| Turborepo                 |                           2.11.10 | Task graph و Cache        |
| Next.js / React           |                   16.4.5 / 19.3.1 | Web                       |
| NestJS                    |                            12.4.0 | Core API                  |
| TypeScript                |                             6.0.3 | Strict type system        |
| Python                    |               3.12 تا پیش از 3.14 | Provider runtime baseline |
| uv / Ruff / mypy / pytest | 0.13.5 / 0.14.13 / 1.19.1 / 9.0.2 | Python lock/quality/test  |

تغییر نسخه در یک PR مستقل با Lockfile، Build و Migration Note انجام می‌شود.

## راه‌اندازی سریع

### Dev Container

1. مخزن را Clone و `.env.example` را به `.env` کپی کنید.
2. Passwordهای Local را تغییر دهید.
3. دستور **Dev Containers: Reopen in Container** را اجرا کنید.
4. `postCreateCommand` با Lockfileهای ثابت Dependencyها را نصب می‌کند.

### Ubuntu/WSL

```bash
cp .env.example .env
bash scripts/bootstrap-dev.sh
pnpm quality
docker compose --env-file .env -f infra/compose/compose.dev.yml up -d
pnpm dev
```

آدرس‌ها: Web روی `http://localhost:3000/mohtavayab`، API سلامت روی `http://localhost:3001/mohtavayab/api/health`، Temporal UI روی `127.0.0.1:8233` و MinIO Console روی `127.0.0.1:9001`.

## استاندارد TypeScript

- `strict`، `noUncheckedIndexedAccess`، `exactOptionalPropertyTypes` و `noImplicitOverride` اجباری‌اند.
- Import نوع با `import type` و Promise بدون انتظار ممنوع است.
- Contract مشترک در `packages/contracts` قرار می‌گیرد؛ Appها Source یکدیگر را Import نمی‌کنند.
- API Body/Header و Secret در Log ثبت نمی‌شوند؛ Telemetry فقط Metadata Allowlist دارد.
- Test کنار Source و نام آن `*.test.ts` است.

## استاندارد Python

- Python 3.12 baseline، Type Hint کامل و mypy strict.
- Ruff برای Lint/Format و pytest با strict config.
- Provider به Core DB client وابسته نمی‌شود و Context شامل Tenant/Correlation/Idempotency/Deadline است.
- `uv.lock` تنها مسیر نصب CI و Dev Container است.

## Compose و شبکه

Compose توسعه PostgreSQL، Redis، MinIO، Temporal/UI و OTel Collector را فراهم می‌کند. تمام Portها فقط روی `127.0.0.1` Bind شده‌اند و شبکه‌های Data/Workflow/Observability داخلی‌اند. Passwordهای فایل نمونه صرفاً Placeholder محلی‌اند؛ استفادهٔ Staging/Production ممنوع است.

OpenSearch، ClickHouse و Neo4j عمداً در S04 اجرا نمی‌شوند؛ طبق ADR-0004 فقط در استیج و Trigger مربوط اضافه خواهند شد.

## Quality Gate

```bash
pnpm validate
pnpm check:boundaries
pnpm check:environment
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

GitHub Actions با Permission فقط `contents: read`، نصب Frozen، Cache رسمی و Cancel-in-progress همین Gate را اجرا می‌کند. Merge با شکست هر مرحله ممنوع است.

## خطا و Runbook

| خطا               | علت محتمل                             | اقدام                                                                |
| ----------------- | ------------------------------------- | -------------------------------------------------------------------- |
| Lockfile mismatch | Manifest بدون Lock update             | Lockfile را در همان PR بازتولید کنید                                 |
| Boundary failure  | Import ممنوع یا DB client در Provider | Dependency را پشت Contract منتقل کنید                                |
| Base path failure | Route/Asset متکی به `/`               | از Next Link/basePath و Public Base URL استفاده کنید                 |
| Compose unhealthy | Port اشغال/Volume خراب/رمز ناسازگار   | `docker compose ps` و Log؛ Volume را بدون تأیید حذف نکنید            |
| Python mismatch   | نسخه خارج بازه یا uv lock قدیمی       | Python 3.12 و `uv lock --check`                                      |
| Secret in commit  | `.env` یا Credential واقعی            | Push را متوقف، Secret را Rotate و History را پاک‌سازی کنترل‌شده کنید |

## Telemetry توسعه

API برای هر درخواست `request_id`، method، path، status و duration را Structured ثبت می‌کند؛ Body/Header ثبت نمی‌شود. OTel Collector Headerهای Authorization/Cookie را حذف و `enduser.id` را Hash می‌کند. این Baseline جایگزین S10 نیست.

## معیار پذیرش چهار Work

- W01: Workspace، Turbo graph، دو App و Contract package Build می‌شوند.
- W02: TypeScript/Python strict، Lint/Format/Test و Lockfile موجود است.
- W03: Dev Container و Compose شبکه‌بندی‌شده با Healthcheck موجود است.
- W04: CI کمینه‌اختیار، Boundary/Environment Validator و Quality Gate سبز است.
