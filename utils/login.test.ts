import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/login/route';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    orm: {
      public: {
        User: {
          where: jest.fn(),
        },
      },
    },
  },
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

describe('Login Authentication Mocking', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    process.env.JWT_SECRET = 'test-secret';
  });

  // Success Case
  it('should create JWT Token successfully when user is valid', async () => {
    const mockUser = {
      id: 'user_123',
      username: 'admin',
      password_hash: 'hashed_password',
      role: 'admin',
    };

    const firstMock = jest.fn().mockResolvedValue(mockUser);

    (prisma.orm.public.User.where as jest.Mock).mockReturnValue({
      first: firstMock,
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'password',
      }),
    });

    const response = await POST(req);

    expect(prisma.orm.public.User.where).toHaveBeenCalledTimes(1);

    expect(prisma.orm.public.User.where).toHaveBeenCalledWith({
      username: 'admin',
    });

    expect(firstMock).toHaveBeenCalledTimes(1);

    expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashed_password');

    expect(jwt.sign).toHaveBeenCalledTimes(1);

    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body.success).toBe(true);
    expect(body.token).toBe('mock-jwt-token');
  });

  // User Not Found
  it('should throw Invalid Credentials error when user not found', async () => {
    const firstMock = jest.fn().mockResolvedValue(null);

    (prisma.orm.public.User.where as jest.Mock).mockReturnValue({
      first: firstMock,
    });

    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'wrong_user',
        password: 'wrong_password',
      }),
    });

    const response = await POST(req);

    expect(prisma.orm.public.User.where).toHaveBeenCalledTimes(1);

    expect(prisma.orm.public.User.where).toHaveBeenCalledWith({
      username: 'wrong_user',
    });

    expect(firstMock).toHaveBeenCalledTimes(1);

    expect(response.status).toBe(401);

    const body = await response.json();

    expect(body.success).toBe(false);
    expect(body.message).toBe('User not found');
  });

  // Invalid Password
  it('should return 401 when password is incorrect', async () => {
    const mockUser = {
      id: 'user_123',
      username: 'admin',
      password_hash: 'hashed_password',
      role: 'admin',
    };

    const firstMock = jest.fn().mockResolvedValue(mockUser);

    (prisma.orm.public.User.where as jest.Mock).mockReturnValue({
      first: firstMock,
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin',
        password: 'wrong_password',
      }),
    });

    const response = await POST(req);

    expect(response.status).toBe(401);

    const body = await response.json();

    expect(body.success).toBe(false);
    expect(body.message).toBe('Invalid password');

    expect(bcrypt.compare).toHaveBeenCalledWith(
      'wrong_password',
      'hashed_password',
    );

    expect(jwt.sign).not.toHaveBeenCalled();
  });

  // Missing Username / Password
  it('should return 400 when username or password is missing', async () => {
    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: '',
        password: '',
      }),
    });

    const response = await POST(req);

    expect(response.status).toBe(400);

    const body = await response.json();

    expect(body.success).toBe(false);
    expect(body.message).toBe('Username and password are required');

    expect(prisma.orm.public.User.where).not.toHaveBeenCalled();
  });
});
