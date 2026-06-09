import { NextRequest, NextResponse } from 'next/server';
import { acceptInvitation as acceptInvitationAuth, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { token, password, name } = await request.json();

    if (!token || !password || !name) {
      return NextResponse.json(
        { message: 'Token, password, and name are required' },
        { status: 400 }
      );
    }

    const user = await acceptInvitationAuth(token, password, name);
    const authToken = generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      token: authToken,
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}
