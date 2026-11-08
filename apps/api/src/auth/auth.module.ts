import { Module } from '@nestjs/common';
import { AuthConfig } from './auth.config.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthStore } from './auth.store.js';
import { CryptoService } from './crypto.service.js';
import { OidcService } from './oidc.service.js';
import { RiskPolicyService } from './risk-policy.service.js';

@Module({
  controllers: [AuthController],
  providers: [AuthConfig, AuthStore, CryptoService, RiskPolicyService, OidcService, AuthService],
  exports: [AuthConfig, CryptoService, AuthService],
})
export class AuthModule {}
