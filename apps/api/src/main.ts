import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const port = Number(process.env.API_PORT ?? 3001);
  const origins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(',');

  app.setGlobalPrefix('mohtavayab/api');
  app.enableCors({ origin: origins, credentials: true });
  app.enableShutdownHooks();
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
