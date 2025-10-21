'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Mic, MicOff, Send, Volume2, VolumeX } from 'lucide-react';
// Voice functionality temporarily disabled for client-side compatibility

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onVoiceInput: () => void;
  onVoiceOutput: (text: string) => void;
  isVoiceRecording: boolean;
  isVoiceEnabled: boolean;
  disabled?: boolean;
  placeholder?: string;
  language?: string;
}

export default function ChatInput({
  onSendMessage,
  onVoiceInput: _onVoiceInput,
  onVoiceOutput,
  isVoiceRecording,
  isVoiceEnabled,
  disabled = false,
  placeholder = "Type your message here..."
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleVoiceToggle = async () => {
    // Voice functionality temporarily disabled
    alert('Voice input is temporarily disabled. Please type your message.');
  };

  const handleVoiceOutputToggle = () => {
    onVoiceOutput('');
  };

  // Voice functionality temporarily disabled

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full min-h-[48px] max-h-[120px] px-4 py-3 pr-12
              border border-gray-200 rounded-2xl bg-white
              resize-none overflow-hidden shadow-sm
              focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400
              disabled:opacity-50 disabled:cursor-not-allowed
              placeholder:text-gray-500 transition-all duration-200
            `}
            style={{ color: '#DD4B4F' }}
            rows={1}
          />
          
          {/* Voice input button */}
          <button
            type="button"
            onClick={handleVoiceToggle}
            disabled={disabled}
            className={`
              absolute right-2 top-1/2 transform -translate-y-1/2
              p-2 rounded-full transition-all duration-200
              ${isVoiceRecording 
                ? 'bg-red-500 text-white animate-pulse shadow-lg' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:shadow-md'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            title={isVoiceRecording ? 'Stop recording' : 'Start voice input'}
          >
            {isVoiceRecording ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
        </div>
        
        <Button
          type="submit"
          disabled={!message.trim() || disabled}
          className="text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
          style={{ backgroundColor: '#DD4B4F' }}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
      
      {/* Voice status indicator */}
      {isVoiceRecording && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Listening... Speak now
        </div>
      )}
      
      {/* Voice output toggle */}
      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={handleVoiceOutputToggle}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-full text-xs transition-all duration-200
            ${isVoiceEnabled 
              ? 'bg-green-100 text-green-700 hover:bg-green-200 shadow-sm' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-sm'
            }
          `}
        >
          {isVoiceEnabled ? (
            <Volume2 className="w-3 h-3" />
          ) : (
            <VolumeX className="w-3 h-3" />
          )}
          Voice Output
        </button>
        
        <span className="text-xs text-gray-500">
          Voice input temporarily disabled
        </span>
      </div>
    </div>
  );
}
