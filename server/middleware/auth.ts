import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config, isDemoMode } from '../config/env';
import { createError } from './errorHandler';

const prisma = new PrismaClient();

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        avatarUrl: string | null;
        isActive: boolean;
      };
    }
  }
}

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw createError('No token provided', 401);
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string; email: string };
    
    // Handle demo user when demo mode is enabled
    if (isDemoMode() && decoded.userId === 'demo-user-id') {
      req.user = {
        id: 'demo-user-id',
        email: config.DEMO_USER_EMAIL,
        name: config.DEMO_USER_NAME,
        avatarUrl: null,
        isActive: true,
      };
      return next();
    }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        isActive: true,
      }
    });

    if (!user || !user.isActive) {
      throw createError('User not found or inactive', 401);
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
    };

    next();
  } catch (error) {
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      next(createError('Invalid token', 401));
    } else {
      next(error);
    }
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string; email: string };
    
    // Handle demo user when demo mode is enabled
    if (isDemoMode() && decoded.userId === 'demo-user-id') {
      req.user = {
        id: 'demo-user-id',
        email: config.DEMO_USER_EMAIL,
        name: config.DEMO_USER_NAME,
        avatarUrl: null,
        isActive: true,
      };
      return next();
    }
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        isActive: true,
      }
    });

    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
      };
    }

    next();
  } catch (error) {
    // Ignore token errors in optional auth
    next();
  }
}; 