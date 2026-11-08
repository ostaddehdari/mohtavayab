import { Injectable, type OnModuleInit } from '@nestjs/common';
import type { WorkspacePermission, WorkspaceRole } from '@mohtavayab/contracts';
import { DatabaseService } from '../database/database.service.js';
import type {
  InvitationRecord,
  MembershipRecord,
  ServiceAccountRecord,
  WorkspacePreferenceRecord,
  WorkspaceRecord,
} from './workspace.types.js';

@Injectable()
export class WorkspaceStore implements OnModuleInit {
  readonly workspaces = new Map<string, WorkspaceRecord>();
  readonly workspaceIdBySlug = new Map<string, string>();
  readonly memberships = new Map<string, MembershipRecord>();
  readonly invitations = new Map<string, InvitationRecord>();
  readonly serviceAccounts = new Map<string, ServiceAccountRecord>();
  readonly preferences = new Map<string, WorkspacePreferenceRecord>();

  constructor(private readonly database: DatabaseService) {}

  async onModuleInit(): Promise<void> {
    if (!this.database.enabled) return;
    const workspaces = await this.database.query<{
      id: string;
      slug: string;
      name: string;
      owner_user_id: string;
      status: WorkspaceRecord['status'];
      created_at: Date;
    }>('SELECT id, slug, name, owner_user_id, status, created_at FROM tenancy.workspaces');
    for (const item of workspaces) {
      const workspace = {
        id: item.id,
        slug: item.slug,
        name: item.name,
        ownerUserId: item.owner_user_id,
        status: item.status,
        createdAt: new Date(item.created_at),
      };
      this.workspaces.set(workspace.id, workspace);
      this.workspaceIdBySlug.set(workspace.slug, workspace.id);
    }
    const memberships = await this.database.query<{
      workspace_id: string;
      user_id: string;
      email_normalized: string;
      display_name: string;
      role_key: WorkspaceRole;
      status: MembershipRecord['status'];
      joined_at: Date;
    }>(`SELECT m.workspace_id, m.user_id, u.email_normalized, u.display_name, m.role_key, m.status, m.joined_at
        FROM tenancy.memberships m JOIN identity.users u ON u.id = m.user_id`);
    for (const item of memberships) {
      const membership: MembershipRecord = {
        workspaceId: item.workspace_id,
        userId: item.user_id,
        email: item.email_normalized,
        displayName: item.display_name,
        role: item.role_key,
        status: item.status,
        joinedAt: new Date(item.joined_at),
      };
      this.memberships.set(
        this.membershipKey(membership.workspaceId, membership.userId),
        membership,
      );
    }
    const invitations = await this.database.query<{
      id: string;
      workspace_id: string;
      email_normalized: string;
      role_key: Exclude<WorkspaceRole, 'owner'>;
      token_hash: string;
      invited_by: string;
      expires_at: Date;
      created_at: Date;
      accepted_at?: Date;
      revoked_at?: Date;
    }>('SELECT * FROM tenancy.invitations');
    for (const item of invitations) {
      this.invitations.set(item.id, {
        id: item.id,
        workspaceId: item.workspace_id,
        email: item.email_normalized,
        role: item.role_key,
        tokenHash: item.token_hash,
        invitedBy: item.invited_by,
        expiresAt: new Date(item.expires_at),
        createdAt: new Date(item.created_at),
        ...(item.accepted_at ? { acceptedAt: new Date(item.accepted_at) } : {}),
        ...(item.revoked_at ? { revokedAt: new Date(item.revoked_at) } : {}),
      });
    }
    const serviceAccounts = await this.database.query<{
      id: string;
      workspace_id: string;
      name: string;
      secret_hash: string;
      scopes: WorkspacePermission[];
      created_by: string;
      created_at: Date;
      expires_at: Date;
      revoked_at?: Date;
    }>('SELECT * FROM tenancy.service_accounts');
    for (const item of serviceAccounts) {
      this.serviceAccounts.set(item.id, {
        id: item.id,
        workspaceId: item.workspace_id,
        name: item.name,
        secretHash: item.secret_hash,
        scopes: item.scopes,
        createdBy: item.created_by,
        createdAt: new Date(item.created_at),
        expiresAt: new Date(item.expires_at),
        ...(item.revoked_at ? { revokedAt: new Date(item.revoked_at) } : {}),
      });
    }
    const preferences = await this.database.query<{
      user_id: string;
      active_workspace_id?: string;
      sidebar_mode: 'expanded' | 'compact';
    }>('SELECT user_id,active_workspace_id,sidebar_mode FROM tenancy.user_preferences');
    for (const item of preferences) {
      this.preferences.set(item.user_id, {
        userId: item.user_id,
        activeWorkspaceId: item.active_workspace_id,
        sidebarMode: item.sidebar_mode,
      });
    }
  }

