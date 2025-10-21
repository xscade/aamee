import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ChatSession from '@/models/ChatSession';
import TrainingData from '@/models/TrainingData';
import Resource from '@/models/Resource';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 7d, 30d, 90d
    
    // Calculate date range based on period
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    // Get session statistics
    const totalSessions = await ChatSession.countDocuments({
      createdAt: { $gte: startDate }
    });
    
    const totalMessages = await ChatSession.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $project: { messageCount: { $size: '$messages' } } },
      { $group: { _id: null, total: { $sum: '$messageCount' } } }
    ]);
    
    // Get severity distribution
    const severityStats = await ChatSession.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$messages' },
      { $group: { _id: '$messages.severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get daily session counts
    const dailyStats = await ChatSession.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Get training data statistics
    const trainingStats = await TrainingData.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          approved: { $sum: { $cond: ['$isApproved', 1, 0] } },
          pending: { $sum: { $cond: ['$isApproved', 0, 1] } },
          totalUsage: { $sum: '$usageCount' }
        }
      }
    ]);
    
    // Get resource statistics
    const resourceStats = await Resource.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          verified: { $sum: { $cond: ['$isVerified', 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get top keywords from messages
    const topKeywords = await ChatSession.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$messages' },
      { $project: { words: { $split: ['$messages.content', ' '] } } },
      { $unwind: '$words' },
      {
        $match: {
          words: {
            $regex: /^[a-zA-Z]{3,}$/,
            $nin: ['the', 'and', 'you', 'are', 'for', 'not', 'this', 'with', 'have', 'that', 'will', 'your', 'can', 'but', 'all', 'she', 'was', 'they', 'one', 'had', 'how', 'said', 'each', 'which', 'their', 'time', 'know', 'want', 'very', 'when', 'much', 'some', 'take', 'into', 'more', 'only', 'other', 'new', 'also', 'well', 'way', 'may', 'say', 'use', 'her', 'many', 'than', 'see', 'him', 'two', 'more', 'go', 'no', 'way', 'could', 'my', 'over', 'think', 'so', 'up', 'out', 'if', 'about', 'who', 'oil', 'sit', 'now', 'find', 'long', 'down', 'day', 'did', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use']
          }
        }
      },
      { $group: { _id: { $toLower: '$words' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    
    const analytics = {
      overview: {
        totalSessions,
        totalMessages: totalMessages[0]?.total || 0,
        averageMessagesPerSession: totalSessions > 0 ? Math.round((totalMessages[0]?.total || 0) / totalSessions * 100) / 100 : 0,
        period
      },
      severityDistribution: severityStats,
      dailyStats: dailyStats.map(stat => ({
        date: `${stat._id.year}-${stat._id.month.toString().padStart(2, '0')}-${stat._id.day.toString().padStart(2, '0')}`,
        sessions: stat.count
      })),
      training: trainingStats[0] || { total: 0, approved: 0, pending: 0, totalUsage: 0 },
      resources: resourceStats,
      topKeywords: topKeywords
    };
    
    return NextResponse.json({ success: true, data: analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
