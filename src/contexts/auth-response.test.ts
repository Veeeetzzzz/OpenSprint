import { describe, expect, it } from 'vitest';
import { extractAuthPayload } from './auth-response';

describe('extractAuthPayload', () => {
  it('returns validated auth payload', () => {
    const payload = {
      user: {
        id: 'u1',
        name: 'User One',
        email: 'u1@example.com',
        avatarUrl: '',
      },
      token: 'token-123',
    };

    const result = extractAuthPayload(payload);

    expect(result.user.id).toBe('u1');
    expect(result.token).toBe('token-123');
  });

  it('throws when token is missing', () => {
    const payload = {
      user: {
        id: 'u1',
        name: 'User One',
        email: 'u1@example.com',
        avatarUrl: '',
      },
    };

    expect(() => extractAuthPayload(payload)).toThrow('Invalid auth response: missing token');
  });

  it('throws when user shape is malformed', () => {
    const payload = {
      user: { id: 'u1' },
      token: 'token-123',
    };

    expect(() => extractAuthPayload(payload)).toThrow('Invalid auth response: malformed user');
  });
});
