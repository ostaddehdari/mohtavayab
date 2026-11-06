from datetime import UTC, datetime

import pytest

from mohtavayab_provider_template import ProviderContext, health


def test_health_is_secret_free() -> None:
    assert health() == {
        "status": "ok",
        "service": "provider-runner",
        "version": "dev",
        "basePath": "/mohtavayab",
    }


def test_context_requires_tenant_scope() -> None:
    with pytest.raises(ValueError, match="tenant_id"):
        ProviderContext(
            tenant_id="",
            workspace_id="ws_demo",
            correlation_id="cor_demo",
            idempotency_key="idem_demo",
            deadline_at=datetime.now(UTC),
            policy_snapshot_id="pol_demo",
        )
