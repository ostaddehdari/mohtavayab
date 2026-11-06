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
