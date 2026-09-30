/**
 * Generic retry utility with exponential backoff and jitter.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
    factor?: number;
    onRetry?: (error: unknown, attempt: number) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 3, initialDelayMs = 500, factor = 2, onRetry } = options;

  let lastError: unknown;
  let delay = initialDelayMs;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        break;
      }

      if (onRetry) {
        onRetry(error, attempt);
      }

      // Add small jitter (up to 20%) to avoid thundering herds
      const jitter = Math.random() * 0.2 * delay;
      await new Promise((resolve) => setTimeout(resolve, delay + jitter));
      delay *= factor;
    }
  }

  throw lastError;
}
