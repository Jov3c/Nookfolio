import { describe, expect, it } from 'vitest';

import { queryCurrentDatabase } from '../helpers/database';

describe('database baseline', () => {
  it('reports a clear error when DATABASE_URL is missing', async () => {
    await expect(queryCurrentDatabase('')).rejects.toThrow('DATABASE_URL is required');
  });

  it('surfaces a connection error when PostgreSQL is unavailable', async () => {
    const unavailableUrl = 'postgresql://nookfolio:nookfolio_dev_only@127.0.0.1:1/nookfolio';

    await expect(queryCurrentDatabase(unavailableUrl)).rejects.toThrow();
  });

  it('connects to the configured PostgreSQL database and returns nookfolio', async () => {
    const databaseUrl = process.env.DATABASE_URL ?? '';

    await expect(queryCurrentDatabase(databaseUrl)).resolves.toBe('nookfolio');
  });
});
