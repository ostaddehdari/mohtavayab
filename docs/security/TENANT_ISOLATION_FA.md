# Tenant Isolation

ایزولیشن در دو لایه اعمال می‌شود:

1. `WorkspaceService.authorize` عضویت و Permission را پیش از عملیات بررسی می‌کند.
2. PostgreSQL RLS مقدار `app.workspace_id` را در محدوده همان Transaction الزام می‌کند.

Migration `0002_tenancy_rbac.sql` روی Workspace، Membership، Invitation و Service Account سیاست RLS دارد. نقش Runtime پایگاه داده نباید Owner جدول یا دارای `BYPASSRLS` باشد. Migration با نقش جداگانه اجرا می‌شود. هر Repository عملیاتی باید از `DatabaseService.inWorkspace` استفاده کند تا `set_config(..., true)` فقط تا پایان Transaction معتبر باشد.

## آزمون منفی اجباری

- عضو Workspace الف نباید Summary، عضو یا Service Account فضای ب را بخواند.
- Analyst نباید `member.manage` دریافت کند.
- نبود Tenant context باید fail-closed باشد.
- Service Account فقط Scopeهای ثبت‌شده همان Workspace را دریافت می‌کند.
