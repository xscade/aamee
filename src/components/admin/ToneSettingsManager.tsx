'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  MessageSquare,
  Heart,
  Shield,
  AlertTriangle,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToneSetting {
  id: string;
  name: string;
  description: string;
  tone: string;
  context: string;
  examples: string[];
  isActive: boolean;
  severity: 'low' | 'medium' | 'high' | 'emergency';
}

interface ToneSettingsManagerProps {}

export default function ToneSettingsManager({}: ToneSettingsManagerProps) {
  const [tones, setTones] = useState<ToneSetting[]>([]);
  const [isAddingTone, setIsAddingTone] = useState(false);
  const [editingTone, setEditingTone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newTone, setNewTone] = useState<Partial<ToneSetting>>({
    name: '',
    description: '',
    tone: '',
    context: '',
    examples: [],
    isActive: true,
    severity: 'low'
  });

  // Fetch tone settings from API
  useEffect(() => {
    fetchToneSettings();
  }, []);

  const fetchToneSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/config?type=tones');
      const data = await response.json();
      
      if (data.success) {
        const formattedTones: ToneSetting[] = data.data.map((config: any) => ({
          id: config._id,
          name: config.name,
          description: config.description || '',
          tone: config.content.tone || '',
          context: config.content.context || '',
          examples: config.content.examples || [],
          isActive: config.isActive,
          severity: config.content.severity || 'low'
        }));
        setTones(formattedTones);
      }
    } catch (error) {
      console.error('Error fetching tone settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTone = async () => {
    if (!newTone.name || !newTone.description || !newTone.tone || !newTone.context) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          configType: 'tones',
          name: newTone.name,
          description: newTone.description,
          content: {
            tone: newTone.tone,
            context: newTone.context,
            examples: newTone.examples || [],
            severity: newTone.severity
          },
          priority: 0,
          tags: ['tone', newTone.severity || 'low']
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchToneSettings(); // Refresh the tone settings list
        setNewTone({
          name: '',
          description: '',
          tone: '',
          context: '',
          examples: [],
          isActive: true,
          severity: 'low'
        });
        setIsAddingTone(false);
      } else {
        alert('Failed to create tone setting: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating tone setting:', error);
      alert('Failed to create tone setting. Please try again.');
    }
  };

  const handleEditTone = (id: string) => {
    setEditingTone(id);
  };

  const handleSaveTone = (id: string, updatedTone: Partial<ToneSetting>) => {
    setTones(prev => prev.map(tone => 
      tone.id === id ? { ...tone, ...updatedTone } : tone
    ));
    setEditingTone(null);
  };

  const handleDeleteTone = (id: string) => {
    if (confirm('Are you sure you want to delete this tone setting?')) {
      setTones(prev => prev.filter(tone => tone.id !== id));
    }
  };

  const toggleToneStatus = (id: string) => {
    setTones(prev => prev.map(tone => 
      tone.id === id ? { ...tone, isActive: !tone.isActive } : tone
    ));
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <Shield className="w-4 h-4" />;
      case 'medium': return <Heart className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tone Settings Management</h2>
          <p className="text-gray-600">Configure the tone and style of AI responses for different situations</p>
        </div>
        <Button 
          onClick={() => setIsAddingTone(true)}
          className="flex items-center gap-2"
          style={{ backgroundColor: '#DD4B4F' }}
        >
          <Plus className="w-4 h-4" />
          Add New Tone
        </Button>
      </div>

      {/* Add New Tone Form */}
      {isAddingTone && (
        <Card className="p-6 border-2 border-dashed border-gray-300">
          <h3 className="text-lg font-semibold mb-4">Add New Tone Setting</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tone Name</label>
              <Input
                value={newTone.name}
                onChange={(e) => setNewTone(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Empathetic Support"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity Level</label>
              <select
                value={newTone.severity}
                onChange={(e) => setNewTone(prev => ({ ...prev, severity: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <Input
                value={newTone.description}
                onChange={(e) => setNewTone(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this tone setting"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Context</label>
              <Input
                value={newTone.context}
                onChange={(e) => setNewTone(prev => ({ ...prev, context: e.target.value }))}
                placeholder="When should this tone be used?"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tone Description</label>
              <textarea
                value={newTone.tone}
                onChange={(e) => setNewTone(prev => ({ ...prev, tone: e.target.value }))}
                placeholder="Describe the specific tone, language style, and approach"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 min-h-[100px]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Example Responses (one per line)</label>
              <textarea
                value={newTone.examples?.join('\n') || ''}
                onChange={(e) => setNewTone(prev => ({ 
                  ...prev, 
                  examples: e.target.value.split('\n').filter(line => line.trim()) 
                }))}
                placeholder="Example responses using this tone..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 min-h-[100px]"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-6">
            <Button onClick={handleAddTone} style={{ backgroundColor: '#DD4B4F' }}>
              <Save className="w-4 h-4 mr-2" />
              Save Tone Setting
            </Button>
            <Button variant="outline" onClick={() => setIsAddingTone(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Tones List */}
      <div className="space-y-4">
        {tones.map((tone) => (
          <Card key={tone.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getSeverityIcon(tone.severity)}
                  <h3 className="text-lg font-semibold text-gray-900">{tone.name}</h3>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium border",
                    getSeverityColor(tone.severity)
                  )}>
                    {tone.severity}
                  </span>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    tone.isActive 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  )}>
                    {tone.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{tone.description}</p>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Context:</span>
                    <p className="text-gray-600">{tone.context}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Tone Description:</span>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{tone.tone}</p>
                  </div>
                  {tone.examples.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">Example Responses:</span>
                      <ul className="mt-2 space-y-1">
                        {tone.examples.map((example, index) => (
                          <li key={index} className="text-sm text-gray-600 bg-blue-50 p-2 rounded border-l-4 border-blue-200">
                            "{example}"
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleToneStatus(tone.id)}
                  className={tone.isActive ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}
                >
                  {tone.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditTone(tone.id)}
                  className="text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTone(tone.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {tones.length === 0 && (
        <Card className="p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Tone Settings Configured</h3>
          <p className="text-gray-600 mb-4">Start by adding your first tone setting for different response styles.</p>
          <Button 
            onClick={() => setIsAddingTone(true)}
            style={{ backgroundColor: '#DD4B4F' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Tone Setting
          </Button>
        </Card>
      )}
    </div>
  );
}
