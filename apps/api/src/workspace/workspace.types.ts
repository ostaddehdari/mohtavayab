import type { WorkspacePermission, WorkspaceRole } from '@mohtavayab/contracts';

export type WorkspaceRecord = {
  id: string;
  slug: string;
  name: string;
  ownerUserId: string;
  status: 'active' | 'suspended' | 'deleting';
  createdAt: Date;
};

export type MembershipRecord = {
  workspaceId: string;
  userId: string;
  email: string;
  displayName: string;
  role: WorkspaceRole;
  status: 'active' | 'suspended';
  joinedAt: Date;
};

export type InvitationRecord = {
  id: string;
  workspaceId: string;
  email: string;
  role: Exclude<WorkspaceRole, 'owner'>;
  tokenHash: string;
  invitedBy: string;
  expiresAt: Date;
  createdAt: Date;
  acceptedAt?: Date;
  revokedAt?: Date;
};

export type ServiceAccountRecord = {
  id: string;
  workspaceId: string;
  name: string;
  secretHash: string;
  scopes: WorkspacePermission[];
  createdBy: string;
  createdAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
};

export type WorkspacePreferenceRecord = {
  userId: string;
  activeWorkspaceId: string | undefined;
  sidebarMode: 'expanded' | 'compact';
};

export const rolePermissions: Record<WorkspaceRole, readonly WorkspacePermission[]> = {
  owner: [
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
  ],
  admin: [
    'workspace.read',
    'workspace.update',
    'member.read',
    'member.invite',
    'member.manage',
    'role.read',
    'service_account.read',
    'service_account.manage',
    'source.read',
    'source.manage',
    'content.read',
    'content.edit',
    'content.publish',
    'analytics.read',
    'audit.read',
  ],
  analyst: ['workspace.read', 'member.read', 'source.read', 'content.read', 'analytics.read'],
  editor: ['workspace.read', 'member.read', 'source.read', 'content.read', 'content.edit'],
  publisher: [
    'workspace.read',
    'member.read',
    'source.read',
    'content.read',
    'content.edit',
    'content.publish',
  ],
  viewer: ['workspace.read', 'content.read'],
};
