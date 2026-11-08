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

export const workspaceSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9][a-z0-9-]{2,47}$/);

export const workspaceRoleSchema = z.enum([
  'owner',
  'admin',
  'analyst',
  'editor',
  'publisher',
  'viewer',
]);

export const workspacePermissionSchema = z.enum([
  'workspace.read',
  'workspace.update',
  'member.read',
  'member.invite',
  'member.manage',
  'role.read',
  'role.manage',
  'service_account.read',
  'service_account.manage',
  'source.read',
  'source.manage',
  'content.read',
  'content.edit',
  'content.publish',
  'analytics.read',
  'audit.read',
]);

export const createWorkspaceRequestSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: workspaceSlugSchema,
});

export const inviteMemberRequestSchema = z.object({
  email: emailSchema,
  role: workspaceRoleSchema.exclude(['owner']),
});

export const acceptInvitationRequestSchema = z.object({ token: z.string().min(32).max(256) });

export const updateMemberRoleRequestSchema = z.object({
  role: workspaceRoleSchema.exclude(['owner']),
});

export const createServiceAccountRequestSchema = z.object({
  name: z.string().trim().min(2).max(80),
  scopes: z.array(workspacePermissionSchema).min(1).max(16),
  expires_in_days: z.number().int().min(1).max(365).default(90),
});

export const workspacePreferenceRequestSchema = z.object({
  active_workspace_id: z.uuid().optional(),
  sidebar_mode: z.enum(['expanded', 'compact']).optional(),
});

export const workspaceErrorCodeSchema = z.enum([
  'workspace_not_found',
  'membership_required',
  'permission_denied',
  'last_owner_protected',
  'invitation_invalid',
  'invitation_expired',
  'service_account_invalid',
  'tenant_context_required',
  'workspace_slug_exists',
]);

export type WorkspaceRole = z.infer<typeof workspaceRoleSchema>;
export type WorkspacePermission = z.infer<typeof workspacePermissionSchema>;
export type CreateWorkspaceRequest = z.infer<typeof createWorkspaceRequestSchema>;
export type InviteMemberRequest = z.infer<typeof inviteMemberRequestSchema>;
export type CreateServiceAccountRequest = z.infer<typeof createServiceAccountRequestSchema>;
