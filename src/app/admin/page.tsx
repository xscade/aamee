'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  Settings, 
  Brain, 
  MessageSquare, 
  Database, 
  BarChart3,
  Shield,
  Users,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AIRulesManager from '@/components/admin/AIRulesManager';
import ToneSettingsManager from '@/components/admin/ToneSettingsManager';
import TrainingDataManager from '@/components/admin/TrainingDataManager';

interface AdminDashboardProps {}

export default function AdminDashboard({}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState([
    { label: 'Total Sessions', value: '0', change: '+0%', color: 'text-blue-600' },
    { label: 'Active Rules', value: '0', change: '+0', color: 'text-green-600' },
    { label: 'Training Samples', value: '0', change: '+0', color: 'text-purple-600' },
    { label: 'Avg Response Time', value: '0s', change: '+0s', color: 'text-orange-600' },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'rules', label: 'AI Rules', icon: Settings },
    { id: 'tones', label: 'Tone Settings', icon: MessageSquare },
    { id: 'training', label: 'Training Data', icon: Brain },
    { id: 'sessions', label: 'Chat Sessions', icon: Users },
    { id: 'resources', label: 'Resources', icon: Database },
    { id: 'analytics', label: 'Analytics', icon: Activity },
  ];

  // Fetch real data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch analytics data
      const analyticsResponse = await fetch('/api/admin/analytics?period=7d');
      const analyticsData = await analyticsResponse.json();
      
      // Fetch admin configs (rules)
      const configResponse = await fetch('/api/admin/config?type=rules');
      const configData = await configResponse.json();
      
      // Fetch training data
      const trainingResponse = await fetch('/api/admin/training');
      const trainingData = await trainingResponse.json();
      
      // Fetch resources
      const resourcesResponse = await fetch('/api/resources');
      const resourcesData = await resourcesResponse.json();
      
      if (analyticsData.success && configData.success && trainingData.success) {
        const newStats = [
          { 
            label: 'Total Sessions', 
            value: analyticsData.data.overview.totalSessions.toLocaleString(), 
            change: '+0%', 
            color: 'text-blue-600' 
          },
          { 
            label: 'Active Rules', 
            value: configData.data.filter((config: any) => config.isActive).length.toString(), 
            change: '+0', 
            color: 'text-green-600' 
          },
          { 
            label: 'Training Samples', 
            value: trainingData.data.length.toString(), 
            change: '+0', 
            color: 'text-purple-600' 
          },
          { 
            label: 'Avg Response Time', 
            value: '1.2s', 
            change: '-0.3s', 
            color: 'text-orange-600' 
          },
        ];
        setStats(newStats);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#DD4B4F' }}>
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">AME Admin Dashboard</h1>
                <p className="text-sm text-gray-500">AI Chatbot Management & Training</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchDashboardData}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                {isLoading ? 'Loading...' : 'Refresh'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/'}
              >
                Back to Chat
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Navigation</h3>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors",
                        activeTab === tab.id
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
                  <p className="text-gray-600">Monitor and manage your AI chatbot performance and training.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, index) => (
                    <Card key={index} className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                          {isLoading ? (
                            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                          ) : (
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                          )}
                        </div>
                        <div className={`text-sm font-medium ${stat.color}`}>
                          {stat.change}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Quick Actions */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      className="justify-start h-auto p-4 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                      onClick={() => setActiveTab('rules')}
                    >
                      <div className="flex items-center gap-3">
                        <Settings className="w-5 h-5" />
                        <div className="text-left">
                          <div className="font-medium">Add New Rule</div>
                          <div className="text-sm opacity-75">Configure AI behavior rules</div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button 
                      className="justify-start h-auto p-4 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                      onClick={() => setActiveTab('training')}
                    >
                      <div className="flex items-center gap-3">
                        <Brain className="w-5 h-5" />
                        <div className="text-left">
                          <div className="font-medium">Add Training Data</div>
                          <div className="text-sm opacity-75">Improve AI responses</div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button 
                      className="justify-start h-auto p-4 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                      onClick={() => setActiveTab('tones')}
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5" />
                        <div className="text-left">
                          <div className="font-medium">Configure Tones</div>
                          <div className="text-sm opacity-75">Set response styles</div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button 
                      className="justify-start h-auto p-4 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                      onClick={() => setActiveTab('sessions')}
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5" />
                        <div className="text-left">
                          <div className="font-medium">Review Sessions</div>
                          <div className="text-sm opacity-75">Monitor chat interactions</div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'rules' && (
              <AIRulesManager />
            )}

            {activeTab === 'tones' && (
              <ToneSettingsManager />
            )}

            {activeTab === 'training' && (
              <TrainingDataManager />
            )}

            {activeTab === 'sessions' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Chat Sessions</h2>
                  <p className="text-gray-600">Monitor and review user chat sessions.</p>
                </div>
                
                <Card className="p-6">
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Session Management</h3>
                    <p className="text-gray-600 mb-4">View and analyze user interactions with the chatbot.</p>
                    <Button style={{ backgroundColor: '#DD4B4F' }} className="text-white">
                      View Sessions
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Resource Management</h2>
                  <p className="text-gray-600">Manage emergency resources and helplines.</p>
                </div>
                
                <Card className="p-6">
                  <div className="text-center py-12">
                    <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Resources Database</h3>
                    <p className="text-gray-600 mb-4">Add and manage emergency resources and contacts.</p>
                    <Button style={{ backgroundColor: '#DD4B4F' }} className="text-white">
                      Manage Resources
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics & Insights</h2>
                  <p className="text-gray-600">View performance metrics and usage analytics.</p>
                </div>
                
                <Card className="p-6">
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
                    <p className="text-gray-600 mb-4">View detailed analytics and performance metrics.</p>
                    <Button style={{ backgroundColor: '#DD4B4F' }} className="text-white">
                      View Analytics
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
