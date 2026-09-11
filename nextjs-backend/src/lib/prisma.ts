import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Supabase Direct (Port 5432) & Connection Pooler (Port 6543)
// For Serverless environments like Vercel, pgBouncer / transaction mode is recommended.
const DIRECT_URL = 'postgresql://postgres:jhulki%400919@db.oejbnxhrxfrwppozaphg.supabase.co:5432/postgres?sslmode=require&connect_timeout=15';
const POOLER_URL = 'postgresql://postgres.oejbnxhrxfrwppozaphg:jhulki%400919@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&connect_timeout=15';

function getSanitizedDbUrl(): string {
  let url = process.env.DATABASE_URL;
  if (!url) return POOLER_URL;
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

