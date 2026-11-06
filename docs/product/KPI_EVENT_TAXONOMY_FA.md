# KPI و واژگان رویدادهای محصول

شناسه تحویل: `S01-W03`  
نسخه: `1.0.0`

## North Star

**Weekly Qualified Content Outcomes (WQCO)**: تعداد یکتای `ContentItem`هایی که در یک هفته و در یک Workspace فعال، حداقل به یکی از خروجی‌های واجدکیفیت زیر رسیده‌اند:

- افزودن آگاهانه به Collection؛
- استفاده در گزارش/Export موفق؛
- ساخت نسخه پردازش‌شده و تأییدشده؛
- انتشار موفق با Delivery Receipt.

یک محتوا در هر Workspace و هفته فقط یک‌بار شمرده می‌شود. رویدادهای اتوماتیک، Retry، Duplicate و عملیات کاربران داخلی از شمارش حذف می‌شوند.

## Activation

Workspace در ۱۴ روز اول Activated است اگر همه شروط زیر را کامل کند:

1. حداقل دو عضو با دو نقش متفاوت؛
2. یک ProviderAccount سالم؛
3. یک Source معتبر؛
4. یک Backfill یا Watch موفق با حداقل ۲۰ ContentItem؛
5. یک Search/Collection؛
6. یک خروجی واجدکیفیت.

KPI: نرخ Activation، زمان تا اولین Account، زمان تا اولین Content و زمان تا اولین Outcome.

## KPIهای سطح محصول

| حوزه | KPI | تعریف | هدف پایلوت |
|---|---|---|---:|
| ارزش | WQCO | محتوای یکتای رسیده به Outcome | روند هفتگی صعودی |
| پذیرش | Activated Workspace Rate | Workspace فعال‌شده / ثبت‌شده واجد شرایط | ≥ 60% |
| ماندگاری | W4 Retention | Workspace فعال در هفته ۴ / Activated cohort | ≥ 50% |
| استخراج | Backfill Success | Run کامل یا Partial پذیرفته / Run شروع‌شده | ≥ 95% |
| تازگی | Watch Freshness P95 | فاصله انتشار منبع تا ثبت در Library | طبق Provider، ≤ 60 دقیقه |
| کیفیت | Duplicate Rate | Duplicate عبورکرده / Content دریافت‌شده | < 0.5% |
| رسانه | Media Completeness | Asset موفق / Asset مورد انتظار | ≥ 98% |
| جست‌وجو | Search Success | Session با نتیجه باز/ذخیره / Search session | ≥ 70% |
| انتشار | Delivery Success | Receipt موفق / Delivery attempt نهایی | ≥ 97% |
| ایمنی | Unauthorized Access | دسترسی تاییدشده خارج Tenant/Scope | صفر |
| بازیابی | Resume Success | Workflow بازیابی‌شده بدون Duplicate/Cursor loss | 100% در تست |

اهداف عددی پس از Pilot Baseline بازتنظیم می‌شوند و نباید برای پنهان‌کردن تفاوت Providerها میانگین‌گیری گمراه‌کننده شود.

## SLI و SLO عملیاتی

| سرویس | SLI | SLO اولیه |
|---|---|---|
| Core API | درخواست موفق غیر۵xx | 99.9% ماهانه پس از Production |
| Search | P95 latency برای Query معمول | کمتر از ۲ ثانیه روی ۱۰ میلیون سند |
| Workflow | از دست‌نرفتن Job پس از Restart | 100% در آزمون Recovery |
| Publish | عدم ارسال تکراری با Idempotency key | 100% |
| Media | Checksum معتبر پس از Upload/Download | 100% نمونه‌های پذیرفته |
| Audit | پوشش عملیات حساس | 100% |

## قرارداد مشترک Event

```json
{
  "event_id": "uuid",
  "event_name": "extraction_run_completed",
  "event_version": 1,
  "occurred_at": "ISO-8601 UTC",
  "received_at": "ISO-8601 UTC",
  "tenant_id": "uuid",
  "workspace_id": "uuid",
  "actor_type": "user|service|system",
  "actor_id": "pseudonymous-id",
  "session_id": "uuid|null",
  "correlation_id": "uuid",
  "causation_id": "uuid|null",
  "provider_code": "telegram|null",
  "source_id": "uuid|null",
  "content_id": "uuid|null",
  "properties": {},
  "privacy_class": "operational|product|security"
}
```

### قواعد

