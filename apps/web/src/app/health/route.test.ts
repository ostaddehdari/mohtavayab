import { describe, expect, it } from 'vitest';
import { GET } from './route';

describe('web health route', () => {
  it('reports the required production base path', async () => {
    const response = GET();
    await expect(response.json()).resolves.toMatchObject({ status: 'ok', basePath: '/mohtavayab' });
  });
});
