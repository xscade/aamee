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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Settings, Shield, Send, Mic, MicOff, Volume2, VolumeX, Phone, Mail, Globe, MapPin, CheckCircle, Clock } from 'lucide-react';
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

interface Resource {
  _id: string;
  title: string;
  description: string;
  category: 'legal' | 'medical' | 'shelter' | 'psychological' | 'emergency' | 'general';
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
  };
  location?: {
    city?: string;
    state?: string;
    country: string;
  };
  severity: 'low' | 'medium' | 'high' | 'emergency';
  languages: string[];
  is24Hours: boolean;
  isVerified: boolean;
  tags: string[];
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
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [resourcesError, setResourcesError] = useState(false);

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

  // Initialize with first questionnaire question if no messages
  useEffect(() => {
    if (messages.length === 0 && questionnaireStep === 1) {
      const questionMessage: IChatMessage = {
        role: 'assistant',
        content: t('questionnaire.q1_question'),
        timestamp: new Date(),
        severity: 'low'
      };
      setMessages([questionMessage]);
    }
  }, [messages.length, questionnaireStep, t]);

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

  // Fetch resources when questionnaire is complete
  useEffect(() => {
    if (questionnaireStep === 8 && !resourcesLoading && resources.length === 0) {
      fetchResources();
    }
  }, [questionnaireStep]);

  // Map helpType to category
  const mapHelpTypeToCategory = (helpType: string): string => {
    const helpTypeMap: { [key: string]: string } = {
      [t('questionnaire.q3_emergency')]: 'emergency',
      [t('questionnaire.q3_shelter')]: 'shelter',
      [t('questionnaire.q3_legal')]: 'legal',
      [t('questionnaire.q3_counseling')]: 'psychological',
      [t('questionnaire.q3_rights')]: 'legal',
    };
    return helpTypeMap[helpType] || 'general';
  };

  // Fetch resources from API
  const fetchResources = async () => {
    setResourcesLoading(true);
    setResourcesError(false);

    try {
      // Build query parameters based on answers
      const params = new URLSearchParams();

      // Map helpType to category
      if (answers.helpType) {
        const category = mapHelpTypeToCategory(answers.helpType);
        params.append('category', category);
      }

      // Add location if provided
      if (answers.location) {
        params.append('location', answers.location);
      }

      // Prioritize emergency if user is not safe
      if (answers.isSafe === t('questionnaire.q2_no')) {
        params.set('category', 'emergency');
      }

      // Prioritize shelter if user doesn't have safe place
      if (answers.hasSafePlace === t('questionnaire.q5_no')) {
        params.set('category', 'shelter');
      }

      const response = await fetch(`/api/resources?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch resources');
      }

      const data = await response.json();
      setResources(data.resources || []);

      // Display resources in chat
      displayResources(data.resources || []);

    } catch (error) {
      console.error('Error fetching resources:', error);
      setResourcesError(true);

      // Show error message with emergency contacts
      const errorMessage: IChatMessage = {
        role: 'assistant',
        content: t('questionnaire.emergencyMessage'),
        timestamp: new Date(),
        severity: 'emergency'
      };
      setMessages(prev => [...prev, errorMessage]);

      const contactsMessage: IChatMessage = {
        role: 'assistant',
        content: `${t('chat.police')}\n${t('chat.womenHelpline')}\n${t('chat.medicalEmergency')}\n${t('chat.domesticViolence')}\n\n${t('chat.available24_7')}`,
        timestamp: new Date(),
        severity: 'emergency'
      };
      setMessages(prev => [...prev, contactsMessage]);
    } finally {
      setResourcesLoading(false);
    }
  };

  // Display resources in chat
  const displayResources = (fetchedResources: Resource[]) => {
    // Show guidance message if helping someone else
    if (answers.helpFor === t('questionnaire.q7_someone')) {
      const guidanceMessage: IChatMessage = {
        role: 'assistant',
        content: language === 'hi'
          ? 'किसी और की मदद करना बहुत साहसी है। कृपया याद रखें कि उनकी सुरक्षा और सहमति सबसे महत्वपूर्ण है। यहां कुछ संसाधन दिए गए हैं जो मदद कर सकते हैं:'
          : 'It\'s very brave to help someone else. Please remember that their safety and consent are most important. Here are some resources that can help:',
        timestamp: new Date(),
        severity: 'low'
      };
      setMessages(prev => [...prev, guidanceMessage]);
    }

    if (fetchedResources.length === 0) {
      // No resources found
      const noResourcesMessage: IChatMessage = {
        role: 'assistant',
        content: language === 'hi'
          ? 'हमें आपके क्षेत्र में विशिष्ट संसाधन नहीं मिले, लेकिन आप इन आपातकालीन संपर्कों तक पहुंच सकते हैं जो 24/7 उपलब्ध हैं:'
          : 'We couldn\'t find specific resources in your area, but you can reach these emergency contacts that are available 24/7:',
        timestamp: new Date(),
        severity: 'medium'
      };
      setMessages(prev => [...prev, noResourcesMessage]);

      const emergencyContactsMessage: IChatMessage = {
        role: 'assistant',
        content: `${t('chat.police')}\n${t('chat.womenHelpline')}\n${t('chat.medicalEmergency')}\n${t('chat.domesticViolence')}\n\n${t('chat.available24_7')}`,
        timestamp: new Date(),
        severity: 'emergency'
      };
      setMessages(prev => [...prev, emergencyContactsMessage]);
      return;
    }

    // Show success message
    const successMessage: IChatMessage = {
      role: 'assistant',
      content: language === 'hi'
        ? `मैंने आपके लिए ${fetchedResources.length} संसाधन पाए हैं:`
        : `I found ${fetchedResources.length} resources for you:`,
      timestamp: new Date(),
      severity: 'low'
    };
    setMessages(prev => [...prev, successMessage]);
  };

  // Render individual resource card
  const renderResourceCard = (resource: Resource) => {
    const contactMode = answers.contactMode;
    const showPhone = contactMode === t('questionnaire.q6_call');
    const showEmail = contactMode === t('questionnaire.q6_email');
    const showWebsite = contactMode === t('questionnaire.q6_chat');

    // Category labels
    const categoryLabels: { [key: string]: string } = {
      emergency: language === 'hi' ? 'आपातकालीन' : 'Emergency',
      shelter: language === 'hi' ? 'शरणस्थली' : 'Shelter',
      legal: language === 'hi' ? 'कानूनी' : 'Legal',
      psychological: language === 'hi' ? 'परामर्श' : 'Counseling',
      medical: language === 'hi' ? 'चिकित्सा' : 'Medical',
      general: language === 'hi' ? 'सामान्य' : 'General'
    };

    return (
      <Card key={resource._id} className="mb-3 bg-white border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-base font-semibold text-gray-900 mb-1">
                {resource.title}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: '#FEE2E2', color: '#DD4B4F' }}
                >
                  {categoryLabels[resource.category] || resource.category}
                </span>
                {resource.is24Hours && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                    <Clock className="h-3 w-3" />
                    24/7
                  </span>
                )}
                {resource.isVerified && (
                  <span className="inline-flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    {language === 'hi' ? 'सत्यापित' : 'Verified'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 mb-3">{resource.description}</p>

          {/* Location */}
          {resource.location && (resource.location.city || resource.location.state) && (
            <div className="flex items-start gap-2 mb-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                {[resource.location.city, resource.location.state]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-2 mt-3">
            {(showPhone || !contactMode) && resource.contactInfo.phone && (
              <a
                href={`tel:${resource.contactInfo.phone}`}
                className="flex items-center gap-2 text-sm hover:underline"
                style={{ color: '#DD4B4F' }}
              >
                <Phone className="h-4 w-4" />
                <span>{resource.contactInfo.phone}</span>
              </a>
            )}
            {(showEmail || !contactMode) && resource.contactInfo.email && (
              <a
                href={`mailto:${resource.contactInfo.email}`}
                className="flex items-center gap-2 text-sm hover:underline"
                style={{ color: '#DD4B4F' }}
              >
                <Mail className="h-4 w-4" />
                <span>{resource.contactInfo.email}</span>
              </a>
            )}
            {(showWebsite || !contactMode) && resource.contactInfo.website && (
              <a
                href={resource.contactInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:underline"
                style={{ color: '#DD4B4F' }}
              >
                <Globe className="h-4 w-4" />
                <span>{language === 'hi' ? 'वेबसाइट पर जाएं' : 'Visit Website'}</span>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Handle questionnaire answer selection
  const handleQuestionnaireAnswer = (answer: string, answerKey: keyof QuestionnaireAnswers) => {
    // Add user's answer to messages
    const userMessage: IChatMessage = {
      role: 'user',
      content: answer,
      timestamp: new Date(),
      severity: 'low'
    };
    setMessages(prev => [...prev, userMessage]);

    // Store the answer
    const newAnswers = { ...answers, [answerKey]: answer };
    setAnswers(newAnswers);

    // Handle special cases
    if (questionnaireStep === 1) {
      // Q1: Language selection
      const languageMap: { [key: string]: string } = {
        [t('questionnaire.q1_english')]: 'en',
        [t('questionnaire.q1_hindi')]: 'hi',
      };
      const selectedLanguage = languageMap[answer] || 'en';
      setLanguage(selectedLanguage);
    } else if (questionnaireStep === 2 && answer === t('questionnaire.q2_no')) {
      // Q2: Safety check - "No" means emergency
      setIsEmergency(true);

      // Show emergency resources immediately
      const emergencyMessage: IChatMessage = {
        role: 'assistant',
        content: t('questionnaire.emergencyMessage'),
        timestamp: new Date(),
        severity: 'emergency'
      };
      setMessages(prev => [...prev, emergencyMessage]);

      // Add emergency contact details
      const contactsMessage: IChatMessage = {
        role: 'assistant',
        content: `${t('chat.police')}\n${t('chat.womenHelpline')}\n${t('chat.medicalEmergency')}\n${t('chat.domesticViolence')}\n\n${t('chat.available24_7')}`,
        timestamp: new Date(),
        severity: 'emergency'
      };
      setMessages(prev => [...prev, contactsMessage]);
      return; // Don't proceed to next question automatically
    } else if (questionnaireStep === 5 && answer === t('questionnaire.q5_no')) {
      // Q5: Safe place check - "No" means needs shelter
      setNeedsShelter(true);
    }

    // Move to next question or show completion
    if (questionnaireStep < 7) {
      setTimeout(() => {
        const nextStep = questionnaireStep + 1;
        setQuestionnaireStep(nextStep);

        // Add next question
        const nextQuestion = getQuestionContent(nextStep);
        const questionMessage: IChatMessage = {
          role: 'assistant',
          content: nextQuestion,
          timestamp: new Date(),
          severity: 'low'
        };
        setMessages(prev => [...prev, questionMessage]);
      }, 300);
    } else {
      // All questions answered
      setTimeout(() => {
        const completionMessage: IChatMessage = {
          role: 'assistant',
          content: t('questionnaire.findingResources'),
          timestamp: new Date(),
          severity: 'low'
        };
        setMessages(prev => [...prev, completionMessage]);
        setQuestionnaireStep(8); // Mark as complete
      }, 300);
    }
  };

  // Get question content based on step
  const getQuestionContent = (step: number): string => {
    switch (step) {
      case 1: return t('questionnaire.q1_question');
      case 2: return t('questionnaire.q2_question');
      case 3: return t('questionnaire.q3_question');
      case 4: return t('questionnaire.q4_question');
      case 5: return t('questionnaire.q5_question');
      case 6: return t('questionnaire.q6_question');
      case 7: return t('questionnaire.q7_question');
      default: return '';
    }
  };

  // Handle location input submission (Q4)
  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    handleQuestionnaireAnswer(input.trim(), 'location');
    setInput('');
  };

  // Handle location detection
  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationText = `${position.coords.latitude}, ${position.coords.longitude}`;
          handleQuestionnaireAnswer(locationText, 'location');
        },
        (error) => {
          alert('Unable to get your location. Please enter your city or pin code manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

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
        
        {(isLoading || resourcesLoading) && (
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

        {/* Display resources */}
        {questionnaireStep === 8 && resources.length > 0 && (
          <div className="flex gap-3 items-start">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
              style={{ backgroundColor: '#DD4B4F' }}
            >
              <Shield className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1 space-y-3">
              {resources.map(resource => renderResourceCard(resource))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input / Question Options */}
      <div className="border-t p-4">
        {questionnaireStep <= 7 ? (
          <div className="space-y-3">
            {/* Question Options */}
            {questionnaireStep === 1 && (
              <div className="grid grid-cols-2 gap-2">
                {['q1_english', 'q1_hindi', 'q1_tamil', 'q1_telugu', 'q1_bengali', 'q1_other'].map((key) => (
                  <Button
                    key={key}
                    onClick={() => handleQuestionnaireAnswer(t(`questionnaire.${key}`), 'language')}
                    className="w-full py-3 text-sm font-medium"
                    style={{ backgroundColor: '#DD4B4F' }}
                  >
                    {t(`questionnaire.${key}`)}
                  </Button>
                ))}
              </div>
            )}
            {questionnaireStep === 2 && (
              <div className="space-y-2">
                {!isEmergency ? (
                  <>
                    {['q2_yes', 'q2_unsure', 'q2_no'].map((key) => (
                      <Button
                        key={key}
                        onClick={() => handleQuestionnaireAnswer(t(`questionnaire.${key}`), 'isSafe')}
                        className="w-full py-3 text-sm font-medium"
                        style={{ backgroundColor: '#DD4B4F' }}
                      >
                        {t(`questionnaire.${key}`)}
                      </Button>
                    ))}
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => window.close()}
                      className="w-full py-3 text-sm font-medium bg-red-600 hover:bg-red-700"
                    >
                      {t('questionnaire.quickExit')}
                    </Button>
                    <Button
                      onClick={() => {
                        const nextStep = 3;
                        setQuestionnaireStep(nextStep);
                        const nextQuestion = getQuestionContent(nextStep);
                        const questionMessage: IChatMessage = {
                          role: 'assistant',
                          content: nextQuestion,
                          timestamp: new Date(),
                          severity: 'low'
                        };
                        setMessages(prev => [...prev, questionMessage]);
                      }}
                      className="w-full py-3 text-sm font-medium"
                      style={{ backgroundColor: '#DD4B4F' }}
                    >
                      Continue
                    </Button>
                  </>
                )}
              </div>
            )}
            {questionnaireStep === 3 && (
              <div className="space-y-2">
                {['q3_emergency', 'q3_shelter', 'q3_legal', 'q3_counseling', 'q3_rights'].map((key) => (
                  <Button
                    key={key}
                    onClick={() => handleQuestionnaireAnswer(t(`questionnaire.${key}`), 'helpType')}
                    className="w-full py-3 text-sm font-medium"
                    style={{ backgroundColor: '#DD4B4F' }}
                  >
                    {t(`questionnaire.${key}`)}
                  </Button>
                ))}
              </div>
            )}
            {questionnaireStep === 4 && (
              <div className="space-y-2">
                <form onSubmit={handleLocationSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t('questionnaire.q4_placeholder')}
                    className={cn(
                      "flex-1 px-3 py-2",
                      "border border-gray-200 rounded-lg",
                      "focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400",
                      "placeholder:text-gray-500 text-sm"
                    )}
                    style={{ color: '#DD4B4F' }}
                  />
                  <Button
                    type="submit"
                    disabled={!input.trim()}
                    className="px-4 py-2"
                    style={{ backgroundColor: '#DD4B4F' }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                <Button
                  onClick={handleUseLocation}
                  className="w-full py-3 text-sm font-medium"
                  style={{ backgroundColor: '#DD4B4F' }}
                >
                  {t('questionnaire.q4_useLocation')}
                </Button>
              </div>
            )}
            {questionnaireStep === 5 && (
              <div className="space-y-2">
                {['q5_yes', 'q5_no', 'q5_unsure'].map((key) => (
                  <Button
                    key={key}
                    onClick={() => handleQuestionnaireAnswer(t(`questionnaire.${key}`), 'hasSafePlace')}
                    className="w-full py-3 text-sm font-medium"
                    style={{ backgroundColor: '#DD4B4F' }}
                  >
                    {t(`questionnaire.${key}`)}
                  </Button>
                ))}
              </div>
            )}
            {questionnaireStep === 6 && (
              <div className="space-y-2">
                {['q6_call', 'q6_chat', 'q6_email'].map((key) => (
                  <Button
                    key={key}
                    onClick={() => handleQuestionnaireAnswer(t(`questionnaire.${key}`), 'contactMode')}
                    className="w-full py-3 text-sm font-medium"
                    style={{ backgroundColor: '#DD4B4F' }}
                  >
                    {t(`questionnaire.${key}`)}
                  </Button>
                ))}
              </div>
            )}
            {questionnaireStep === 7 && (
              <div className="space-y-2">
                {['q7_myself', 'q7_someone'].map((key) => (
                  <Button
                    key={key}
                    onClick={() => handleQuestionnaireAnswer(t(`questionnaire.${key}`), 'helpFor')}
                    className="w-full py-3 text-sm font-medium"
                    style={{ backgroundColor: '#DD4B4F' }}
                  >
                    {t(`questionnaire.${key}`)}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Regular chat input after questionnaire
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
        )}

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
