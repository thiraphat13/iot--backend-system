import { Temporal } from '@js-temporal/polyfill';
import postgres from '@prisma/orm-postgres/runtime';
import contractJson from './schema.json' with { type: 'json' };

// กำหนด Polyfill ให้ Global Runtime สำหรับ Prisma 8
if (!globalThis.Temporal) {
  (globalThis as unknown as { Temporal: typeof Temporal }).Temporal = Temporal;
}

export const db = postgres({
  contractJson,
  url: process.env.DATABASE_URL!,
});
