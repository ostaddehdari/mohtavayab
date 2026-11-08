export type Assurance = 'password' | 'mfa' | 'oidc';

export type UserRecord = {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  status: 'active' | 'locked';
  createdAt: Date;
  failedLoginCount: number;
  lockedUntil?: Date;
  mfa?: { encryptedSecret: string; recoveryCodeHashes: string[]; enabledAt: Date };
  pendingMfa?: { encryptedSecret: string; expiresAt: Date };
};

export type SessionRecord = {
  id: string;
  familyId: string;
  userId: string;
  refreshHash: string;
  previousRefreshHashes: string[];
  deviceIdHash: string;
  deviceLabel: string;
  ipPrefixHash: string;
  userAgentHash: string;
  assurance: Assurance;
  createdAt: Date;
  lastSeenAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
  revokeReason?: string;
};

export type MfaChallengeRecord = {
  id: string;
  userId: string;
  deviceId: string;
  ip: string;
  userAgent: string;
  rememberDevice: boolean;
  expiresAt: Date;
  attempts: number;
  consumedAt?: Date;
};

export type ResetRecord = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  consumedAt?: Date;
};

export type RequestSignals = {
  ip: string;
  userAgent: string;
  deviceId: string;
};

export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: Date;
  refreshExpiresAt: Date;
  sessionId: string;
};

export type LoginResult =
  | { status: 'authenticated'; tokens: SessionTokens }
  | { status: 'mfa_required'; challengeId: string; expiresAt: Date };

export type OidcTransaction = {
  state: string;
  nonce: string;
  codeVerifier: string;
  provider: string;
  returnTo: string;
  expiresAt: Date;
};
