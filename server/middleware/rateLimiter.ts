import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

// Simple in-memory rate limiter (for production, use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = config.RATE_LIMIT_MAX;

  // Clean up old entries
  if (now % 60000 < 1000) { // Clean every minute
    for (const [ip, data] of requestCounts.entries()) {
      if (now > data.resetTime) {
        requestCounts.delete(ip);
      }
    }
  }

  // Get or create request data
  let requestData = requestCounts.get(clientIP);
  if (!requestData || now > requestData.resetTime) {
    requestData = { count: 0, resetTime: now + windowMs };
    requestCounts.set(clientIP, requestData);
  }

  // Increment request count
  requestData.count++;

  // Set headers
  res.set({
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': Math.max(0, maxRequests - requestData.count).toString(),
    'X-RateLimit-Reset': new Date(requestData.resetTime).toISOString(),
  });

  // Check if rate limit exceeded
  if (requestData.count > maxRequests) {
    return res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((requestData.resetTime - now) / 1000),
      },
    });
  }

  next();
}; 