// Environment-aware API configuration
const getApiBaseUrl = (): string => {
  // In development, use localhost
  if (import.meta.env.MODE === 'development') {
    return 'http://localhost:3001/api';
  }
  
  // In production, use relative path (works for same-origin deployments)
  // or environment variable if provided
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Default to relative API path for production
  return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

export const config = {
  API_BASE_URL,
  IS_DEVELOPMENT: import.meta.env.MODE === 'development',
  IS_PRODUCTION: import.meta.env.MODE === 'production',
} as const; 