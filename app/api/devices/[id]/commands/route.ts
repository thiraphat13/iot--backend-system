import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  // --- Auth Middleware ---
  const auth = verifyAuth(request);
  if (auth.error) {
    return NextResponse.json({ message: auth.error }, { status: auth.status }); // คืนค่า 401
  }

  // --- Role Middleware (AuthZ) ---
  // เช็ค role จาก Payload ถ้าไม่ใช่ admin ให้ Reject ด้วย 403 Forbidden
  if (auth.user?.role !== 'admin') {
    return NextResponse.json(
      { message: 'Forbidden: Admins only' },
      { status: 403 },
    );
  }
  // -------------------------------

  // Business Logic หลัก (เช่น สั่งงาน Pi Pico)
  return NextResponse.json({
    success: true,
    message: `Command sent to device ${params.id} successfully by admin ${auth.user.userId}`,
  });
}
