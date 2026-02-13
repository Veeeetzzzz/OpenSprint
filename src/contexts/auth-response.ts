import { User } from '@/types';

export const extractAuthPayload = (payload: unknown): { user: User; token: string } => {
  const user = (payload as { user?: User } | null)?.user;
  const tokenValue = (payload as { token?: unknown } | null)?.token;
  if (!user || typeof user !== 'object') {
    throw new Error('Invalid auth response: missing user');
  }
  if (!('id' in user) || !('email' in user) || !('name' in user)) {
    throw new Error('Invalid auth response: malformed user');
  }
  if (typeof tokenValue !== 'string' || tokenValue.length === 0) {
    throw new Error('Invalid auth response: missing token');
  }
  return { user, token: tokenValue };
};
