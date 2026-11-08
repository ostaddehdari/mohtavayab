import { describe, expect, it } from 'vitest';
import { AuthConfig } from '../auth/auth.config.js';
import type { UserRecord } from '../auth/auth.types.js';
import { CryptoService } from '../auth/crypto.service.js';
import type { DatabaseService } from '../database/database.service.js';
import { WorkspaceService } from './workspace.service.js';
import { WorkspaceStore } from './workspace.store.js';

function setup() {
  const database = { enabled: false } as DatabaseService;
  const store = new WorkspaceStore(database);
  const crypto = new CryptoService(new AuthConfig());
  return { store, service: new WorkspaceService(store, crypto) };
}

function user(id: string, email: string): UserRecord {
  return {
    id,
    email,
    displayName: email.split('@')[0] ?? email,
    passwordHash: 'test',
    status: 'active',
    createdAt: new Date(),
    failedLoginCount: 0,
  };
}

describe('WorkspaceService', () => {
  it('creates an isolated workspace with an owner membership', async () => {
    const { service } = setup();
    const owner = user('11111111-1111-4111-8111-111111111111', 'owner@example.com');
    const workspace = await service.create({ name: 'رسانه هادی', slug: 'hadi-media' }, owner);
    expect(service.summary(workspace.id, owner.id)).toMatchObject({
      role: 'owner',
      member_count: 1,
    });
    expect(() => service.summary(workspace.id, 'outsider')).toThrow('membership_required');
  });

  it('enforces permissions and accepts a single-use invitation', async () => {
    const { service } = setup();
    const owner = user('11111111-1111-4111-8111-111111111111', 'owner@example.com');
    const analyst = user('22222222-2222-4222-8222-222222222222', 'analyst@example.com');
    const workspace = await service.create({ name: 'رسانه هادی', slug: 'hadi-media' }, owner);
    const invite = await service.invite(workspace.id, owner.id, {
      email: analyst.email,
      role: 'analyst',
    });
    await expect(service.acceptInvitation(invite.delivery_token!, analyst)).resolves.toMatchObject({
      status: 'accepted',
    });
    expect(service.summary(workspace.id, analyst.id).role).toBe('analyst');
    expect(() => service.authorize(workspace.id, analyst.id, 'member.manage')).toThrow(
      'permission_denied',
    );
    await expect(service.acceptInvitation(invite.delivery_token!, analyst)).rejects.toThrow(
      'invitation_invalid',
    );
  });

  it('issues a service secret once and blocks cross-tenant access', async () => {
    const { service } = setup();
    const first = user('11111111-1111-4111-8111-111111111111', 'first@example.com');
    const second = user('22222222-2222-4222-8222-222222222222', 'second@example.com');
    const a = await service.create({ name: 'الف', slug: 'workspace-a' }, first);
    const b = await service.create({ name: 'ب', slug: 'workspace-b' }, second);
    const account = await service.createServiceAccount(a.id, first.id, {
      name: 'Worker استخراج',
      scopes: ['source.read'],
      expires_in_days: 30,
    });
    expect(account.secret.startsWith('mhsa_')).toBe(true);
    expect(service.listServiceAccounts(a.id, first.id)[0]).not.toHaveProperty('secret');
    expect(() => service.listServiceAccounts(b.id, first.id)).toThrow('membership_required');
  });
});
