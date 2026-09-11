import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const FALLBACK_DB_URL = 'postgresql://postgres:jhulki%400919@db.oejbnxhrxfrwppozaphg.supabase.co:5432/postgres?sslmode=require&connect_timeout=30';

function getSanitizedDbUrl(): string {
  let raw = process.env.DATABASE_URL;
  if (!raw || typeof raw !== 'string') return FALLBACK_DB_URL;
  let url = raw.trim();
  if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
    url = url.slice(1, -1).trim();
  }
  // Check if string is a valid postgres connection string format without invalid domain chars
  if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
    return FALLBACK_DB_URL;
  }
  if (url.includes('@') && !url.includes('.supabase.co') && !url.includes('.pooler.supabase.com')) {
    return FALLBACK_DB_URL;
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



