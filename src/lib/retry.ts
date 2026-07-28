import { logger } from "./logger";

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffFactor?: number;
  onRetry?: (attempt: number, err: unknown) => void;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts || 3;
  const initialDelay = options.delayMs || 500;
  const factor = options.backoffFactor || 2;

  let currentAttempt = 1;

  while (currentAttempt <= maxAttempts) {
    try {
      return await fn();
    } catch (err: unknown) {
      if (currentAttempt >= maxAttempts) {
        logger.error(`[RetryEngine] Limite máximo de ${maxAttempts} tentativas esgotado.`, {
          action: "retry_exhausted",
          error: err instanceof Error ? err.message : String(err),
        });
        throw err;
      }

      const waitTime = initialDelay * Math.pow(factor, currentAttempt - 1);
      logger.warn(`[RetryEngine] Tentativa ${currentAttempt}/${maxAttempts} falhou. Agendando retry em ${waitTime}ms.`, {
        action: "retry_attempt_failed",
        metadata: { attempt: currentAttempt, maxAttempts, waitTime },
      });

      if (options.onRetry) {
        options.onRetry(currentAttempt, err);
      }

      await new Promise((resolve) => setTimeout(resolve, waitTime));
      currentAttempt++;
    }
  }

  throw new Error("Erro inesperado no loop de retry");
}
