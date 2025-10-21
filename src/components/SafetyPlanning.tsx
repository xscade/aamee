'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield, Phone, MapPin, Users, Key, FileText, Download } from 'lucide-react';

interface SafetyPlanningProps {
  onClose: () => void;
}

export default function SafetyPlanning({ onClose }: SafetyPlanningProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const safetySteps = [
    {
      title: "Emergency Contacts",
      icon: <Phone className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Keep these emergency numbers easily accessible at all times:
          </p>
          <div className="grid gap-3">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="font-semibold text-red-800">Police Emergency</div>
              <div className="text-2xl font-bold text-red-600">100</div>
            </div>
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="font-semibold text-orange-800">Women Helpline</div>
              <div className="text-2xl font-bold text-orange-600">181</div>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="font-semibold text-green-800">Medical Emergency</div>
              <div className="text-2xl font-bold text-green-600">108</div>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="font-semibold text-purple-800">Domestic Violence</div>
              <div className="text-2xl font-bold text-purple-600">1091</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Safe Places",
      icon: <MapPin className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Identify safe places you can go to in an emergency:
          </p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span>Trusted friend's or family member's house</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span>Local women's shelter</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span>Public places with security (hospitals, police stations)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span>Religious centers or community centers</span>
            </li>
          </ul>
        </div>
      )
    },
    {
      title: "Support Network",
      icon: <Users className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Build a network of trusted people who can help:
          </p>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="font-semibold text-blue-800">Trusted Contacts</div>
              <div className="text-sm text-blue-600 mt-1">
                Family members, friends, neighbors who know your situation
              </div>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="font-semibold text-green-800">Professional Support</div>
              <div className="text-sm text-green-600 mt-1">
                Doctors, counselors, lawyers, social workers
              </div>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="font-semibold text-purple-800">Community Resources</div>
              <div className="text-sm text-purple-600 mt-1">
                Local NGOs, support groups, religious leaders
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Important Documents",
      icon: <FileText className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Keep copies of important documents in a safe, accessible place:
          </p>
          <div className="grid gap-2">
            {[
              'Identification documents (Aadhaar, PAN, Passport)',
              'Birth certificates (yours and children\'s)',
              'Marriage certificate',
              'Bank account details and statements',
              'Property documents',
              'Medical records',
              'School records (for children)',
              'Photos of evidence (injuries, property damage)'
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                <span className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm text-gray-600">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Emergency Kit",
      icon: <Key className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Prepare an emergency kit with essential items:
          </p>
          <div className="grid gap-2">
            {[
              'Extra set of house/car keys',
              'Cash and credit cards',
              'Essential medications',
              'Change of clothes',
              'Phone charger and power bank',
              'Important phone numbers (written down)',
              'Children\'s favorite toys/comfort items',
              'Basic toiletries'
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                <span className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm text-gray-600">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < safetySteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateSafetyPlan = () => {
    const plan = `
SAFETY PLAN - ${new Date().toLocaleDateString()}

${safetySteps.map((step, index) => `
${index + 1}. ${step.title}
${step.content.props.children[1] ? 
  (Array.isArray(step.content.props.children[1]) ? 
    step.content.props.children[1].map((item: any) => item.props.children).join('\n') :
    step.content.props.children[1].props.children
  ) : 
  step.content.props.children
}
`).join('\n')}

Remember: Your safety is the most important thing. Don't hesitate to call emergency services if you feel threatened.

Generated by AME AI Support System
    `;

    const blob = new Blob([plan], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'safety-plan.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-black flex items-center gap-2">
              <Shield className="w-6 h-6 text-cta" />
              Safety Planning Guide
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              ×
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center gap-2">
              {safetySteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= currentStep
                      ? 'bg-cta text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Step {currentStep + 1} of {safetySteps.length}: {safetySteps[currentStep].title}
            </div>
          </div>

          {/* Current Step Content */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-cta rounded-full flex items-center justify-center text-white">
                {safetySteps[currentStep].icon}
              </div>
              <h3 className="text-xl font-semibold text-black">
                {safetySteps[currentStep].title}
              </h3>
            </div>
            <div className="text-gray-700">
              {safetySteps[currentStep].content}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={generateSafetyPlan}
                className="text-cta hover:text-cta/80"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Plan
              </Button>

              {currentStep < safetySteps.length - 1 ? (
                <Button onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button onClick={onClose}>
                  Complete
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
