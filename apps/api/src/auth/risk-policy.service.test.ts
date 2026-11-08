import { describe, expect, it } from 'vitest';
import { AuthConfig } from './auth.config.js';
import { CryptoService } from './crypto.service.js';
import { RiskPolicyService } from './risk-policy.service.js';

describe('RiskPolicyService', () => {
  const crypto = new CryptoService(new AuthConfig());
  const policy = new RiskPolicyService(crypto);

  it('stores only stable privacy-preserving network-prefix hashes', () => {
    expect(policy.ipPrefixHash('203.0.113.10')).toBe(policy.ipPrefixHash('203.0.113.220'));
    expect(policy.ipPrefixHash('203.0.113.10')).not.toBe(policy.ipPrefixHash('203.0.114.10'));
  });

  it('rate limits the ninth login attempt in a fifteen-minute window', () => {
    const decisions = Array.from({ length: 9 }, () =>
      policy.assertLoginAllowed('limited@example.com', '198.51.100.4', 1_000),
    );
    expect(decisions.slice(0, 8).every(Boolean)).toBe(true);
    expect(decisions[8]).toBe(false);
  });
});
