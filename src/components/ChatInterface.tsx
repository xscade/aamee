'use client';

import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import EmergencyButton from './EmergencyButton';
import SafetyPlanning from './SafetyPlanning';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Settings, Shield } from 'lucide-react';
import { generateSessionId, detectSeverity } from '@/lib/utils';
import { IChatMessage } from '@/models/ChatSession';

interface ChatInterfaceProps {
  initialMessages?: IChatMessage[];
  sessionId?: string;
}

export default function ChatInterface({ initialMessages = [], sessionId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<IChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [contextRetention, setContextRetention] = useState(true);
  const [language, setLanguage] = useState('en');
  const [currentSessionId] = useState(sessionId || generateSessionId());
  const [showSafetyPlanning, setShowSafetyPlanning] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message if no messages
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: IChatMessage = {
        role: 'assistant',
        content: `Hello, I'm AME. I'm here to provide confidential support and connect you with resources for domestic violence survivors. 

I can help you with:
• Legal assistance and protection orders
• Medical and mental health support  
• Emergency shelter information
• Safety planning and self-care
• Connecting with local resources

Everything we discuss is completely confidential. How can I help you today?`,
        timestamp: new Date(),
        severity: 'low'
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length]);

  // Voice functionality temporarily disabled

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: IChatMessage = {
      role: 'user',
      content,
      timestamp: new Date(),
      severity: detectSeverity(content)
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call the API route instead of direct OpenAI call
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          sessionId: currentSessionId,
          contextRetention,
          language
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from server');
      }

      const data = await response.json();
      
      const assistantMessage: IChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        severity: data.severity,
        resources: data.resources
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: IChatMessage = {
        role: 'assistant',
        content: 'I apologize, but I\'m experiencing technical difficulties. Please try again or contact emergency services if you need immediate help.',
        timestamp: new Date(),
        severity: 'emergency',
        resources: ['emergency']
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    setIsVoiceRecording(!isVoiceRecording);
    // TODO: Implement actual voice recording functionality
  };

  const handleVoiceOutput = async (_text: string) => {
    setIsVoiceEnabled(!isVoiceEnabled);
  };

  const handleEmergencyClick = () => {
    const emergencyMessage = `🚨 EMERGENCY RESOURCES 🚨

If you're in immediate danger, please call:
• Police: 100
• Women Helpline: 181  
• Medical Emergency: 108
• Domestic Violence Hotline: 1091

These services are available 24/7. Your safety is the top priority.`;

    const emergencyMsg: IChatMessage = {
      role: 'assistant',
      content: emergencyMessage,
      timestamp: new Date(),
      severity: 'emergency',
      resources: ['emergency']
    };

    setMessages(prev => [...prev, emergencyMsg]);
  };

  const hasHighSeverityMessages = messages.some(msg => 
    msg.severity === 'high' || msg.severity === 'emergency'
  );

  return (
    <div className="min-h-screen bg-fog flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#DD4B4F' }}>
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-black">AME Support Chat</h1>
                <p className="text-sm text-gray-600">Confidential support for domestic violence survivors</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-600 hover:bg-gray-100"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Settings Panel */}
          {showSettings && (
            <Card className="mt-4 p-4 bg-white">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Context Retention</label>
                  <input
                    type="checkbox"
                    checked={contextRetention}
                    onChange={(e) => setContextRetention(e.target.checked)}
                    className="rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>
                
                <Button
                  onClick={() => setShowSafetyPlanning(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Safety Planning Guide
                </Button>
                
                <div className="text-xs text-gray-500">
                  Session ID: {currentSessionId}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 flex justify-center items-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          {/* Chat Messages Container */}
          <div 
            ref={chatContainerRef}
            className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col"
            style={{ height: '70vh', minHeight: '500px' }}
          >
            {/* Chat Messages */}
            <div className="overflow-y-auto p-6 space-y-4" style={{ height: 'calc(100% - 120px)' }}>
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message}
                  isLatest={index === messages.length - 1}
                />
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#DD4B4F' }} />
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#DD4B4F', animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#DD4B4F', animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="border-t border-gray-200 bg-white p-4" style={{ height: '120px' }}>
              <ChatInput
                onSendMessage={handleSendMessage}
                onVoiceInput={handleVoiceInput}
                onVoiceOutput={handleVoiceOutput}
                isVoiceRecording={isVoiceRecording}
                isVoiceEnabled={isVoiceEnabled}
                disabled={isLoading}
                language={language}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Button */}
      <EmergencyButton
        onEmergencyClick={handleEmergencyClick}
        isVisible={hasHighSeverityMessages}
      />

      {/* Safety Planning Modal */}
      {showSafetyPlanning && (
        <SafetyPlanning onClose={() => setShowSafetyPlanning(false)} />
      )}
    </div>
  );
}
