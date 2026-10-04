import { NextRequest } from 'next/server'; // ✅ ลบ NextResponse ออก
import jwt from 'jsonwebtoken';

export function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 };
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret =
      process.env.JWT_SECRET || 'my_super_secret_key_for_pi_pico_dashboard';
    const decoded = jwt.verify(token, secret) as {
      userId: string;
      role: string;
    };

    return { user: decoded };
  } catch {
    // ✅ ลบ (error) ออก
    return { error: 'Invalid or expired token', status: 401 };
  }
}
