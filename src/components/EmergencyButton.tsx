'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Phone, Shield, AlertTriangle } from 'lucide-react';

interface EmergencyButtonProps {
  onEmergencyClick: () => void;
  isVisible: boolean;
}

export default function EmergencyButton({ onEmergencyClick, isVisible }: EmergencyButtonProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={onEmergencyClick}
        variant="emergency"
        size="lg"
        className="emergency-glow rounded-full shadow-2xl"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
          <span className="font-semibold">Emergency Help</span>
        </div>
      </Button>
      
      {/* Emergency resources popup */}
      <div className="absolute bottom-full right-0 mb-4 p-4 bg-white rounded-lg shadow-lg border border-red-200 min-w-[300px]">
        <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Emergency Resources
        </h3>
        
        <div className="space-y-2">
          <a
            href="tel:100"
            className="flex items-center gap-2 p-2 bg-red-50 rounded hover:bg-red-100 transition-colors"
          >
            <Phone className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium">Police: 100</span>
          </a>
          
          <a
            href="tel:181"
            className="flex items-center gap-2 p-2 bg-orange-50 rounded hover:bg-orange-100 transition-colors"
          >
            <Phone className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium">Women Helpline: 181</span>
          </a>
          
          <a
            href="tel:108"
            className="flex items-center gap-2 p-2 bg-green-50 rounded hover:bg-green-100 transition-colors"
          >
            <Phone className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">Medical Emergency: 108</span>
          </a>
          
          <a
            href="tel:1091"
            className="flex items-center gap-2 p-2 bg-purple-50 rounded hover:bg-purple-100 transition-colors"
          >
            <Phone className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium">Domestic Violence: 1091</span>
          </a>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            These numbers are available 24/7 for immediate assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
