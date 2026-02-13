type SleepFn = (ms: number) => Promise<void>;

const defaultSleep: SleepFn = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const connectWithRetry = async (
  connect: () => Promise<void>,
  options: {
    maxRetries: number;
    baseDelayMs: number;
    sleepFn?: SleepFn;
  }
) => {
  const { maxRetries, baseDelayMs, sleepFn = defaultSleep } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await connect();
      return;
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      console.error(`⚠️ Database connection attempt ${attempt}/${maxRetries} failed`, error);
      if (isLastAttempt) {
        throw error;
      }
      await sleepFn(baseDelayMs * attempt);
    }
  }
};

export const disconnectSafely = async (disconnect: () => Promise<void>): Promise<boolean> => {
  try {
    await disconnect();
    return true;
  } catch (error) {
    console.error('Failed to disconnect Prisma cleanly', error);
    return false;
  }
};
