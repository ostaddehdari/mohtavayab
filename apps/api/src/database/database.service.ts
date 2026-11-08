import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { Pool, type PoolClient, type QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  readonly enabled =
    process.env.AUTH_STORE_DRIVER === 'postgres' || process.env.NODE_ENV === 'production';
  private pool?: Pool;

  async onModuleInit(): Promise<void> {
    if (!this.enabled) return;
    this.pool = new Pool({
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT ?? 5432),
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      max: Number(process.env.POSTGRES_POOL_MAX ?? 20),
      ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
    });
    await this.pool.query('SELECT 1');
  }

  async query<T extends QueryResultRow>(
    text: string,
    values: readonly unknown[] = [],
  ): Promise<T[]> {
    if (!this.pool) return [];
    return (await this.pool.query<T>(text, [...values])).rows;
  }

  async inWorkspace<T>(
    workspaceId: string,
    action: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    if (!this.pool) throw new Error('postgres_required');
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query("SELECT set_config('app.workspace_id', $1, true)", [workspaceId]);
      const result = await action(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool?.end();
  }
}
