import { Injectable } from '@nestjs/common';

export interface HealthReport {
  status: 'ok';
  service: 'api';
  version: string;
  basePath: '/mohtavayab';
}

@Injectable()
export class HealthService {
  read(): HealthReport {
    return {
      status: 'ok',
      service: 'api',
      version: process.env.APP_VERSION ?? 'dev',
      basePath: '/mohtavayab',
    };
  }
}
