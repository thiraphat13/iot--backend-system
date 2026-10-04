import { Temporal } from '@js-temporal/polyfill';
import postgres from '@prisma/orm-postgres/runtime';
import contractJson from './schema.json' with { type: 'json' };

// กำหนด Polyfill ให้ Global Runtime สำหรับ Prisma 8
// เติม as any เพื่อให้ผ่านการตรวจสอบของ TypeScript ในโหมด Strict
if (!(globalThis as any).Temporal) {
  (globalThis as any).Temporal = Temporal;
}

export const db = postgres({
  contractJson,
  url: process.env.DATABASE_URL!,
});