import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, createInvitation } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get the inviting user
    const invitingUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!invitingUser || (invitingUser.role !== 'ADMIN' && invitingUser.role !== 'SUPERVISOR')) {
      return NextResponse.json(
        { message: 'Only Admin and Supervisor can invite users' },
        { status: 403 }
      );
    }

    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json(
        { message: 'Email and role are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const invitation = await createInvitation(email, role, invitingUser.id);

    return NextResponse.json({
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error('Invite error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to send invitation' },
      { status: 500 }
    );
  }
}
