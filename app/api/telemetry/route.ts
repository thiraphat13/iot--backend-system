import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { Temporal } from '@js-temporal/polyfill';
import { publishAlertEmail } from '@/lib/rabbitmq';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { device_id, voltage, current, timestamp } = body;

    const timeInstant = timestamp
      ? Temporal.Instant.from(new Date(timestamp).toISOString())
      : Temporal.Now.instant();

    // 1. INSERT ลง PostgreSQL
    const newTelemetry = await prisma.orm.public.Telemetry.create({
      device_id,
      voltage: parseFloat(voltage),
      current: parseFloat(current),
      timestamp: timeInstant,
    });

    // 2. อัปเดตข้อมูลล่าสุดลง Redis (Key: device:{device_id}:latest_status)
    const cacheKey = `device:${device_id}:latest_status`;
    await redis.set(cacheKey, JSON.stringify(newTelemetry));

    // 3. ตรวจสอบเงื่อนไขแจ้งเตือนและ Publish ลง Queue
    const numVoltage = parseFloat(voltage);
    if (numVoltage > 250) {
      const alertData = {
        deviceId: device_id,
        voltage: numVoltage,
        time: timestamp || new Date().toISOString(),
      };
      await publishAlertEmail(alertData); // โยนงานให้ RabbitMQ
    }

    // 4. API ตอบกลับทันที
    return NextResponse.json(
      { success: true, data: newTelemetry },
      { status: 201 },
    );
  } catch (error) {
    console.error('❌ Telemetry API Error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to insert telemetry data',
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
