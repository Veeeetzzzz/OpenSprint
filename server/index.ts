import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/env';
import { authRoutes } from './routes/auth';
import { issueRoutes } from './routes/issues';
import { projectRoutes } from './routes/projects';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { prisma } from './db/prisma';
import { fatalStartup } from './utils/fatal';
import { connectWithRetry, disconnectSafely } from './startup';

// Initialize Express app
const app = express();
// Middleware
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting (enterprise feature)
if (config.NODE_ENV === 'production') {
  app.use(rateLimiter);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    features: {
      auth: config.AUTH_MODE,
      audit: config.FEATURE_AUDIT_LOG,
      webhooks: config.FEATURE_WEBHOOKS
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/projects', projectRoutes);

// Serve client in production
if (config.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '..');
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error handling
app.use(errorHandler);

// Start server
const PORT = config.PORT || 3001;
const DB_CONNECT_MAX_RETRIES = 3;
const DB_CONNECT_RETRY_DELAY_MS = 1000;
let serverInstance: ReturnType<typeof app.listen> | null = null;
let isShuttingDown = false;

async function startServer() {
  try {
    await connectWithRetry(() => prisma.$connect(), {
      maxRetries: DB_CONNECT_MAX_RETRIES,
      baseDelayMs: DB_CONNECT_RETRY_DELAY_MS,
    });
    console.log('✅ Database connected');

    // Start server
    serverInstance = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${config.NODE_ENV}`);
      console.log(`🔒 Auth mode: ${config.AUTH_MODE}`);
      console.log(`💾 Database: ${config.DATABASE_PROVIDER}`);
    });
  } catch (error) {
    fatalStartup('Failed to start server', error, { port: PORT });
  }
}

// Graceful shutdown
const shutdownGracefully = async (signal: 'SIGINT' | 'SIGTERM') => {
  if (isShuttingDown) {
    return;
  }
  isShuttingDown = true;
  console.log(`🛑 Received ${signal}, shutting down gracefully...`);

  try {
    if (serverInstance) {
      await new Promise<void>((resolve, reject) => {
        serverInstance?.close((error?: Error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
    }
  } catch (error) {
    console.error('Failed to close HTTP server cleanly', error);
  }

  try {
    await disconnectSafely(() => prisma.$disconnect());
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', () => {
  void shutdownGracefully('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdownGracefully('SIGTERM');
});

startServer();

export { app, prisma }; 