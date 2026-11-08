import { describe, expect, it } from 'vitest';
import {
  architectureContextSchema,
  healthReportSchema,
  loginRequestSchema,
  passwordSchema,
  registerRequestSchema,
} from './index';

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

describe('auth contracts', () => {
  it('normalizes safe registration input', () => {
    expect(
      registerRequestSchema.parse({
        email: '  USER@Example.com ',
        password: 'یک-رمز-امن-۱۲۳۴۵',
        display_name: 'کاربر آزمایشی',
        accept_terms: true,
      }).email,
    ).toBe('user@example.com');
  });

  it('rejects weak passwords and invalid device identifiers', () => {
    expect(passwordSchema.safeParse('short').success).toBe(false);
    expect(
      loginRequestSchema.safeParse({
        email: 'user@example.com',
        password: 'anything',
        device_id: 'tiny',
      }).success,
    ).toBe(false);
  });
});
