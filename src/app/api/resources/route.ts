import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Resource from '@/models/Resource';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const severity = searchParams.get('severity');
    const location = searchParams.get('location');

    let query: any = { isVerified: true };

    if (category) {
      query.category = category;
    }

    if (severity) {
      query.severity = severity;
    }

    if (location) {
      query.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } }
      ];
    }

    const resources = await Resource.find(query)
      .sort({ severity: -1, is24Hours: -1, createdAt: -1 })
      .limit(50);

    return NextResponse.json({ resources });

  } catch (error) {
    console.error('Resources API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const resourceData = await request.json();
    
    const resource = new Resource(resourceData);
    await resource.save();

    return NextResponse.json({ 
      message: 'Resource created successfully',
      resourceId: resource._id 
    });

  } catch (error) {
    console.error('Create Resource Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
