import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, generateToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await authenticateUser(email, password);
    const token = generateToken(user.id);

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { 
          message: 'Your account has been deactivated or requires password reset. Please check your email for reset instructions.',
          requiresPasswordReset: true,
          email: user.email
        },
        { status: 403 }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Signin error:', error);
    
    // Check if error is about inactive user
    if (error instanceof Error && error.message.includes('account not active')) {
      return NextResponse.json(
        { 
          message: error.message,
          requiresPasswordReset: true
        },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Sign in failed' },
      { status: 401 }
    );
  }
}
