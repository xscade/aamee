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
  Settings,
  AlertTriangle,
  Shield,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: string;
  priority: number;
  isActive: boolean;
  category: 'emergency' | 'legal' | 'medical' | 'psychological' | 'general';
}

interface AIRulesManagerProps {}

export default function AIRulesManager({}: AIRulesManagerProps) {
  const [rules, setRules] = useState<AIRule[]>([]);
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newRule, setNewRule] = useState<Partial<AIRule>>({
    name: '',
    description: '',
    condition: '',
    action: '',
    priority: 0,
    isActive: true,
    category: 'general'
  });

  // Fetch rules from API
  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/config?type=rules');
      const data = await response.json();
      
      if (data.success) {
        const formattedRules: AIRule[] = data.data.map((config: any) => ({
          id: config._id,
          name: config.name,
          description: config.description || '',
          condition: config.content.condition || '',
          action: config.content.action || '',
          priority: config.priority || 0,
          isActive: config.isActive,
          category: config.content.category || 'general'
        }));
        setRules(formattedRules);
      }
    } catch (error) {
      console.error('Error fetching rules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRule = async () => {
    if (!newRule.name || !newRule.description || !newRule.condition || !newRule.action) {
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
          configType: 'rules',
          name: newRule.name,
          description: newRule.description,
          content: {
            condition: newRule.condition,
            action: newRule.action,
            category: newRule.category
          },
          priority: newRule.priority || 0,
          tags: [newRule.category || 'general']
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchRules(); // Refresh the rules list
        setNewRule({
          name: '',
          description: '',
          condition: '',
          action: '',
          priority: 0,
          isActive: true,
          category: 'general'
        });
        setIsAddingRule(false);
      } else {
        alert('Failed to create rule: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating rule:', error);
      alert('Failed to create rule. Please try again.');
    }
  };

  const handleEditRule = (id: string) => {
    setEditingRule(id);
  };

  const handleSaveRule = (id: string, updatedRule: Partial<AIRule>) => {
    setRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, ...updatedRule } : rule
    ).sort((a, b) => b.priority - a.priority));
    setEditingRule(null);
  };

  const handleDeleteRule = (id: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      setRules(prev => prev.filter(rule => rule.id !== id));
    }
  };

  const toggleRuleStatus = (id: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      case 'legal': return <Shield className="w-4 h-4" />;
      case 'medical': return <AlertTriangle className="w-4 h-4" />;
      case 'psychological': return <MessageSquare className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'legal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medical': return 'bg-green-100 text-green-800 border-green-200';
      case 'psychological': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Rules Management</h2>
          <p className="text-gray-600">Configure how the AI chatbot should behave in different situations</p>
        </div>
        <Button 
          onClick={() => setIsAddingRule(true)}
          className="flex items-center gap-2"
          style={{ backgroundColor: '#DD4B4F' }}
        >
          <Plus className="w-4 h-4" />
          Add New Rule
        </Button>
      </div>

      {/* Add New Rule Form */}
      {isAddingRule && (
        <Card className="p-6 border-2 border-dashed border-gray-300">
          <h3 className="text-lg font-semibold mb-4">Add New AI Rule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rule Name</label>
              <Input
                value={newRule.name}
                onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Emergency Response"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={newRule.category}
                onChange={(e) => setNewRule(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value="general">General</option>
                <option value="emergency">Emergency</option>
                <option value="legal">Legal</option>
                <option value="medical">Medical</option>
                <option value="psychological">Psychological</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <Input
                value={newRule.description}
                onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of what this rule does"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trigger Condition</label>
              <Input
                value={newRule.condition}
                onChange={(e) => setNewRule(prev => ({ ...prev, condition: e.target.value }))}
                placeholder="e.g., Keywords: emergency, help, danger"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <Input
                type="number"
                value={newRule.priority}
                onChange={(e) => setNewRule(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                placeholder="0-10"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Action to Take</label>
              <textarea
                value={newRule.action}
                onChange={(e) => setNewRule(prev => ({ ...prev, action: e.target.value }))}
                placeholder="Describe what the AI should do when this rule is triggered"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 min-h-[80px]"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-6">
            <Button onClick={handleAddRule} style={{ backgroundColor: '#DD4B4F' }}>
              <Save className="w-4 h-4 mr-2" />
              Save Rule
            </Button>
            <Button variant="outline" onClick={() => setIsAddingRule(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <Card key={rule.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getCategoryIcon(rule.category)}
                  <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium border",
                    getCategoryColor(rule.category)
                  )}>
                    {rule.category}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                    Priority: {rule.priority}
                  </span>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    rule.isActive 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  )}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{rule.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Trigger:</span>
                    <p className="text-gray-600">{rule.condition}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Action:</span>
                    <p className="text-gray-600">{rule.action}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleRuleStatus(rule.id)}
                  className={rule.isActive ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}
                >
                  {rule.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditRule(rule.id)}
                  className="text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteRule(rule.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {rules.length === 0 && (
        <Card className="p-12 text-center">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Rules Configured</h3>
          <p className="text-gray-600 mb-4">Start by adding your first AI behavior rule.</p>
          <Button 
            onClick={() => setIsAddingRule(true)}
            style={{ backgroundColor: '#DD4B4F' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Rule
          </Button>
        </Card>
      )}
    </div>
  );
}