  membershipKey(workspaceId: string, userId: string): string {
    return `${workspaceId}:${userId}`;
  }

  async saveWorkspace(record: WorkspaceRecord): Promise<void> {
    this.workspaces.set(record.id, record);
    this.workspaceIdBySlug.set(record.slug, record.id);
    if (!this.database.enabled) return;
    await this.database.query(
      `INSERT INTO tenancy.workspaces (id, slug, name, owner_user_id, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status, updated_at = now()`,
      [record.id, record.slug, record.name, record.ownerUserId, record.status, record.createdAt],
    );
  }

  async saveMembership(record: MembershipRecord): Promise<void> {
    this.memberships.set(this.membershipKey(record.workspaceId, record.userId), record);
    if (!this.database.enabled) return;
    await this.database.query(
      `INSERT INTO tenancy.memberships (workspace_id, user_id, role_key, status, joined_at)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (workspace_id,user_id) DO UPDATE SET role_key=EXCLUDED.role_key,status=EXCLUDED.status`,
      [record.workspaceId, record.userId, record.role, record.status, record.joinedAt],
    );
  }

  async saveInvitation(record: InvitationRecord): Promise<void> {
    this.invitations.set(record.id, record);
    if (!this.database.enabled) return;
    await this.database.query(
      `INSERT INTO tenancy.invitations (id,workspace_id,email_normalized,role_key,token_hash,invited_by,expires_at,created_at,accepted_at,revoked_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE SET accepted_at=EXCLUDED.accepted_at,revoked_at=EXCLUDED.revoked_at`,
      [
        record.id,
        record.workspaceId,
        record.email,
        record.role,
        record.tokenHash,
        record.invitedBy,
        record.expiresAt,
        record.createdAt,
        record.acceptedAt,
        record.revokedAt,
      ],
    );
  }

  async saveServiceAccount(record: ServiceAccountRecord): Promise<void> {
    this.serviceAccounts.set(record.id, record);
    if (!this.database.enabled) return;
    await this.database.query(
      `INSERT INTO tenancy.service_accounts (id,workspace_id,name,secret_hash,scopes,created_by,created_at,expires_at,revoked_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,scopes=EXCLUDED.scopes,revoked_at=EXCLUDED.revoked_at`,
      [
        record.id,
        record.workspaceId,
        record.name,
        record.secretHash,
        record.scopes,
        record.createdBy,
        record.createdAt,
        record.expiresAt,
        record.revokedAt,
      ],
    );
  }

  async savePreference(record: WorkspacePreferenceRecord): Promise<void> {
    this.preferences.set(record.userId, record);
    if (!this.database.enabled) return;
    await this.database.query(
      `INSERT INTO tenancy.user_preferences (user_id,active_workspace_id,sidebar_mode)
       VALUES ($1,$2,$3) ON CONFLICT (user_id) DO UPDATE SET active_workspace_id=EXCLUDED.active_workspace_id,sidebar_mode=EXCLUDED.sidebar_mode,updated_at=now()`,
      [record.userId, record.activeWorkspaceId, record.sidebarMode],
    );
  }
}
