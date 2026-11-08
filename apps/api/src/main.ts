import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const port = Number(process.env.API_PORT ?? 3001);
  const origins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(',');
  const express = app.getHttpAdapter().getInstance() as {
    set: (name: string, value: unknown) => void;
  };

  app.setGlobalPrefix('mohtavayab/api');
  app.use(helmet({ contentSecurityPolicy: false }));
  express.set('trust proxy', process.env.AUTH_TRUST_PROXY === 'true' ? 1 : false);
  app.enableCors({ origin: origins, credentials: true });
  app.enableShutdownHooks();
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
