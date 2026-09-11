import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Supabase IPv4 Pooler host (aws-0-ap-south-1.pooler.supabase.com)
// Supabase direct host (db.oejbnxhrxfrwppozaphg.supabase.co) only has IPv6 records which Vercel AWS Lambda cannot resolve without Supabase IPv4 Pooler.
const DB_URL = 'postgresql://postgres.oejbnxhrxfrwppozaphg:jhulki%400919@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true';

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: DB_URL,
      },
    },
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;





