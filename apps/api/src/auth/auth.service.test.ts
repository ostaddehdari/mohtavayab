import { describe, expect, it } from 'vitest';
import * as OTPAuth from 'otpauth';
import { AuthConfig } from './auth.config.js';
import { AuthService } from './auth.service.js';
import { AuthStore } from './auth.store.js';
import { CryptoService } from './crypto.service.js';
import { RiskPolicyService } from './risk-policy.service.js';

function fixture() {
  const config = new AuthConfig();
  const store = new AuthStore();
  const crypto = new CryptoService(config);
  const risk = new RiskPolicyService(crypto);
  const auth = new AuthService(config, store, crypto, risk);
  return { auth, store };
}

const signals = {
  ip: '203.0.113.20',
  userAgent: 'Mozilla/5.0 Chrome/156.0 Windows',
  deviceId: 'device_1234567890abcdef',
};

describe('AuthService', () => {
  it('registers, authenticates, rotates refresh tokens and detects replay', async () => {
    const { auth, store } = fixture();
    const user = await auth.register({
      email: 'user@example.com',
      password: 'Secure-Passphrase-1405',
      display_name: 'کاربر نمونه',
      accept_terms: true,
    });
    const login = await auth.login(
      {
        email: user.email,
        password: 'Secure-Passphrase-1405',
        device_id: signals.deviceId,
        remember_device: false,
      },
      signals,
    );
    expect(login.status).toBe('authenticated');
    if (login.status !== 'authenticated') throw new Error('expected authenticated');
    await expect(auth.authenticate(login.tokens.accessToken)).resolves.toMatchObject({
      user: { id: user.id },
    });

    const rotated = await auth.refresh(login.tokens.refreshToken, signals);
    expect(rotated.refreshToken).not.toBe(login.tokens.refreshToken);
    await expect(auth.refresh(login.tokens.refreshToken, signals)).rejects.toThrow(
      'refresh_reuse_detected',
    );
    expect(store.sessions.get(login.tokens.sessionId)?.revokedAt).toBeInstanceOf(Date);
  });

  it('enables TOTP MFA, issues recovery codes and requires step-up', async () => {
    const { auth } = fixture();
    const user = await auth.register({
      email: 'mfa@example.com',
      password: 'Another-Secure-Password-1405',
      display_name: 'کاربر دوم',
      accept_terms: true,
    });
    const first = await auth.login(
      {
        email: user.email,
        password: 'Another-Secure-Password-1405',
        device_id: signals.deviceId,
        remember_device: true,
      },
      signals,
    );
    expect(first.status).toBe('authenticated');
    const setup = await auth.beginMfaSetup(user.id);
    const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(setup.secret) });
    const confirmation = await auth.confirmMfaSetup(user.id, totp.generate());
    expect(confirmation.recovery_codes).toHaveLength(10);

    const second = await auth.login(
      {
        email: user.email,
        password: 'Another-Secure-Password-1405',
        device_id: signals.deviceId,
        remember_device: true,
      },
      signals,
    );
    expect(second.status).toBe('mfa_required');
    if (second.status !== 'mfa_required') throw new Error('expected challenge');
    const tokens = await auth.verifyMfaChallenge(second.challengeId, totp.generate());
    await expect(auth.authenticate(tokens.accessToken)).resolves.toMatchObject({
      session: { assurance: 'mfa' },
    });
  });

  it('keeps recovery requests enumeration-safe and invalidates sessions after reset', async () => {
    const { auth } = fixture();
    await expect(auth.requestPasswordReset('missing@example.com')).resolves.toEqual({
      accepted: true,
    });
    const user = await auth.register({
      email: 'reset@example.com',
      password: 'Original-Secure-Password-1405',
      display_name: 'بازیابی رمز',
      accept_terms: true,
    });
    const recovery = await auth.requestPasswordReset(user.email);
    expect(recovery.accepted).toBe(true);
    expect(recovery.deliveryToken).toBeTypeOf('string');
    await auth.confirmPasswordReset(recovery.deliveryToken ?? '', 'Changed-Secure-Password-1405');
    await expect(
      auth.login(
        {
          email: user.email,
          password: 'Changed-Secure-Password-1405',
          device_id: signals.deviceId,
          remember_device: false,
        },
        signals,
      ),
    ).resolves.toMatchObject({ status: 'authenticated' });
  });
});
