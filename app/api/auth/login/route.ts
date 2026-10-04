import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Username and password are required',
        },
        { status: 400 },
      );
    }

    // ค้นหา User ด้วย username
    const user = await prisma.orm.public.User.where({ username }).first();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 401 },
      );
    }

    // ตรวจสอบรหัสผ่าน
    const isPasswordMatch = await bcrypt.compare(
      password,
      String(user.password_hash),
    );

    if (!isPasswordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid password',
        },
        { status: 401 },
      );
    }

    // สร้าง JWT
    const secret = process.env.JWT_SECRET || 'secret';

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      secret,
      {
        expiresIn: '1h',
      },
    );

    return NextResponse.json({
      success: true,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Login failed',
      },
      { status: 500 },
    );
  }
}
