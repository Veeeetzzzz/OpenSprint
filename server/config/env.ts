import { z } from 'zod';

// Configuration schema with validation
const configSchema = z.object({
  // Database
  DATABASE_PROVIDER: z.enum(['sqlite', 'postgresql']).default('sqlite'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  
  // Server
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  
  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  AUTH_MODE: z.enum(['simple', 'oidc', 'saml', 'disabled']).default('simple'),
  
  // Demo Mode (for hosted demos)
  DEMO_MODE: z.coerce.boolean().default(false),
  DEMO_USERNAME: z.string().default('demo'),
  DEMO_PASSWORD: z.string().default('demo'),
  DEMO_USER_NAME: z.string().default('Demo User'),
  DEMO_USER_EMAIL: z.string().default('demo@opensprint.io'),
  
  // OIDC (optional)
  OIDC_ISSUER: z.string().optional(),
  OIDC_CLIENT_ID: z.string().optional(),
  OIDC_CLIENT_SECRET: z.string().optional(),
  
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

// Load and validate configuration
const loadConfig = () => {
  try {
    const config = configSchema.parse(process.env);
    
    // Additional validation for enterprise features
    if (config.AUTH_MODE === 'oidc') {
      if (!config.OIDC_ISSUER || !config.OIDC_CLIENT_ID || !config.OIDC_CLIENT_SECRET) {
        throw new Error('OIDC configuration incomplete. Missing OIDC_ISSUER, OIDC_CLIENT_ID, or OIDC_CLIENT_SECRET');
      }
    }
    
    return config;
  } catch (error) {
    console.error('❌ Configuration validation failed:', error);
    process.exit(1);
  }
};

export const config = loadConfig();

// Helper functions
export const isProduction = () => config.NODE_ENV === 'production';
export const isDevelopment = () => config.NODE_ENV === 'development';
export const isDemoMode = () => config.DEMO_MODE;
export const isFeatureEnabled = (feature: keyof Pick<typeof config, 'FEATURE_AUDIT_LOG' | 'FEATURE_WEBHOOKS' | 'FEATURE_CUSTOM_WORKFLOWS'>) => {
  return config[feature];
}; 