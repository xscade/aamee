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
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    await connectDB();
    const user = await User.findById(payload.userId).select('-password');
    
    if (!user || !user.isActive) {
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
