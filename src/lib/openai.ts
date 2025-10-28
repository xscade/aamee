import OpenAI from 'openai';
import { detectSeverity } from './utils';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatResponse {
  message: string;
  severity: 'low' | 'medium' | 'high' | 'emergency';
  resources?: string[];
  isEmergency?: boolean;
}

export async function generateChatResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  language: string = 'en'
): Promise<ChatResponse> {
  try {
    // Language code to name mapping
    const languageNames: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      bn: 'Bengali',
      te: 'Telugu',
      mr: 'Marathi',
      ta: 'Tamil',
      gu: 'Gujarati',
      kn: 'Kannada',
      ml: 'Malayalam',
      pa: 'Punjabi',
      or: 'Odia'
    };

    const targetLanguage = languageNames[language] || 'English';

    const systemPrompt = `You are AME, a compassionate AI assistant for domestic violence survivors. Your role is to provide support, guidance, and connect users to appropriate resources while maintaining their privacy and safety.

Key Guidelines:
1. Always respond with empathy and non-judgmental language
2. Prioritize user safety - if someone is in immediate danger, provide emergency resources
3. Maintain confidentiality and anonymity
4. Provide practical, actionable advice
5. Connect users to relevant support services
6. Use a warm, supportive tone
7. Respond in ${targetLanguage}

Available Support Categories:
- Legal Help: Filing FIR, legal aid, protection orders
- Medical Help: Healthcare providers, mental health support
- Shelter Services: Safe housing, emergency accommodation
- Psychological Support: Counseling, therapy, helplines
- Safety Planning: Emergency plans, safety strategies
- Self-Care: Coping strategies, wellness resources

Emergency Resources (use when severity is high/emergency):
- National Helpline: 181 (Women Helpline)
- Police: 100
- Emergency Medical: 108
- Domestic Violence Hotline: 1091

Always end responses with relevant resource suggestions when appropriate.`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory,
      { role: 'user' as const, content: userMessage }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      temperature: 0.7,
      max_tokens: 500,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I cannot process your request at the moment. Please try again or contact emergency services if this is urgent.';
    
    const severity = detectSeverity(userMessage);
    
    // Extract resources from response
    const resources: string[] = [];
    if (response.includes('helpline') || response.includes('emergency')) {
      resources.push('emergency');
    }
    if (response.includes('legal') || response.includes('lawyer')) {
      resources.push('legal');
    }
    if (response.includes('medical') || response.includes('doctor') || response.includes('hospital')) {
      resources.push('medical');
    }
    if (response.includes('shelter') || response.includes('housing')) {
      resources.push('shelter');
    }
    if (response.includes('counseling') || response.includes('therapy')) {
      resources.push('psychological');
    }

    return {
      message: response,
      severity,
      resources,
      isEmergency: severity === 'emergency'
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return {
      message: 'I apologize, but I\'m experiencing technical difficulties. Please contact emergency services at 100 (police) or 181 (women helpline) if you need immediate help.',
      severity: 'emergency',
      resources: ['emergency'],
      isEmergency: true
    };
  }
}

export async function generateVoiceResponse(text: string, language: string = 'en'): Promise<string> {
  try {
    const completion = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
      response_format: "mp3",
    });

    const buffer = Buffer.from(await completion.arrayBuffer());
    return `data:audio/mp3;base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error('OpenAI TTS Error:', error);
    throw new Error('Unable to generate voice response');
  }
}
