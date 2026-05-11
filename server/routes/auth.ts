import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config, isDemoMode } from '../config/env.js';
import { authenticate } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { prisma } from '../db/prisma.js';
import { getAuthenticatedUser } from './requestContext.js';

const router = express.Router();
// User login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError('Email and password are required', 400);
    }

    // Handle demo login when demo mode is enabled
    if (isDemoMode()) {
      const demoUsername = config.DEMO_USERNAME;
      const demoPassword = config.DEMO_PASSWORD;

      if ((email === demoUsername || email === config.DEMO_USER_EMAIL) && password === demoPassword) {
        // Generate JWT for demo user
        const demoUser = {
          id: 'demo-user-id',
          email: config.DEMO_USER_EMAIL,
          name: config.DEMO_USER_NAME,
          avatarUrl: null,
        };

        const token = jwt.sign(
          { userId: demoUser.id, email: demoUser.email },
          config.JWT_SECRET,
          { expiresIn: '7d' }
        );

        return res.json({
          success: true,
          data: {
            user: demoUser,
            token,
          },
        });
      }
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        avatarUrl: true,
        isActive: true,
      }
    });

    if (!user) {
      throw createError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw createError('Account is disabled', 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createError('Invalid email or password', 401);
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      throw createError('Email, password, and name are required', 400);
    }

    // Validate password strength
    if (password.length < 8) {
      throw createError('Password must be at least 8 characters long', 400);
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw createError('User already exists', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        isActive: true,
      }
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// User logout (client-side token removal, but we can add server-side blacklisting later)
router.post('/logout', async (req, res, next) => {
  try {
    // In a more advanced implementation, you'd blacklist the token
    // For now, we rely on client-side token removal
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req);

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

// Public configuration endpoint (no auth required)
router.get('/config', async (req, res, next) => {
  try {
    const publicConfig = {
      demoMode: isDemoMode(),
      demoCredentials: isDemoMode() ? {
        username: config.DEMO_USERNAME,
        password: config.DEMO_PASSWORD,
        email: config.DEMO_USER_EMAIL,
      } : null,
    };

    res.json({
      success: true,
      data: publicConfig,
    });
  } catch (error) {
    next(error);
  }
});

export { router as authRoutes };
