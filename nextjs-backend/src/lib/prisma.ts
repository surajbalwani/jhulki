import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Supabase IPv4 Pooler host (aws-0-ap-south-1.pooler.supabase.com) on Port 5432 (Session mode)
// Standard username `postgres` without tenant prefix
const DB_URL = 'postgresql://postgres:jhulki%400919@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require&connect_timeout=30';

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






