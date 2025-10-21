import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('PUT /api/admin/users/[id] - Starting request');
    
    const user = await requireAuth(['admin'])(request);
    
    if (!user) {
      console.log('PUT /api/admin/users/[id] - Unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    console.log('PUT /api/admin/users/[id] - User authenticated:', user.email);

    const { isActive, role } = await request.json();

    await connectDB();

    const updateData: { isActive?: boolean; role?: string } = {};
    
    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }
    
    if (role && ['admin', 'manager', 'viewer'].includes(role)) {
      updateData.role = role;
    }

    const { id } = await params;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser._id.toString(),
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        lastLogin: updatedUser.lastLogin
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('DELETE /api/admin/users/[id] - Starting request');
    
    const user = await requireAuth(['admin'])(request);
    
    if (!user) {
      console.log('DELETE /api/admin/users/[id] - Unauthorized');
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    console.log('DELETE /api/admin/users/[id] - User authenticated:', user.email);

    await connectDB();

    const { id } = await params;
    console.log('DELETE /api/admin/users/[id] - Deleting user with ID:', id);
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
