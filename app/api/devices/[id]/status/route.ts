import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  // --- Auth Middleware ---
  const auth = verifyAuth(request);
  if (auth.error) {
    return NextResponse.json({ message: auth.error }, { status: auth.status }); // คืนค่า 401
  }
  // -----------------------

  // Business Logic หลักของคุณ (เช่น ดึงข้อมูลล่าสุดจาก Redis)
  return NextResponse.json({
    success: true,
    message: `Viewing status for device ${params.id}`,
    user: auth.user, // ข้อมูลคนที่ล็อกอิน
  });
}
