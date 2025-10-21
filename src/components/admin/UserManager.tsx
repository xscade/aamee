'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { 
  Plus, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Shield,
  Users,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface UserManagerProps {}

export default function UserManager({}: UserManagerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    role: 'viewer' as 'admin' | 'manager' | 'viewer'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        await fetchUsers();
        setNewUser({ email: '', password: '', role: 'viewer' });
        setIsAddingUser(false);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create user');
      }
    } catch (error) {
      alert('Error creating user');
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (response.ok) {
        await fetchUsers();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update user');
      }
    } catch (error) {
      alert('Error updating user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchUsers();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (error) {
      alert('Error deleting user');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'manager':
        return <Users className="h-4 w-4 text-blue-600" />;
      default:
        return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <Button
          onClick={() => setIsAddingUser(true)}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {isAddingUser && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Create New User</h3>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                placeholder="user@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as 'admin' | 'manager' | 'viewer' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <option value="viewer">Viewer (Read-only access)</option>
                <option value="manager">Manager (Manage rules and training)</option>
                <option value="admin">Admin (Full access)</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                Create User
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddingUser(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getRoleIcon(user.role)}
                  <span className="font-medium text-gray-900">{user.email}</span>
                </div>
                <span className={cn('px-2 py-1 text-xs font-medium rounded-full', getRoleColor(user.role))}>
                  {user.role}
                </span>
                <span className={cn('px-2 py-1 text-xs font-medium rounded-full', 
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                )}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                >
                  {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="mt-2 text-sm text-gray-500">
              Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
              <span className="mx-2">•</span>
              Created: {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
