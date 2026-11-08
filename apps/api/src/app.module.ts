import { Module, type MiddlewareConsumer, type NestModule } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';
import { RequestContextMiddleware } from './request-context.middleware.js';
import { AuthModule } from './auth/auth.module.js';
import { DatabaseModule } from './database/database.module.js';
import { WorkspaceModule } from './workspace/workspace.module.js';

@Module({
  imports: [DatabaseModule, AuthModule, WorkspaceModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes('{*path}');
  }
}
