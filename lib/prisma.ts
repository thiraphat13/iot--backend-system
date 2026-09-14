import { db } from '@/src/prisma/db';

const globalForPrisma = globalThis as unknown as {
  prisma: typeof db | undefined;
};

// ใช้ db โดยตรง ไม่ต้องสั่ง new db()
export const prisma = globalForPrisma.prisma ?? db;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
