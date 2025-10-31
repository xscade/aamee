'use client';

import React, { useState, useEffect, useRef } from 'react';

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
import { Button } from '@/components/ui/Button';
// import { Card } from '@/components/ui/Card'; // Unused import
import { Settings, Shield, Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { generateSessionId, detectSeverity } from '@/lib/utils';
import { IChatMessage } from '@/models/ChatSession';
import { useTranslation } from '@/lib/translations';
import { cn } from '@/lib/utils';

interface ChatBotProps {
  className?: string;
}

interface QuestionnaireAnswers {
  language?: string;
  isSafe?: string;
  helpType?: string;
  location?: string;
  hasSafePlace?: string;
  contactMode?: string;
  helpFor?: string;
}

export default function ChatBot({ className }: ChatBotProps) {
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [language, setLanguage] = useState('en');
  const [contextRetention, setContextRetention] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);

  // Questionnaire state
  const [questionnaireStep, setQuestionnaireStep] = useState(1);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  const [isEmergency, setIsEmergency] = useState(false);
  const [needsShelter, setNeedsShelter] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const t = useTranslation(language);

  // Generate session ID only on client side to prevent hydration mismatch
  useEffect(() => {
    if (!sessionId) {
      setSessionId(generateSessionId());
    }
  }, [sessionId]);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';

            recognitionRef.current.onresult = (event: any) => {
              const transcript = Array.from(event.results)
                .map((result: any) => result[0])
                .map((result: any) => result.transcript)
                .join('');
          
          if (transcript.trim()) {
            setInput(transcript.trim());
          }
          setIsVoiceRecording(false);
        };

            recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsVoiceRecording(false);
        };

        recognitionRef.current.onend = () => {
          setIsVoiceRecording(false);
        };
      }
    }
  }, [language]);

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

      // Speak welcome message if voice is enabled and it's the first message
      useEffect(() => {
        if (messages.length === 1 && isVoiceEnabled && messages[0]?.role === 'assistant') {
          speakText(messages[0].content);
        }
      }, [messages.length, isVoiceEnabled, messages]);

  // Disable voice features when switching to unsupported language
  useEffect(() => {
    if (language !== 'en' && language !== 'hi') {
      // Stop any ongoing speech
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      // Stop any ongoing voice recording
      if (isVoiceRecording && recognitionRef.current) {
        recognitionRef.current.stop();
      }
      // Disable voice output
      if (isVoiceEnabled) {
        setIsVoiceEnabled(false);
      }
      setIsVoiceRecording(false);
    }
  }, [language, isVoiceEnabled, isVoiceRecording]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !sessionId) return;

    const userMessage: IChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      severity: detectSeverity(input)
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          sessionId,
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

      // Speak the AI response if voice is enabled
      if (isVoiceEnabled && data.response) {
        console.log('Speaking AI response:', data.response.substring(0, 50) + '...');
        speakText(data.response);
      } else {
        console.log('Not speaking - voice enabled:', isVoiceEnabled, 'response length:', data.response?.length || 0);
      }
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Safari.');
      return;
    }

    if (isVoiceRecording) {
      recognitionRef.current.stop();
      setIsVoiceRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsVoiceRecording(true);
      } catch (error) {
        console.error('Error starting voice recognition:', error);
        alert('Unable to start voice recognition. Please try again.');
        setIsVoiceRecording(false);
      }
    }
  };

  const speakText = (text: string) => {
    if (!synthRef.current || !isVoiceEnabled) {
      console.log('Speech synthesis not available or voice disabled');
      return;
    }

    console.log('Speaking text:', text.substring(0, 50) + '...');

    // Stop any current speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    // Wait for voices to load if they're not available yet
    const speak = () => {
      const voices = synthRef.current?.getVoices() || [];
      console.log('Available voices:', voices.length);
      
      const preferredVoice = voices.find(
        voice => voice.lang === utterance.lang && voice.name.includes('Google')
      ) || voices.find(voice => voice.lang === utterance.lang) || voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.log('Using voice:', preferredVoice.name, preferredVoice.lang);
      } else {
        console.log('Using default voice for language:', utterance.lang);
      }

      synthRef.current?.speak(utterance);
    };

    // If voices are not loaded yet, wait for them
    if (synthRef.current.getVoices().length === 0) {
      synthRef.current.addEventListener('voiceschanged', speak, { once: true });
    } else {
      speak();
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-white rounded-lg border shadow-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#DD4B4F' }}
          >
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AME Support</h3>
            <p className="text-xs text-gray-500">Confidential chat</p>
          </div>
        </div>
        
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/admin'}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Admin
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
                className={`h-8 w-8 transition-colors ${showSettings ? 'bg-gray-100 text-gray-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700'}`}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-b bg-white/95 backdrop-blur-sm p-4 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
              style={{ backgroundColor: 'white' }}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="bn">বাংলা</option>
              <option value="gu">ગુજરાતી</option>
              <option value="kn">ಕನ್ನಡ</option>
              <option value="ml">മലയാളം</option>
              <option value="mr">मराठी</option>
              <option value="or">ଓଡ଼ିଆ</option>
              <option value="pa">ਪੰਜਾਬੀ</option>
              <option value="ta">தமிழ்</option>
              <option value="te">తెలుగు</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Context Retention</label>
            <input
              type="checkbox"
              checked={contextRetention}
              onChange={(e) => setContextRetention(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-red-200 focus:ring-offset-0"
              style={{ 
                accentColor: '#DD4B4F',
                backgroundColor: contextRetention ? '#DD4B4F' : 'white'
              }}
            />
          </div>
          {sessionId && (
            <div className="pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Session: {sessionId.slice(0, 8)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-3",
              message.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            {message.role === 'assistant' && (
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                style={{ backgroundColor: '#DD4B4F' }}
              >
                <Shield className="w-3 h-3 text-white" />
              </div>
            )}
            
            <div 
              className={cn(
                "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                message.role === 'user' 
                  ? "bg-white border" 
                  : "text-white"
              )}
              style={message.role === 'assistant' ? { backgroundColor: '#DD4B4F' } : { color: '#DD4B4F' }}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.resources && message.resources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {message.resources.map((resource, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white/20 text-white"
                    >
                      {resource}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {message.role === 'user' && (
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                style={{ backgroundColor: '#DD4B4F' }}
              >
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
              style={{ backgroundColor: '#DD4B4F' }}
            >
              <Shield className="w-3 h-3 text-white" />
            </div>
            <div className="bg-gray-100 rounded-lg px-3 py-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading}
              className={cn(
                "w-full min-h-[40px] max-h-[120px] px-3 py-2 pr-10",
                "border border-gray-200 rounded-lg resize-none",
                "focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "placeholder:text-gray-500 text-sm"
              )}
              style={{ color: '#DD4B4F' }}
              rows={1}
            />
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={`absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 transition-colors ${
                isVoiceRecording
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              onClick={handleVoiceInput}
              disabled={isLoading || (language !== 'en' && language !== 'hi')}
              title={language !== 'en' && language !== 'hi' ? 'Voice input available for English and Hindi only' : 'Voice input'}
            >
              {isVoiceRecording ? (
                <MicOff className="h-3 w-3" />
              ) : (
                <Mic className="h-3 w-3" />
              )}
            </Button>
          </div>
          
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-3 py-2 h-10"
            style={{ backgroundColor: '#DD4B4F' }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (isVoiceEnabled && synthRef.current) {
                  synthRef.current.cancel();
                }
                const newVoiceState = !isVoiceEnabled;
                console.log('Voice enabled:', newVoiceState);
                setIsVoiceEnabled(newVoiceState);

                // Test speech synthesis if enabling
                if (newVoiceState && synthRef.current) {
                  console.log('Testing speech synthesis...');
                  setTimeout(() => {
                    speakText('Voice output is now enabled');
                  }, 100);
                }
              }}
              disabled={language !== 'en' && language !== 'hi'}
              title={language !== 'en' && language !== 'hi' ? 'Voice output available for English and Hindi only' : 'Toggle voice output'}
              className={`h-6 px-2 text-xs transition-colors ${
                isVoiceEnabled
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {isVoiceEnabled ? (
                <Volume2 className="h-3 w-3 mr-1" />
              ) : (
                <VolumeX className="h-3 w-3 mr-1" />
              )}
              Voice
            </Button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
