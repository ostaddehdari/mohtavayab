import { Controller, Get } from '@nestjs/common';
import { HealthService, type HealthReport } from './health.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  read(): HealthReport {
    return this.health.read();
  }
}
