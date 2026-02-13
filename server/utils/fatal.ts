type FatalContext = Record<string, unknown>;

const logFatal = (message: string, error?: unknown, context?: FatalContext) => {
  const payload = {
    message,
    context,
    error: error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : error,
    timestamp: new Date().toISOString(),
  };

  console.error('❌ Fatal startup error', payload);
};

export const fatalStartup = (
  message: string,
  error?: unknown,
  context?: FatalContext,
  exitCode: number = 1
): never => {
  logFatal(message, error, context);
  process.exit(exitCode);
};
