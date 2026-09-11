import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Supabase direct connection with explicit timeouts and sslmode
const FALLBACK_DB_URL = 'postgresql://postgres:jhulki%400919@db.oejbnxhrxfrwppozaphg.supabase.co:5432/postgres?sslmode=require&connect_timeout=30';

function getSanitizedDbUrl(): string {
  let url = process.env.DATABASE_URL;
  if (!url || !url.trim()) return FALLBACK_DB_URL;
  url = url.trim();
  if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
    url = url.slice(1, -1).trim();
  }
  return url;
}

const dbUrl = getSanitizedDbUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;


