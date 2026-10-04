import { Redis } from 'ioredis';

// ดึงค่าเชื่อมต่อจาก .env หรือใช้ค่า default เป็น localhost:6666
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6666';

// สร้าง global instance เพื่อป้องกันไม่ให้ Next.js สร้าง Connection ใหม่ซ้ำๆ ตอน Hot Reload (เฉพาะตอนรัน dev)
const globalForRedis = global as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ||
  new Redis(redisUrl, {
    maxRetriesPerRequest: null,
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;
