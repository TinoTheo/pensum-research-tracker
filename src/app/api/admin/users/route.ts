import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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

    // Get requesting user
    const requestingUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!requestingUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { reports: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

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

    // Get requesting user
    const requestingUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!requestingUser || requestingUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Only Admin can create users directly' },
        { status: 403 }
      );
    }

    const { name, email, role, department, defaultPassword } = await request.json();

    if (!name || !email || !role) {
      return NextResponse.json(
        { message: 'Name, email, and role are required' },
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

    // Use default password if provided, otherwise generate one
    const password = defaultPassword || 'researcher123';
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        department: department || null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      user,
      message: defaultPassword ? `User created with default password: ${password}` : 'User created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    // Get requesting user
    const requestingUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!requestingUser || requestingUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Only Admin can reset passwords' },
        { status: 403 }
      );
    }

    const { userId, newPassword } = await request.json();

    if (!userId || !newPassword) {
      return NextResponse.json(
        { message: 'User ID and new password are required' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password and force password reset on next login
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        isActive: false, // Force password reset on next login
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      user: updatedUser,
      message: 'Password reset successfully. User will need to set new password on next login.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to reset password' },
      { status: 500 }
    );
  }
}
