import { describe, expect, it } from 'vitest';
import { architectureContextSchema, healthReportSchema } from './index';

describe('shared contracts', () => {
  it('accepts the stable health response', () => {
    expect(
      healthReportSchema.parse({
        status: 'ok',
        service: 'api',
        version: 'dev',
        basePath: '/mohtavayab',
      }),
    ).toMatchObject({ service: 'api' });
  });

  it('rejects a provider call without tenant scope', () => {
    expect(() =>
      architectureContextSchema.parse({
        workspace_id: 'ws_demo',
        correlation_id: 'cor_demo',
        idempotency_key: 'idem_demo',
        deadline_at: '2026-11-07T03:00:00Z',
        policy_snapshot_id: 'pol_demo',
      }),
    ).toThrow();
  });
});
