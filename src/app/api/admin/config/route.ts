import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AdminConfig from '@/models/AdminConfig';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const configType = searchParams.get('type');
    
    const query = configType ? { configType, isActive: true } : { isActive: true };
    const configs = await AdminConfig.find(query).sort({ priority: -1 });
    
    return NextResponse.json({ success: true, data: configs });
  } catch (error) {
    console.error('Error fetching admin configs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin configs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { configType, name, description, content, priority, tags } = body;
    
    if (!configType || !name || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const config = new AdminConfig({
      configType,
      name,
      description,
      content,
      priority: priority || 0,
      tags: tags || [],
      isActive: true
    });
    
    await config.save();
    
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error('Error creating admin config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create admin config' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing config ID' },
        { status: 400 }
      );
    }
    
    const config = await AdminConfig.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );
    
    if (!config) {
      return NextResponse.json(
        { success: false, error: 'Config not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    console.error('Error updating admin config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update admin config' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing config ID' },
        { status: 400 }
      );
    }
    
    const config = await AdminConfig.findByIdAndDelete(id);
    
    if (!config) {
      return NextResponse.json(
        { success: false, error: 'Config not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Config deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete admin config' },
      { status: 500 }
    );
  }
}
