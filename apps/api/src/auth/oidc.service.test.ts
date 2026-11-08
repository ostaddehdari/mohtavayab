import { describe, expect, it } from 'vitest';
import { AuthConfig } from './auth.config.js';
import { AuthStore } from './auth.store.js';
import { CryptoService } from './crypto.service.js';
import { OidcService } from './oidc.service.js';

describe('OidcService', () => {
  const store = new AuthStore();
  const crypto = new CryptoService(new AuthConfig());
  const oidc = new OidcService(store, crypto);

  it('fails closed when a provider is disabled', async () => {
    await expect(oidc.start('google')).rejects.toThrow('oidc_provider_disabled');
    expect(store.oidcTransactions.size).toBe(0);
  });

  it('rejects invalid provider identifiers before discovery', async () => {
    await expect(oidc.start('../attacker')).rejects.toThrow('oidc_failed');
  });
});
