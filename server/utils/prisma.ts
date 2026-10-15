import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client';

const globalPrisma = globalThis as typeof globalThis & { nookfolioPrisma?: PrismaClient };

export function createPrismaClient(connectionString: string) {
  if (!connectionString.trim()) throw new Error('DATABASE_URL is required');
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

export function usePrisma() {
  const connectionString = process.env.DATABASE_URL ?? '';
  if (!globalPrisma.nookfolioPrisma)
    globalPrisma.nookfolioPrisma = createPrismaClient(connectionString);
  return globalPrisma.nookfolioPrisma;
}
