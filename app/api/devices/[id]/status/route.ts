import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const cacheKey = `device:${id}:latest_status`;

    // 1. ตรวจสอบข้อมูลใน Redis (Cache Hit)
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return NextResponse.json({
        source: 'cache',
        data: JSON.parse(cachedData),
      });
    }

    // 2. ถ้าไม่พบใน Redis (Cache Miss) -> ดึงข้อมูลล่าสุดจาก PostgreSQL (Prisma 8 Syntax)
    const latestData = await prisma.orm.public.Telemetry.where({
      device_id: id,
    })
      .orderBy((t) => t.timestamp.desc())
      .first();

    if (!latestData) {
      return NextResponse.json(
        { success: false, message: 'Device status not found' },
        { status: 404 },
      );
    }

    // 3. บันทึกข้อมูลลง Redis
    await redis.set(cacheKey, JSON.stringify(latestData));

    return NextResponse.json({
      source: 'database',
      data: latestData,
    });
  } catch (error) {
    console.error('❌ Get Device Status Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
