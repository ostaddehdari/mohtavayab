import { randomUUID } from 'node:crypto';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type {
  CreateServiceAccountRequest,
  CreateWorkspaceRequest,
  InviteMemberRequest,
  WorkspacePermission,
  WorkspaceRole,
} from '@mohtavayab/contracts';
import type { UserRecord } from '../auth/auth.types.js';
import { CryptoService } from '../auth/crypto.service.js';
import { WorkspaceStore } from './workspace.store.js';
import { rolePermissions } from './workspace.types.js';

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly store: WorkspaceStore,
    private readonly crypto: CryptoService,
  ) {}

  async create(input: CreateWorkspaceRequest, user: UserRecord) {
    if (this.store.workspaceIdBySlug.has(input.slug))
      throw new ConflictException('workspace_slug_exists');
    const workspace = {
      id: randomUUID(),
      slug: input.slug,
      name: input.name,
      ownerUserId: user.id,
      status: 'active' as const,
      createdAt: new Date(),
    };
    await this.store.saveWorkspace(workspace);
    await this.store.saveMembership({
      workspaceId: workspace.id,
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      role: 'owner',
      status: 'active',
      joinedAt: new Date(),
    });
    await this.store.savePreference({
      userId: user.id,
      activeWorkspaceId: workspace.id,
      sidebarMode: 'expanded',
    });
    this.audit('workspace.created', workspace.id, user.id);
    return this.publicWorkspace(workspace, 'owner');
  }

  listForUser(userId: string) {
    return [...this.store.memberships.values()]
      .filter((item) => item.userId === userId && item.status === 'active')
      .map((membership) => {
        const workspace = this.store.workspaces.get(membership.workspaceId);
        return workspace ? this.publicWorkspace(workspace, membership.role) : undefined;
      })
      .filter((item) => item !== undefined);
  }

  summary(workspaceId: string, userId: string) {
    const membership = this.authorize(workspaceId, userId, 'workspace.read');
    const workspace = this.requireWorkspace(workspaceId);
    return {
      ...this.publicWorkspace(workspace, membership.role),
      permissions: rolePermissions[membership.role],
      member_count: [...this.store.memberships.values()].filter(
        (item) => item.workspaceId === workspaceId && item.status === 'active',
      ).length,
    };
  }

  listMembers(workspaceId: string, userId: string) {
    this.authorize(workspaceId, userId, 'member.read');
    return [...this.store.memberships.values()]
      .filter((item) => item.workspaceId === workspaceId)
      .map((item) => ({
        user_id: item.userId,
        email: item.email,
        display_name: item.displayName,
        role: item.role,
        status: item.status,
        joined_at: item.joinedAt.toISOString(),
      }));
  }

  async changeRole(
    workspaceId: string,
    actorUserId: string,
    targetUserId: string,
    role: Exclude<WorkspaceRole, 'owner'>,
  ) {
    this.authorize(workspaceId, actorUserId, 'member.manage');
    const membership = this.store.memberships.get(
      this.store.membershipKey(workspaceId, targetUserId),
    );
    if (!membership) throw new NotFoundException('membership_required');
    if (membership.role === 'owner') throw new ForbiddenException('last_owner_protected');
    membership.role = role;
    await this.store.saveMembership(membership);
    this.audit('workspace.member.role_changed', workspaceId, actorUserId, {
      target_user_id: targetUserId,
      role,
    });
    return { status: 'updated', role };
  }

  async invite(workspaceId: string, actorUserId: string, input: InviteMemberRequest) {
    this.authorize(workspaceId, actorUserId, 'member.invite');
    const token = this.crypto.randomToken();
    const invitation = {
      id: randomUUID(),
      workspaceId,
      email: input.email,
      role: input.role,
      tokenHash: this.crypto.tokenHash(token),
      invitedBy: actorUserId,
      expiresAt: new Date(Date.now() + 72 * 60 * 60_000),
      createdAt: new Date(),
    };
    await this.store.saveInvitation(invitation);
    this.audit('workspace.invitation.created', workspaceId, actorUserId, {
      invitation_id: invitation.id,
    });
    return {
      invitation_id: invitation.id,
      expires_at: invitation.expiresAt.toISOString(),
      ...(process.env.NODE_ENV === 'production' ? {} : { delivery_token: token }),
    };
  }

  async acceptInvitation(token: string, user: UserRecord) {
    const tokenHash = this.crypto.tokenHash(token);
    const invitation = [...this.store.invitations.values()].find((item) =>
      this.crypto.safeEqual(item.tokenHash, tokenHash),
    );
    if (!invitation || invitation.revokedAt || invitation.acceptedAt) {
      throw new UnauthorizedException('invitation_invalid');
    }
    if (invitation.expiresAt.getTime() <= Date.now())
      throw new UnauthorizedException('invitation_expired');
    if (invitation.email !== user.email) throw new UnauthorizedException('invitation_invalid');
    await this.store.saveMembership({
      workspaceId: invitation.workspaceId,
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      role: invitation.role,
      status: 'active',
      joinedAt: new Date(),
    });
    invitation.acceptedAt = new Date();
    await this.store.saveInvitation(invitation);
    this.audit('workspace.invitation.accepted', invitation.workspaceId, user.id, {
      invitation_id: invitation.id,
    });
    return { status: 'accepted', workspace_id: invitation.workspaceId };
  }

  listInvitations(workspaceId: string, userId: string) {
    this.authorize(workspaceId, userId, 'member.read');
    return [...this.store.invitations.values()]
      .filter((item) => item.workspaceId === workspaceId && !item.revokedAt)
      .map((item) => ({
        id: item.id,
        email: item.email,
        role: item.role,
        expires_at: item.expiresAt.toISOString(),
        status: item.acceptedAt ? 'accepted' : 'pending',
      }));
  }

  async createServiceAccount(
    workspaceId: string,
    actorUserId: string,
    input: CreateServiceAccountRequest,
  ) {
    this.authorize(workspaceId, actorUserId, 'service_account.manage');
    const secret = `mhsa_${this.crypto.randomToken()}`;
    const account = {
      id: randomUUID(),
      workspaceId,
      name: input.name,
      secretHash: this.crypto.tokenHash(secret),
      scopes: input.scopes,
      createdBy: actorUserId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + input.expires_in_days * 86_400_000),
    };
    await this.store.saveServiceAccount(account);
    this.audit('workspace.service_account.created', workspaceId, actorUserId, {
      service_account_id: account.id,
    });
    return {
      id: account.id,
      name: account.name,
      secret,
      scopes: account.scopes,
      expires_at: account.expiresAt.toISOString(),
    };
  }

  listServiceAccounts(workspaceId: string, userId: string) {
    this.authorize(workspaceId, userId, 'service_account.read');
    return [...this.store.serviceAccounts.values()]
      .filter((item) => item.workspaceId === workspaceId)
      .map((item) => ({
        id: item.id,
        name: item.name,
        scopes: item.scopes,
        expires_at: item.expiresAt.toISOString(),
        status: item.revokedAt ? 'revoked' : 'active',
      }));
  }

  async revokeServiceAccount(workspaceId: string, actorUserId: string, accountId: string) {
    this.authorize(workspaceId, actorUserId, 'service_account.manage');
    const account = this.store.serviceAccounts.get(accountId);
    if (!account || account.workspaceId !== workspaceId)
      throw new NotFoundException('service_account_invalid');
    account.revokedAt = new Date();
    await this.store.saveServiceAccount(account);
    this.audit('workspace.service_account.revoked', workspaceId, actorUserId, {
      service_account_id: accountId,
    });
    return { status: 'revoked' };
  }

  getPreference(userId: string) {
    const preference = this.store.preferences.get(userId) ?? {
      userId,
      activeWorkspaceId: undefined,
      sidebarMode: 'expanded' as const,
    };
    return {
      active_workspace_id: preference.activeWorkspaceId,
      sidebar_mode: preference.sidebarMode,
    };
  }

  async updatePreference(
    userId: string,
    input: {
      active_workspace_id?: string | undefined;
      sidebar_mode?: 'expanded' | 'compact' | undefined;
    },
  ) {
    if (input.active_workspace_id)
      this.authorize(input.active_workspace_id, userId, 'workspace.read');
    const current = this.store.preferences.get(userId) ?? {
      userId,
      activeWorkspaceId: undefined,
      sidebarMode: 'expanded' as const,
    };
    await this.store.savePreference({
      userId,
      activeWorkspaceId: input.active_workspace_id ?? current.activeWorkspaceId,
      sidebarMode: input.sidebar_mode ?? current.sidebarMode,
    });
    return this.getPreference(userId);
  }

  authorize(workspaceId: string, userId: string, permission: WorkspacePermission) {
    this.requireWorkspace(workspaceId);
    const membership = this.store.memberships.get(this.store.membershipKey(workspaceId, userId));
    if (!membership || membership.status !== 'active')
      throw new ForbiddenException('membership_required');
    if (!rolePermissions[membership.role].includes(permission))
      throw new ForbiddenException('permission_denied');
    return membership;
  }

  private requireWorkspace(workspaceId: string) {
    const workspace = this.store.workspaces.get(workspaceId);
    if (!workspace || workspace.status !== 'active')
      throw new NotFoundException('workspace_not_found');
    return workspace;
  }

  private publicWorkspace(
    workspace: { id: string; slug: string; name: string; status: string; createdAt: Date },
    role: WorkspaceRole,
  ) {
    return {
      id: workspace.id,
      slug: workspace.slug,
      name: workspace.name,
      status: workspace.status,
      role,
      created_at: workspace.createdAt.toISOString(),
    };
  }

  private audit(
    event: string,
    workspaceId: string,
    actorUserId: string,
    metadata: Record<string, string> = {},
  ): void {
    process.stdout.write(
      `${JSON.stringify({ event, workspace_id: workspaceId, actor_user_id: actorUserId, ...metadata, at: new Date().toISOString() })}\n`,
    );
  }
}
