'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Shield, Heart, Users, Phone, MessageCircle, Globe } from 'lucide-react';
import { useTranslation } from '@/lib/translations';

interface WelcomeScreenProps {
  onStartChat: () => void;
}

export default function WelcomeScreen({ onStartChat }: WelcomeScreenProps) {
  const [showMore, setShowMore] = useState(false);
  const [language, setLanguage] = useState('en');
  // const t = useTranslation(language); // Unused

  return (
    <div className="min-h-screen bg-fog flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cta rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">AME</h1>
              <p className="text-gray-600">Supporting survivors of domestic violence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-600" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm text-gray-600 bg-transparent border-none outline-none"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-cta rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-black mb-4">
              You Are Not Alone
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              AME provides confidential, 24/7 AI-powered support to help domestic violence survivors 
              access resources, get guidance, and find the help they need.
            </p>
            <Button
              onClick={onStartChat}
              size="lg"
              className="bg-cta hover:bg-cta/90 text-white px-8 py-4 text-lg rounded-2xl"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Start Confidential Chat
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Completely Anonymous</h3>
              <p className="text-gray-600 text-sm">
                No registration required. Your privacy and safety are our top priority.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Expert Resources</h3>
              <p className="text-gray-600 text-sm">
                Connect with verified legal, medical, and counseling services.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">24/7 Emergency Support</h3>
              <p className="text-gray-600 text-sm">
                Immediate access to emergency helplines and crisis resources.
              </p>
            </Card>
          </div>

          {/* Emergency Resources */}
          <Card className="p-6 bg-red-50 border-red-200">
            <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Emergency Resources
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <a href="tel:100" className="block p-3 bg-white rounded-lg hover:bg-red-50 transition-colors">
                  <div className="font-medium">Police Emergency</div>
                  <div className="text-2xl font-bold text-red-600">100</div>
                </a>
                <a href="tel:181" className="block p-3 bg-white rounded-lg hover:bg-red-50 transition-colors">
                  <div className="font-medium">Women Helpline</div>
                  <div className="text-2xl font-bold text-red-600">181</div>
                </a>
              </div>
              <div className="space-y-2">
                <a href="tel:108" className="block p-3 bg-white rounded-lg hover:bg-red-50 transition-colors">
                  <div className="font-medium">Medical Emergency</div>
                  <div className="text-2xl font-bold text-red-600">108</div>
                </a>
                <a href="tel:1091" className="block p-3 bg-white rounded-lg hover:bg-red-50 transition-colors">
                  <div className="font-medium">Domestic Violence</div>
                  <div className="text-2xl font-bold text-red-600">1091</div>
                </a>
              </div>
            </div>
          </Card>

          {/* Learn More */}
          {!showMore && (
            <div className="text-center mt-8">
              <Button
                variant="ghost"
                onClick={() => setShowMore(true)}
                className="text-cta hover:text-cta/80"
              >
                Learn More About AME
              </Button>
            </div>
          )}

          {showMore && (
            <Card className="p-6 mt-8">
              <h3 className="text-xl font-semibold mb-4">About AME</h3>
              <div className="prose prose-gray max-w-none">
                <p className="mb-4">
                  AME is a non-profit organization dedicated to addressing and preventing domestic violence. 
                  Our mission is to bridge the gaps in awareness, support, and resources to empower victims 
                  of domestic violence and help them rebuild their lives.
                </p>
                <p className="mb-4">
                  We believe that every individual has the right to feel safe, respected, and supported—whether 
                  at home, in their community, or in society at large.
                </p>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="font-semibold mb-2">What We Do:</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Service linkages to healthcare and legal aid</li>
                      <li>• Awareness workshops and campaigns</li>
                      <li>• Care packages and immediate support</li>
                      <li>• AI-powered confidential chatbox</li>
                      <li>• Vocational training and employment support</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Our Approach:</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• Immediate support access</li>
                      <li>• Prevention through education</li>
                      <li>• Short-term practical help</li>
                      <li>• Ongoing support & autonomy</li>
                      <li>• Long-term empowerment</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-6">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-600">
          <p>AME - Empowering survivors, creating safe spaces, building hope.</p>
          <p className="mt-2">All conversations are confidential and secure.</p>
        </div>
      </div>
    </div>
  );
}
