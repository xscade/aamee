import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/admin/users - Starting request');
    
    const user = await requireAuth(['admin', 'manager'])(request);
    
    if (!user) {
      console.log('GET /api/admin/users - Unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('GET /api/admin/users - User authenticated:', user.email);

    await connectDB();

    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    console.log('GET /api/admin/users - Found users:', users.length);

    return NextResponse.json({ users });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/admin/users - Starting request');
    
    const user = await requireAuth(['admin'])(request);
    
    if (!user) {
      console.log('POST /api/admin/users - Unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    console.log('POST /api/admin/users - User authenticated:', user.email);

    const { email, password, role } = await request.json();

    console.log('POST /api/admin/users - Creating user:', { email, role });

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      );
    }

    if (!['admin', 'manager', 'viewer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, manager, or viewer' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = new User({
      email: email.toLowerCase(),
      password,
      role
    });

    console.log('POST /api/admin/users - Saving user to database');
    await newUser.save();

    console.log('POST /api/admin/users - User created successfully:', newUser._id);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
