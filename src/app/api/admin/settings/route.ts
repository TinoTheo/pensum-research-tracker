import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Simple in-memory settings storage (in production, use database)
let settings = {
  companyName: 'Pensum Research Tracker',
  maxUsers: 100,
  allowInvitations: true,
  requireApproval: false,
};

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

    if (!requestingUser || requestingUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Only Admin can view settings' },
        { status: 403 }
      );
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch settings' },
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
        { message: 'Only Admin can change settings' },
        { status: 403 }
      );
    }

    const newSettings = await request.json();
    
    // Update settings (in production, save to database)
    settings = { ...settings, ...newSettings };

    return NextResponse.json({
      message: 'Settings saved successfully',
      settings,
    });
  } catch (error) {
    console.error('Save settings error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to save settings' },
      { status: 500 }
    );
  }
}
