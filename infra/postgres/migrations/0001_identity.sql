BEGIN;

CREATE SCHEMA IF NOT EXISTS identity;

CREATE TABLE identity.users (
  id uuid PRIMARY KEY,
  email_normalized text NOT NULL UNIQUE,
  display_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'locked', 'disabled')),
  failed_login_count integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE identity.password_credentials (
  user_id uuid PRIMARY KEY REFERENCES identity.users(id) ON DELETE CASCADE,
  password_hash text NOT NULL,
  algorithm text NOT NULL DEFAULT 'argon2id',
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE identity.oidc_identities (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  issuer text NOT NULL,
  subject text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (issuer, subject)
);

CREATE TABLE identity.mfa_methods (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('totp')),
  encrypted_secret text NOT NULL,
  enabled_at timestamptz NOT NULL,
  disabled_at timestamptz
);

CREATE TABLE identity.mfa_recovery_codes (
  id uuid PRIMARY KEY,
  mfa_method_id uuid NOT NULL REFERENCES identity.mfa_methods(id) ON DELETE CASCADE,
  code_hash text NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE identity.sessions (
  id uuid PRIMARY KEY,
  family_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  refresh_token_hash text NOT NULL UNIQUE,
  previous_refresh_hashes text[] NOT NULL DEFAULT '{}',
  assurance text NOT NULL CHECK (assurance IN ('password', 'mfa', 'oidc')),
  device_id_hash text NOT NULL,
  device_label text NOT NULL,
  ip_prefix_hash text NOT NULL,
  user_agent_hash text NOT NULL,
  created_at timestamptz NOT NULL,
  last_seen_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  revoke_reason text
);

CREATE INDEX sessions_user_active_idx ON identity.sessions (user_id, expires_at)
  WHERE revoked_at IS NULL;
CREATE INDEX sessions_family_idx ON identity.sessions (family_id);

CREATE TABLE identity.password_reset_tokens (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE identity.security_events (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES identity.users(id) ON DELETE SET NULL,
  event_name text NOT NULL,
  outcome text NOT NULL,
  ip_prefix_hash text,
  device_id_hash text,
  correlation_id text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX security_events_user_time_idx ON identity.security_events (user_id, created_at DESC);

COMMENT ON SCHEMA identity IS 'Authentication data; raw sessions, refresh tokens, OTP values and IP addresses are forbidden.';

COMMIT;
