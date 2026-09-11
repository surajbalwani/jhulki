import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Supabase Connection Pooler (Port 6543 Transaction mode with pgbouncer=true)
// Region confirmed from Supabase dashboard: ap-northeast-2 (not ap-south-1)
const VERIFIED_POOLER_URL = 'postgresql://postgres.oejbnxhrxfrwppozaphg:jhulki%400919@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&connect_timeout=30';

process.env.DATABASE_URL = VERIFIED_POOLER_URL;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: VERIFIED_POOLER_URL,
      },
    },
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
