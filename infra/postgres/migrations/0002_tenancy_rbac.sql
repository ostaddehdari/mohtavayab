BEGIN;

CREATE SCHEMA IF NOT EXISTS tenancy;

CREATE TABLE tenancy.workspaces (
  id uuid PRIMARY KEY,
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9][a-z0-9-]{2,47}$'),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 80),
  owner_user_id uuid NOT NULL REFERENCES identity.users(id),
  status text NOT NULL CHECK (status IN ('active', 'suspended', 'deleting')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tenancy.memberships (
  workspace_id uuid NOT NULL REFERENCES tenancy.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  role_key text NOT NULL CHECK (role_key IN ('owner', 'admin', 'analyst', 'editor', 'publisher', 'viewer')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

CREATE INDEX memberships_user_idx ON tenancy.memberships (user_id, status);

CREATE TABLE tenancy.permissions (
  permission_key text PRIMARY KEY,
  description text NOT NULL
);

CREATE TABLE tenancy.role_permissions (
  role_key text NOT NULL,
  permission_key text NOT NULL REFERENCES tenancy.permissions(permission_key) ON DELETE CASCADE,
  PRIMARY KEY (role_key, permission_key)
);

CREATE TABLE tenancy.invitations (
  id uuid PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES tenancy.workspaces(id) ON DELETE CASCADE,
  email_normalized text NOT NULL,
  role_key text NOT NULL CHECK (role_key IN ('admin', 'analyst', 'editor', 'publisher', 'viewer')),
  token_hash text NOT NULL UNIQUE,
  invited_by uuid NOT NULL REFERENCES identity.users(id),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  revoked_at timestamptz
);

CREATE UNIQUE INDEX invitations_pending_email_idx
  ON tenancy.invitations (workspace_id, email_normalized)
  WHERE accepted_at IS NULL AND revoked_at IS NULL;

CREATE TABLE tenancy.service_accounts (
  id uuid PRIMARY KEY,
  workspace_id uuid NOT NULL REFERENCES tenancy.workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  secret_hash text NOT NULL UNIQUE,
  scopes text[] NOT NULL,
  created_by uuid NOT NULL REFERENCES identity.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  last_used_at timestamptz
);

CREATE TABLE tenancy.user_preferences (
  user_id uuid PRIMARY KEY REFERENCES identity.users(id) ON DELETE CASCADE,
  active_workspace_id uuid REFERENCES tenancy.workspaces(id) ON DELETE SET NULL,
  sidebar_mode text NOT NULL DEFAULT 'expanded' CHECK (sidebar_mode IN ('expanded', 'compact')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO tenancy.permissions (permission_key, description) VALUES
  ('workspace.read', 'مشاهده فضای کاری'), ('workspace.update', 'ویرایش فضای کاری'),
  ('member.read', 'مشاهده اعضا'), ('member.invite', 'دعوت عضو'), ('member.manage', 'مدیریت عضو'),
  ('role.read', 'مشاهده نقش‌ها'), ('role.manage', 'مدیریت نقش‌ها'),
  ('service_account.read', 'مشاهده حساب خدمت'), ('service_account.manage', 'مدیریت حساب خدمت'),
  ('source.read', 'مشاهده منبع'), ('source.manage', 'مدیریت منبع'),
  ('content.read', 'مشاهده محتوا'), ('content.edit', 'ویرایش محتوا'), ('content.publish', 'انتشار محتوا'),
  ('analytics.read', 'مشاهده تحلیل'), ('audit.read', 'مشاهده ممیزی')
ON CONFLICT DO NOTHING;

ALTER TABLE tenancy.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenancy.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenancy.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenancy.service_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY workspaces_tenant_isolation ON tenancy.workspaces
  USING (id = nullif(current_setting('app.workspace_id', true), '')::uuid)
  WITH CHECK (id = nullif(current_setting('app.workspace_id', true), '')::uuid);
CREATE POLICY memberships_tenant_isolation ON tenancy.memberships
  USING (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid)
  WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid);
CREATE POLICY invitations_tenant_isolation ON tenancy.invitations
  USING (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid)
  WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid);
CREATE POLICY service_accounts_tenant_isolation ON tenancy.service_accounts
  USING (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid)
  WITH CHECK (workspace_id = nullif(current_setting('app.workspace_id', true), '')::uuid);

COMMENT ON SCHEMA tenancy IS 'Workspace boundary; application role must set app.workspace_id inside every transaction.';
COMMENT ON COLUMN tenancy.service_accounts.secret_hash IS 'Only a keyed hash is stored. Plain secrets are returned once.';

COMMIT;
