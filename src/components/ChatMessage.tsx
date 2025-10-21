'use client';

import React from 'react';
import { cn, formatTimestamp, getSeverityColor } from '@/lib/utils';
import { MessageCircle, User, AlertTriangle, Shield } from 'lucide-react';

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    severity?: 'low' | 'medium' | 'high' | 'emergency';
    resources?: string[];
  };
  isLatest?: boolean;
}

export default function ChatMessage({ message, isLatest = false }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const severity = message.severity || 'low';
  const severityColors = getSeverityColor(severity);

  return (
    <div className={cn(
      "flex gap-3 message-enter",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && (
        <div className="flex-shrink-0">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shadow-sm",
            severity === 'emergency' ? "bg-severity-emergency" : 
            severity === 'high' ? "bg-secondary" :
            severity === 'medium' ? "bg-accent" : "bg-cta"
          )}>
            {severity === 'emergency' ? (
              <AlertTriangle className="w-4 h-4 text-white" />
            ) : (
              <Shield className="w-4 h-4 text-white" />
            )}
          </div>
        </div>
      )}
      
      <div className={cn(
        "max-w-[75%] flex flex-col gap-2",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "rounded-2xl px-4 py-3 relative shadow-sm",
          isUser 
            ? "bg-white text-black rounded-br-md border border-gray-200" 
            : "text-white rounded-bl-md",
          isLatest && "message-slide"
        )} style={!isUser ? { backgroundColor: '#DD4B4F' } : {}}>
          {/* Severity indicator */}
          {!isUser && message.severity && (
            <div className={cn(
              "absolute -left-2 top-3 w-3 h-3 rounded-full shadow-sm",
              severity === 'low' && "bg-severity-low",
              severity === 'medium' && "bg-severity-medium", 
              severity === 'high' && "bg-severity-high",
              severity === 'emergency' && "bg-severity-emergency animate-pulse"
            )} />
          )}
          
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
          
          {/* Resources section */}
          {message.resources && message.resources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200/50">
              <div className="flex flex-wrap gap-2">
                {message.resources.map((resource, index) => (
                  <span
                    key={index}
                    className={cn(
                      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium shadow-sm",
                      resource === 'emergency' && "bg-red-100 text-red-800 border border-red-200",
                      resource === 'legal' && "bg-blue-100 text-blue-800 border border-blue-200",
                      resource === 'medical' && "bg-green-100 text-green-800 border border-green-200",
                      resource === 'shelter' && "bg-purple-100 text-purple-800 border border-purple-200",
                      resource === 'psychological' && "bg-pink-100 text-pink-800 border border-pink-200"
                    )}
                  >
                    {resource === 'emergency' && '🚨 Emergency'}
                    {resource === 'legal' && '⚖️ Legal'}
                    {resource === 'medical' && '🏥 Medical'}
                    {resource === 'shelter' && '🏠 Shelter'}
                    {resource === 'psychological' && '🧠 Counseling'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
          <span>{formatTimestamp(message.timestamp)}</span>
          {!isUser && message.severity && (
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium shadow-sm",
              severityColors
            )}>
              {severity.charAt(0).toUpperCase() + severity.slice(1)}
            </span>
          )}
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm" style={{ backgroundColor: '#DD4B4F' }}>
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}
