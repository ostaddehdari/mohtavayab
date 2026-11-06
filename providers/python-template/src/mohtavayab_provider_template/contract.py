"""Architecture-level provider primitives; the complete SDK belongs to stage S08."""

from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True, slots=True)
class ProviderContext:
    tenant_id: str
    workspace_id: str
    correlation_id: str
    idempotency_key: str
    deadline_at: datetime
    policy_snapshot_id: str

    def __post_init__(self) -> None:
        for field_name in (
            "tenant_id",
            "workspace_id",
            "correlation_id",
            "idempotency_key",
            "policy_snapshot_id",
        ):
            if not getattr(self, field_name).strip():
                raise ValueError(f"{field_name} is required")


def health(version: str = "dev") -> dict[str, str]:
    """Return a stable, secret-free health payload."""
    return {
        "status": "ok",
        "service": "provider-runner",
        "version": version,
        "basePath": "/mohtavayab",
    }
