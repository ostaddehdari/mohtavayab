import { z } from 'zod';

export const healthReportSchema = z.object({
  status: z.literal('ok'),
  service: z.enum(['web', 'api', 'provider-runner']),
  version: z.string().min(1).max(128),
  basePath: z.literal('/mohtavayab'),
});

export type HealthReport = z.infer<typeof healthReportSchema>;

export const architectureContextSchema = z.object({
  tenant_id: z.string().min(1),
  workspace_id: z.string().min(1),
  correlation_id: z.string().min(1),
  idempotency_key: z.string().min(1),
  deadline_at: z.iso.datetime(),
  policy_snapshot_id: z.string().min(1),
});

export type ArchitectureContext = z.infer<typeof architectureContextSchema>;

export const emailSchema = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
  z.email().max(254),
);
export const passwordSchema = z
  .string()
  .min(12)
  .max(128)
  .refine((value) => /\p{L}/u.test(value) && /\p{N}/u.test(value), {
    message: 'password_requires_letter_and_number',
  });

export const registerRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  display_name: z.string().trim().min(2).max(80),
  accept_terms: z.literal(true),
});

export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
  device_id: z.string().regex(/^[A-Za-z0-9_-]{16,128}$/),
  remember_device: z.boolean().default(false),
});

export const mfaVerifyRequestSchema = z.object({
  challenge_id: z.uuid(),
  code: z.string().regex(/^\d{6}$|^[A-F0-9]{8}-[A-F0-9]{8}$/),
});

export const refreshRequestSchema = z.object({
  device_id: z.string().regex(/^[A-Za-z0-9_-]{16,128}$/),
});

export const passwordRecoveryRequestSchema = z.object({ email: emailSchema });
export const passwordRecoveryConfirmSchema = z.object({
  token: z.string().min(32).max(256),
  password: passwordSchema,
});

export const authErrorCodeSchema = z.enum([
  'invalid_credentials',
  'account_locked',
  'mfa_required',
  'invalid_mfa',
  'invalid_session',
  'refresh_reuse_detected',
  'rate_limited',
  'oidc_failed',
  'recovery_failed',
  'validation_failed',
]);

export const authSessionSchema = z.object({
  id: z.uuid(),
  created_at: z.iso.datetime(),
  last_seen_at: z.iso.datetime(),
  expires_at: z.iso.datetime(),
  device_label: z.string().max(120),
  current: z.boolean(),
  assurance: z.enum(['password', 'mfa', 'oidc']),
});

export const authOutcomeSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('authenticated'), access_expires_at: z.iso.datetime() }),
  z.object({
    status: z.literal('mfa_required'),
    challenge_id: z.uuid(),
    expires_at: z.iso.datetime(),
  }),
]);

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type MfaVerifyRequest = z.infer<typeof mfaVerifyRequestSchema>;
export type AuthSession = z.infer<typeof authSessionSchema>;
export type AuthOutcome = z.infer<typeof authOutcomeSchema>;
