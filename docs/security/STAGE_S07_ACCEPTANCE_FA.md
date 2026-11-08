# گزارش پذیرش S07 ـ Workspace، چندمستاجری و RBAC

تاریخ تکمیل: ۱۷ آبان ۱۴۰۵

| Task        | وضعیت | شاهد                                                  |
| ----------- | ----- | ----------------------------------------------------- |
| S07-W01-T01 | done  | دامنه و معیارهای Workspace در WORKSPACE_MEMBERSHIP_FA |
| S07-W01-T02 | done  | قرارداد Zod و Migration tenancy                       |
| S07-W01-T03 | done  | WorkspaceService و API انتهابه‌انتها                  |
| S07-W01-T04 | done  | عضویت اجباری، Audit و fail-closed                     |
| S07-W01-T05 | done  | تست سرویس و رابط مدیریت اعضا                          |
| S07-W02-T01 | done  | شش نقش پایه و default deny                            |
| S07-W02-T02 | done  | Permission contract و RBAC_MATRIX_FA                  |
| S07-W02-T03 | done  | Authorize مرکزی برای Endpointها                       |
| S07-W02-T04 | done  | جلوگیری از escalation و حفاظت مالک                    |
| S07-W02-T05 | done  | تست مجوز تحلیل‌گر و UI نقش‌ها                         |
| S07-W03-T01 | done  | تعریف مرز Tenant در TENANT_ISOLATION_FA               |
| S07-W03-T02 | done  | RLS و app.workspace_id                                |
| S07-W03-T03 | done  | DatabaseService.inWorkspace                           |
| S07-W03-T04 | done  | آزمون منفی دسترسی بین Tenantها                        |
| S07-W03-T05 | done  | Validator خودکار tenancy                              |
| S07-W04-T01 | done  | سیاست دعوت و حساب خدمت                                |
| S07-W04-T02 | done  | قرارداد توکن، Scope و انقضا                           |
| S07-W04-T03 | done  | API دعوت و Service Account                            |
| S07-W04-T04 | done  | توکن یک‌بارمصرف، Hash و Audit                         |
| S07-W04-T05 | done  | تست پذیرش و دموی تعاملی                               |

## نتیجه

- ۴ Work و ۲۰ Task تکمیل شد.
- AuthStore وعده‌داده‌شده در S06 به PostgreSQL متصل شد و حالت memory فقط برای تست باقی ماند.
- رابط RTL اعضا، نقش‌ها، دعوت‌ها و حساب‌های خدمت اضافه شد.
- مرحله جاری به S08، Provider Registry و SDK منتقل می‌شود.
