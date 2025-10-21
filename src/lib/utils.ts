import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function detectSeverity(text: string): 'low' | 'medium' | 'high' | 'emergency' {
  const emergencyKeywords = [
    'emergency', 'urgent', 'help', 'danger', 'threat', 'violence', 'abuse',
    'hurt', 'injured', 'hospital', 'police', 'immediate', 'now', 'crisis'
  ];
  
  const highSeverityKeywords = [
    'scared', 'fear', 'afraid', 'unsafe', 'threatened', 'harassment',
    'stalking', 'violent', 'aggressive', 'dangerous'
  ];
  
  const mediumSeverityKeywords = [
    'worried', 'concerned', 'stress', 'anxiety', 'depressed', 'sad',
    'overwhelmed', 'confused', 'need help', 'support'
  ];
  
  const textLower = text.toLowerCase();
  
  if (emergencyKeywords.some(keyword => textLower.includes(keyword))) {
    return 'emergency';
  }
  
  if (highSeverityKeywords.some(keyword => textLower.includes(keyword))) {
    return 'high';
  }
  
  if (mediumSeverityKeywords.some(keyword => textLower.includes(keyword))) {
    return 'medium';
  }
  
  return 'low';
}

export function getSeverityColor(severity: 'low' | 'medium' | 'high' | 'emergency'): string {
  switch (severity) {
    case 'low':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'medium':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'high':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'emergency':
      return 'text-red-800 bg-red-100 border-red-300 emergency-glow';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function formatTimestamp(timestamp: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(timestamp);
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
