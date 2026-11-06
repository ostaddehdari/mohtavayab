import { describe, expect, it } from 'vitest';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';

describe('HealthController', () => {
  it('returns a stable, secret-free health contract', () => {
    const controller = new HealthController(new HealthService());
    expect(controller.read()).toEqual({
      status: 'ok',
      service: 'api',
      version: 'dev',
      basePath: '/mohtavayab',
    });
  });
});