- متن محتوا، Secret، Cookie، OTP، Token، رمز و URL امضاشده در Event ممنوع است.
- `event_name` با فعل گذشته و `snake_case` نام‌گذاری می‌شود.
- تغییر معنی نیازمند افزایش `event_version` است.
- Backend رویداد حقیقت را تولید می‌کند؛ Frontend فقط Intent/UX event می‌فرستد.
- همه رویدادهای چندمستاجری `tenant_id` و `workspace_id` دارند.
- Event تحلیلی جای Audit امنیتی را نمی‌گیرد.

## Taxonomy رویدادها

### هویت و Workspace

`user_signed_in`، `mfa_challenge_completed`، `workspace_created`، `member_invited`، `member_role_changed`، `service_account_created`

### حساب و Provider

`account_connect_started`، `account_auth_challenged`، `account_connected`، `account_connection_failed`، `account_revoked`، `account_quarantined`، `account_cooldown_started`، `account_pool_member_added`

### Source و استخراج

`source_resolved`، `source_resolution_failed`، `extraction_job_created`، `extraction_run_started`، `extraction_checkpoint_committed`، `extraction_run_paused`، `extraction_run_resumed`، `extraction_run_completed`، `extraction_run_failed`، `watch_cycle_completed`

### محتوا و جست‌وجو

`content_item_persisted`، `media_asset_verified`، `search_executed`، `search_result_opened`، `saved_search_created`، `collection_created`، `collection_item_added`، `collection_snapshot_created`، `export_completed`

### Rule و AI

`rule_dry_run_completed`، `content_version_created`، `ai_task_requested`، `ai_task_completed`، `ai_task_failed`، `content_version_submitted`، `content_version_approved`، `content_version_rejected`

### انتقال و انتشار

`transfer_plan_created`، `schedule_item_created`، `delivery_attempt_started`، `delivery_receipt_succeeded`، `delivery_receipt_failed`، `delivery_retry_scheduled`، `delivery_cancelled`

### عملیات و امنیت

`provider_kill_switch_changed`، `permission_denied`، `support_access_granted`، `support_access_revoked`، `secret_rotated`، `workspace_export_completed`، `workspace_deletion_requested`

## ویژگی‌های اجباری رویدادهای کلیدی

| Event | Properties مجاز و لازم |
|---|---|
| `account_connected` | `auth_mode`, `capability_codes`, `duration_ms` |
| `extraction_run_completed` | `strategy`, `items_new`, `items_duplicate`, `assets_ok`, `assets_failed`, `duration_ms`, `completion_state` |
| `search_executed` | `query_fingerprint`, `facet_count`, `result_count`, `duration_ms`, `search_mode` |
| `collection_item_added` | `collection_type`, `provider_code`, `position` |
| `ai_task_completed` | `task_type`, `model_alias`, `prompt_version`, `tokens_in`, `tokens_out`, `duration_ms`; بدون متن |
| `delivery_receipt_succeeded` | `destination_type`, `delivery_mode`, `media_count`, `duration_ms` |
| `permission_denied` | `resource_type`, `action`, `policy_code`; بدون داده منبع |

## قیف‌ها و داشبوردها

1. Onboarding: `workspace_created → account_connected → source_resolved → extraction_run_completed → collection_created`.
2. Research: `search_executed → search_result_opened → collection_item_added → export_completed`.
3. Publishing: `transfer_plan_created → content_version_approved → schedule_item_created → delivery_receipt_succeeded`.
4. Reliability: Run started/completed/failed، Retry، Checkpoint lag، Duplicate و Media completeness.
5. Safety: Permission denied، Quarantine، Kill switch، Support access و Secret rotation.

## کیفیت داده و کنترل خطا

- Producer و Consumer با JSON Schema و Contract Test نسخه‌دار می‌شوند.
- رویداد بدون Envelope معتبر Reject و در Dead Letter شمارش می‌شود.
- Event ID یکتا و Ingestion idempotent است.
- Clock skew، late event و duplicate event پایش می‌شوند.
- Dashboard باید Provider و Workspace plan را Facet کند تا میانگین‌ها واقعیت را پنهان نکنند.

## معیار پذیرش W03

- North Star دقیق، قابل محاسبه و مقاوم به شمارش تکراری است.
- Activation، Retention، Reliability، Quality و Safety KPI دارند.
- Event envelope حریم خصوصی و Versioning را پوشش می‌دهد.
- Taxonomy برای سفرهای W02 کافی و مستقیماً قابل پیاده‌سازی است.

