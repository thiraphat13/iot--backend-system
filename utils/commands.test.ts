/* eslint-disable @typescript-eslint/no-explicit-any */
import { POST } from '@/app/api/devices/[id]/commands/route';
import { NextRequest } from 'next/server';

describe('API Integration Testing: Device Commands', () => {
  // เคส 1 (No Token)
  it('should return 401 Unauthorized when no token is provided', async () => {
    const req = new NextRequest(
      'http://localhost/api/devices/pico_01/commands',
      {
        method: 'POST',
      },
    );

    const response = await POST(req, {
      params: Promise.resolve({ id: 'pico_01' }),
    } as any);
    expect(response.status).toBe(401);
  });

  // เคส 2 (Invalid Token)
  it('should return 401 or 403 when invalid token is provided', async () => {
    // Arrange
    const req = new NextRequest(
      'http://localhost/api/devices/pico_01/commands',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer this_is_a_fake_token_12345',
        },
      },
    );

    // Act
    const response = await POST(req, {
      params: Promise.resolve({ id: 'pico_01' }),
    } as any);

    // Assert
    expect([401, 403]).toContain(response.status);
  });
});
