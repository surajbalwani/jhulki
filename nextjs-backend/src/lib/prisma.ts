import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Correct Supabase Pooler URL for project `oejbnxhrxfrwppozaphg`
const VERIFIED_POOLER_URL = 'postgresql://postgres.oejbnxhrxfrwppozaphg:jhulki%400919@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require&connect_timeout=30';

// Force override process.env.DATABASE_URL to bypass Vercel UI dashboard variable corruption
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







