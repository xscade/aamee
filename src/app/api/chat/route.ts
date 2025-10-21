import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ChatSession from '@/models/ChatSession';
import { generateChatResponse } from '@/lib/openai';
import { generateSessionId, detectSeverity } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { message, sessionId, contextRetention = true, language = 'en' } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get or create session
    let session = await ChatSession.findOne({ sessionId });
    if (!session) {
      session = new ChatSession({
        sessionId: sessionId || generateSessionId(),
        messages: [],
        contextRetention,
        language
      });
    }

    // Add user message
    const userMessage = {
      role: 'user' as const,
      content: message,
      timestamp: new Date(),
      severity: detectSeverity(message)
    };

    session.messages.push(userMessage);

    // Generate AI response
    const conversationHistory = contextRetention 
      ? session.messages.slice(-10).map((msg: { role: string; content: string }) => ({ role: msg.role, content: msg.content }))
      : [];

    const aiResponse = await generateChatResponse(message, conversationHistory, language);

    const assistantMessage = {
      role: 'assistant' as const,
      content: aiResponse.message,
      timestamp: new Date(),
      severity: aiResponse.severity,
      resources: aiResponse.resources
    };

    session.messages.push(assistantMessage);
    await session.save();

    return NextResponse.json({
      response: aiResponse.message,
      severity: aiResponse.severity,
      resources: aiResponse.resources,
      sessionId: session.sessionId,
      isEmergency: aiResponse.isEmergency
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const session = await ChatSession.findOne({ sessionId });
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      sessionId: session.sessionId,
      messages: session.messages,
      contextRetention: session.contextRetention,
      language: session.language,
      createdAt: session.createdAt
    });

  } catch (error) {
    console.error('Get Chat Session Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
