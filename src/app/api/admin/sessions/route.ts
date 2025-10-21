import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ChatSession from '@/models/ChatSession';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');
    const severity = searchParams.get('severity');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    
    const query: Record<string, unknown> = {};
    
    // Filter by severity if provided
    if (severity && severity !== 'all') {
      query['messages.severity'] = severity;
    }
    
    // Filter by date range if provided
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) (query.createdAt as Record<string, unknown>).$gte = new Date(dateFrom);
      if (dateTo) (query.createdAt as Record<string, unknown>).$lte = new Date(dateTo);
    }
    
    const sessions = await ChatSession.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .select('sessionId messages createdAt updatedAt contextRetention isAnonymous');
    
    const totalCount = await ChatSession.countDocuments(query);
    
    return NextResponse.json({ 
      success: true, 
      data: sessions,
      pagination: {
        total: totalCount,
        limit,
        skip,
        hasMore: skip + limit < totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chat sessions' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing session ID' },
        { status: 400 }
      );
    }
    
    const session = await ChatSession.findOneAndDelete({ sessionId });
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete chat session' },
      { status: 500 }
    );
  }
}
