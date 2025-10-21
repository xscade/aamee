import { NextRequest } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './jwt';
import connectDB from './mongodb';
import User from '@/models/User';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

export const authenticateUser = async (request: NextRequest): Promise<AuthenticatedUser | null> => {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      console.log('No token found in request');
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
      console.log('Invalid or expired token');
      return null;
    }

    await connectDB();
    const user = await User.findById(payload.userId).select('-password');
    
    if (!user || !user.isActive) {
      console.log('User not found or inactive:', payload.userId);
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};

export const requireAuth = (roles?: string[]) => {
  return async (request: NextRequest): Promise<AuthenticatedUser | null> => {
    const user = await authenticateUser(request);
    
    if (!user) {
      return null;
    }

    if (roles && !roles.includes(user.role)) {
      return null;
    }

    return user;
  };
};
