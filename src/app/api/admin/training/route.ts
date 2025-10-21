import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TrainingData from '@/models/TrainingData';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isApproved = searchParams.get('approved');
    const language = searchParams.get('language');
    
    const query: Record<string, unknown> = {};
    if (category && category !== 'all') query.category = category;
    if (isApproved && isApproved !== 'all') query.isApproved = isApproved === 'true';
    if (language) query.language = language;
    
    const trainingData = await TrainingData.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: trainingData });
  } catch (error) {
    console.error('Error fetching training data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch training data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const {
      title,
      category,
      userMessage,
      expectedResponse,
      severity,
      keywords,
      context,
      language,
      isApproved
    } = body;
    
    if (!title || !category || !userMessage || !expectedResponse) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const trainingData = new TrainingData({
      title,
      category,
      userMessage,
      expectedResponse,
      severity: severity || 'low',
      keywords: keywords || [],
      context: context || '',
      language: language || 'en',
      isApproved: isApproved || false,
      usageCount: 0
    });
    
    await trainingData.save();
    
    return NextResponse.json({ success: true, data: trainingData });
  } catch (error) {
    console.error('Error creating training data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create training data' },
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
        { success: false, error: 'Missing training data ID' },
        { status: 400 }
      );
    }
    
    const trainingData = await TrainingData.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );
    
    if (!trainingData) {
      return NextResponse.json(
        { success: false, error: 'Training data not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: trainingData });
  } catch (error) {
    console.error('Error updating training data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update training data' },
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
        { success: false, error: 'Missing training data ID' },
        { status: 400 }
      );
    }
    
    const trainingData = await TrainingData.findByIdAndDelete(id);
    
    if (!trainingData) {
      return NextResponse.json(
        { success: false, error: 'Training data not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Training data deleted successfully' });
  } catch (error) {
    console.error('Error deleting training data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete training data' },
      { status: 500 }
    );
  }
}
