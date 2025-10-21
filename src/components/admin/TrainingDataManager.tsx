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
  Brain,
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrainingData {
  id: string;
  title: string;
  category: 'legal' | 'medical' | 'shelter' | 'psychological' | 'emergency' | 'general';
  userMessage: string;
  expectedResponse: string;
  severity: 'low' | 'medium' | 'high' | 'emergency';
  keywords: string[];
  context: string;
  language: 'en' | 'hi';
  isApproved: boolean;
  usageCount: number;
}

interface TrainingDataManagerProps {}

export default function TrainingDataManager({}: TrainingDataManagerProps) {
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [isAddingData, setIsAddingData] = useState(false);
  const [editingData, setEditingData] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterApproved, setFilterApproved] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [newData, setNewData] = useState<Partial<TrainingData>>({
    title: '',
    category: 'general',
    userMessage: '',
    expectedResponse: '',
    severity: 'low',
    keywords: [],
    context: '',
    language: 'en',
    isApproved: false
  });

  // Fetch training data from API
  useEffect(() => {
    fetchTrainingData();
  }, []);

  const fetchTrainingData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/training');
      const data = await response.json();
      
      if (data.success) {
        const formattedData: TrainingData[] = data.data.map((item: any) => ({
          id: item._id,
          title: item.title,
          category: item.category,
          userMessage: item.userMessage,
          expectedResponse: item.expectedResponse,
          severity: item.severity,
          keywords: item.keywords || [],
          context: item.context || '',
          language: item.language,
          isApproved: item.isApproved,
          usageCount: item.usageCount || 0
        }));
        setTrainingData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching training data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddData = async () => {
    if (!newData.title || !newData.userMessage || !newData.expectedResponse) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/admin/training', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newData.title,
          category: newData.category,
          userMessage: newData.userMessage,
          expectedResponse: newData.expectedResponse,
          severity: newData.severity,
          keywords: newData.keywords || [],
          context: newData.context || '',
          language: newData.language,
          isApproved: newData.isApproved || false
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchTrainingData(); // Refresh the training data list
        setNewData({
          title: '',
          category: 'general',
          userMessage: '',
          expectedResponse: '',
          severity: 'low',
          keywords: [],
          context: '',
          language: 'en',
          isApproved: false
        });
        setIsAddingData(false);
      } else {
        alert('Failed to create training data: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating training data:', error);
      alert('Failed to create training data. Please try again.');
    }
  };

  const handleEditData = (id: string) => {
    setEditingData(id);
  };

  const handleSaveData = (id: string, updatedData: Partial<TrainingData>) => {
    setTrainingData(prev => prev.map(data => 
      data.id === id ? { ...data, ...updatedData } : data
    ));
    setEditingData(null);
  };

  const handleDeleteData = (id: string) => {
    if (confirm('Are you sure you want to delete this training data?')) {
      setTrainingData(prev => prev.filter(data => data.id !== id));
    }
  };

  const handleApproveData = (id: string) => {
    setTrainingData(prev => prev.map(data => 
      data.id === id ? { ...data, isApproved: !data.isApproved } : data
    ));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      case 'legal': return <Shield className="w-4 h-4" />;
      case 'medical': return <AlertTriangle className="w-4 h-4" />;
      case 'psychological': return <MessageSquare className="w-4 h-4" />;
      case 'shelter': return <Shield className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'legal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medical': return 'bg-green-100 text-green-800 border-green-200';
      case 'psychological': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shelter': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const filteredData = trainingData.filter(data => {
    const categoryMatch = filterCategory === 'all' || data.category === filterCategory;
    const approvedMatch = filterApproved === 'all' || 
      (filterApproved === 'approved' && data.isApproved) ||
      (filterApproved === 'pending' && !data.isApproved);
    return categoryMatch && approvedMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Training Data Management</h2>
          <p className="text-gray-600">Manage and improve AI training data for better responses</p>
        </div>
        <Button 
          onClick={() => setIsAddingData(true)}
          className="flex items-center gap-2"
          style={{ backgroundColor: '#DD4B4F' }}
        >
          <Plus className="w-4 h-4" />
          Add Training Data
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200"
            >
              <option value="all">All Categories</option>
              <option value="emergency">Emergency</option>
              <option value="legal">Legal</option>
              <option value="medical">Medical</option>
              <option value="psychological">Psychological</option>
              <option value="shelter">Shelter</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterApproved}
              onChange={(e) => setFilterApproved(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200"
            >
              <option value="all">All</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Add New Training Data Form */}
      {isAddingData && (
        <Card className="p-6 border-2 border-dashed border-gray-300">
          <h3 className="text-lg font-semibold mb-4">Add New Training Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <Input
                value={newData.title}
                onChange={(e) => setNewData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Emergency Help Request"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={newData.category}
                onChange={(e) => setNewData(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value="general">General</option>
                <option value="emergency">Emergency</option>
                <option value="legal">Legal</option>
                <option value="medical">Medical</option>
                <option value="psychological">Psychological</option>
                <option value="shelter">Shelter</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
              <select
                value={newData.severity}
                onChange={(e) => setNewData(prev => ({ ...prev, severity: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={newData.language}
                onChange={(e) => setNewData(prev => ({ ...prev, language: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">User Message</label>
              <textarea
                value={newData.userMessage}
                onChange={(e) => setNewData(prev => ({ ...prev, userMessage: e.target.value }))}
                placeholder="Example user input that should trigger this response"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 min-h-[80px]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Expected AI Response</label>
              <textarea
                value={newData.expectedResponse}
                onChange={(e) => setNewData(prev => ({ ...prev, expectedResponse: e.target.value }))}
                placeholder="The ideal response the AI should give"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 min-h-[120px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Keywords (comma-separated)</label>
              <Input
                value={newData.keywords?.join(', ') || ''}
                onChange={(e) => setNewData(prev => ({ 
                  ...prev, 
                  keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) 
                }))}
                placeholder="keyword1, keyword2, keyword3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Context</label>
              <Input
                value={newData.context}
                onChange={(e) => setNewData(prev => ({ ...prev, context: e.target.value }))}
                placeholder="Additional context for this training data"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-6">
            <Button onClick={handleAddData} style={{ backgroundColor: '#DD4B4F' }}>
              <Save className="w-4 h-4 mr-2" />
              Save Training Data
            </Button>
            <Button variant="outline" onClick={() => setIsAddingData(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Training Data List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          filteredData.map((data) => (
          <Card key={data.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getCategoryIcon(data.category)}
                  <h3 className="text-lg font-semibold text-gray-900">{data.title}</h3>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium border",
                    getCategoryColor(data.category)
                  )}>
                    {data.category}
                  </span>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium border",
                    getSeverityColor(data.severity)
                  )}>
                    {data.severity}
                  </span>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    data.isApproved 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  )}>
                    {data.isApproved ? 'Approved' : 'Pending'}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {data.usageCount} uses
                  </span>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">User Message:</span>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">"{data.userMessage}"</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Expected Response:</span>
                    <p className="text-gray-600 bg-blue-50 p-3 rounded-lg">"{data.expectedResponse}"</p>
                  </div>
                  {data.keywords.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">Keywords:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {data.keywords.map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.context && (
                    <div>
                      <span className="font-medium text-gray-700">Context:</span>
                      <p className="text-gray-600">{data.context}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleApproveData(data.id)}
                  className={data.isApproved ? 'text-green-600 hover:bg-green-50' : 'text-yellow-600 hover:bg-yellow-50'}
                >
                  {data.isApproved ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditData(data.id)}
                  className="text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteData(data.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
          ))
        )}
      </div>

      {filteredData.length === 0 && (
        <Card className="p-12 text-center">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Training Data Found</h3>
          <p className="text-gray-600 mb-4">Start by adding training data to improve AI responses.</p>
          <Button 
            onClick={() => setIsAddingData(true)}
            style={{ backgroundColor: '#DD4B4F' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Training Data
          </Button>
        </Card>
      )}
    </div>
  );
}
