import type { Request } from 'express';
import { describe, expect, it } from 'vitest';
import { getAuthenticatedUser, getProjectAccessContext } from './requestContext';

describe('requestContext guards', () => {
  it('throws 401 when user is missing', () => {
    const req = {} as Request;

    try {
      getAuthenticatedUser(req);
      throw new Error('Expected guard to throw');
    } catch (error) {
      const apiError = error as Error & { statusCode?: number };
      expect(apiError.statusCode).toBe(401);
      expect(apiError.message).toBe('Authentication required');
    }
  });

  it('throws 403 when project access is missing', () => {
    const req = {} as Request;

    try {
      getProjectAccessContext(req);
      throw new Error('Expected guard to throw');
    } catch (error) {
      const apiError = error as Error & { statusCode?: number };
      expect(apiError.statusCode).toBe(403);
      expect(apiError.message).toBe('Project access context missing');
    }
  });
});
