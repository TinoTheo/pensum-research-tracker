import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  if (!decoded) return null;
  return decoded;
}

export async function GET(request: NextRequest) {
  try {
    const decoded = await authenticate(request);
    if (!decoded) {
      return NextResponse.json({ message: 'Authorization required' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ message: 'Failed to fetch user data' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const decoded = await authenticate(request);
    if (!decoded) {
      return NextResponse.json({ message: 'Authorization required' }, { status: 401 });
    }

    const body = await request.json();
    const updateData: Record<string, any> = {};

    if (body.name !== undefined) {
      if (!body.name.trim()) {
        return NextResponse.json({ message: 'Name cannot be empty' }, { status: 400 });
      }
      updateData.name = body.name.trim();
    }

    if (body.newPassword !== undefined) {
      if (!body.newPassword || body.newPassword.length < 6) {
        return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
      }
      updateData.password = await hashPassword(body.newPassword);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData,
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

    return NextResponse.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ message: 'Failed to update profile' }, { status: 500 });
  }
}
