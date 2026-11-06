import { randomUUID } from 'node:crypto';
import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const requestId = request.header('x-request-id')?.slice(0, 128) || randomUUID();
    const startedAt = performance.now();
    response.setHeader('x-request-id', requestId);

    response.on('finish', () => {
      const event = {
        event: 'http.request.completed',
        request_id: requestId,
        method: request.method,
        path: request.path,
        status_code: response.statusCode,
        duration_ms: Math.round(performance.now() - startedAt),
      };
      process.stdout.write(`${JSON.stringify(event)}\n`);
    });
    next();
  }
}
