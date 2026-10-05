import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { username, password, role } = await request.json();

    // 1. เข้ารหัส password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 2. บันทึกลง Database
    const newUser = await prisma.orm.public.User.create({
      username,
      password_hash,
      role: role || 'viewer',
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: newUser.id,
          username: newUser.username,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('❌ Register Error:', error); // เพิ่มบรรทัดนี้เพื่อดูสาเหตุ
    return NextResponse.json(
      { success: false, message: 'Registration failed' },
      { status: 500 },
    );
  }
}
