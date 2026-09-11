import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getSanitizedDbUrl(): string {
  let url = process.env.DATABASE_URL || 'postgresql://postgres:jhulki%400919@db.oejbnxhrxfrwppozaphg.supabase.co:5432/postgres?sslmode=require';
  url = url.trim();
  if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
    url = url.slice(1, -1).trim();
  }
  if (!url.includes('supabase.co')) {
    url = 'postgresql://postgres:jhulki%400919@db.oejbnxhrxfrwppozaphg.supabase.co:5432/postgres?sslmode=require';
  }
  return url;
}

const dbUrl = getSanitizedDbUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
