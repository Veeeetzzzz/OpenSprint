import { z } from 'zod';
import { fatalStartup } from '../utils/fatal.js';

// Configuration schema with validation
const configSchema = z.object({
  // Database
  DATABASE_PROVIDER: z.enum(['sqlite']).default('sqlite'),
  DATABASE_URL: z.string().default('file:./dev.db'),

  // Server
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),

  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  AUTH_MODE: z.enum(['simple']).default('simple'),

  // Demo Mode (for hosted demos)
  DEMO_MODE: z.coerce.boolean().default(false),
  DEMO_USERNAME: z.string().default('demo'),
  DEMO_PASSWORD: z.string().default('demo'),
  DEMO_USER_NAME: z.string().default('Demo User'),
  DEMO_USER_EMAIL: z.string().default('demo@opensprint.io'),

  // Feature flags
  FEATURE_AUDIT_LOG: z.coerce.boolean().default(false),
  FEATURE_WEBHOOKS: z.coerce.boolean().default(false),
  FEATURE_CUSTOM_WORKFLOWS: z.coerce.boolean().default(false),

  // File uploads
  UPLOAD_MAX_SIZE: z.coerce.number().default(10485760), // 10MB
  UPLOAD_ALLOWED_TYPES: z.string().default('jpg,jpeg,png,gif,pdf,doc,docx'),

  // Rate limiting
  RATE_LIMIT_MAX: z.coerce.number().default(1000),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});
type AppConfig = z.infer<typeof configSchema>;
type FeatureFlagKey = 'FEATURE_AUDIT_LOG' | 'FEATURE_WEBHOOKS' | 'FEATURE_CUSTOM_WORKFLOWS';

// Load and validate configuration
const loadConfig = (): AppConfig => {
  try {
    const config = configSchema.parse(process.env);

    return config;
  } catch (error) {
    return fatalStartup('Configuration validation failed', error);
  }
};

export const config = loadConfig();

// Helper functions
export const isProduction = () => config.NODE_ENV === 'production';
export const isDevelopment = () => config.NODE_ENV === 'development';
export const isDemoMode = () => config.DEMO_MODE;
export const isFeatureEnabled = (feature: FeatureFlagKey) => {
  return config[feature];
};
