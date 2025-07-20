// Environment-aware API configuration
const getApiBaseUrl = (): string => {
  // In development, use localhost
  if (import.meta.env.MODE === 'development') {
    return 'http://localhost:3001/api';
  }
  
  // Check if a custom API URL is provided via environment variable
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // For production deployments, assume API is at the same domain with /api prefix
  // This works for full-stack deployments or when using a reverse proxy
  return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

export const config = {
  API_BASE_URL,
  IS_DEVELOPMENT: import.meta.env.MODE === 'development',
  IS_PRODUCTION: import.meta.env.MODE === 'production',
} as const; 