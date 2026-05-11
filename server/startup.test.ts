import { describe, expect, it, vi } from 'vitest';
import { connectWithRetry, disconnectSafely } from './startup.js';

describe('startup helpers', () => {
  it('retries database connection and eventually succeeds', async () => {
    const connect = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error('first failure'))
      .mockRejectedValueOnce(new Error('second failure'))
      .mockResolvedValueOnce(undefined);
    const sleepFn = vi.fn(async () => {});

    await connectWithRetry(connect, {
      maxRetries: 3,
      baseDelayMs: 10,
      sleepFn,
    });

    expect(connect).toHaveBeenCalledTimes(3);
    expect(sleepFn).toHaveBeenCalledTimes(2);
    expect(sleepFn).toHaveBeenNthCalledWith(1, 10);
    expect(sleepFn).toHaveBeenNthCalledWith(2, 20);
  });

  it('throws when all database retries fail', async () => {
    const connect = vi.fn<() => Promise<void>>().mockRejectedValue(new Error('db offline'));
    const sleepFn = vi.fn(async () => {});

    await expect(
      connectWithRetry(connect, { maxRetries: 2, baseDelayMs: 5, sleepFn })
    ).rejects.toThrow('db offline');

    expect(connect).toHaveBeenCalledTimes(2);
    expect(sleepFn).toHaveBeenCalledTimes(1);
  });

  it('handles disconnect failures without throwing', async () => {
    const disconnect = vi.fn<() => Promise<void>>().mockRejectedValue(new Error('disconnect failed'));

    const result = await disconnectSafely(disconnect);

    expect(result).toBe(false);
  });
});
