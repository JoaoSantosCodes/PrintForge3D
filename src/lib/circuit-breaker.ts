import { logger, generateCorrelationId } from "./logger";

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerOptions {
  failureThreshold?: number; // Ex: 3 falhas seguidas
  resetTimeoutMs?: number;   // Ex: 30000ms (30s)
}

export class CircuitBreaker {
  readonly name: string;
  private state: CircuitState = "CLOSED";
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;

  constructor(name: string, options: CircuitBreakerOptions = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 3;
    this.resetTimeoutMs = options.resetTimeoutMs || 30000;
  }

  getState(): CircuitState {
    if (this.state === "OPEN") {
      const now = Date.now();
      if (now - this.lastFailureTime > this.resetTimeoutMs) {
        this.state = "HALF_OPEN";
        logger.info(`[CircuitBreaker] ${this.name} transicionou para HALF_OPEN`, {
          action: "circuit_half_open",
          metadata: { circuit: this.name },
        });
      }
    }
    return this.state;
  }

  async execute<T>(
    actionFn: () => Promise<T>,
    fallbackFn: (err: unknown) => Promise<T>
  ): Promise<{ result: T; usedFallback: boolean }> {
    const currentState = this.getState();
    const correlationId = generateCorrelationId();

    if (currentState === "OPEN") {
      logger.warn(`[CircuitBreaker] ${this.name} está OPEN. Executando fallback instantâneo.`, {
        action: "circuit_open_fallback",
        correlationId,
        metadata: { circuit: this.name },
      });
      const fallbackResult = await fallbackFn(new Error("Circuit breaker está OPEN"));
      return { result: fallbackResult, usedFallback: true };
    }

    try {
      const res = await actionFn();

      if (this.state === "HALF_OPEN" || this.failureCount > 0) {
        this.reset();
        logger.info(`[CircuitBreaker] ${this.name} recuperado. Transicionado para CLOSED.`, {
          action: "circuit_closed_recovered",
          correlationId,
          metadata: { circuit: this.name },
        });
      }

      return { result: res, usedFallback: false };
    } catch (err: unknown) {
      this.recordFailure();

      logger.error(`[CircuitBreaker] Falha capturada em ${this.name}. Falhas consecutivas: ${this.failureCount}`, {
        action: "circuit_failure_recorded",
        correlationId,
        error: err instanceof Error ? err.message : String(err),
        metadata: { circuit: this.name, failureCount: this.failureCount, state: this.state },
      });

      const fallbackResult = await fallbackFn(err);
      return { result: fallbackResult, usedFallback: true };
    }
  }

  private recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
      logger.warn(`[CircuitBreaker] Limite de falhas atingido em ${this.name}. Estado alterado para OPEN.`, {
        action: "circuit_open_triggered",
        metadata: { circuit: this.name, threshold: this.failureThreshold },
      });
    }
  }

  private reset() {
    this.state = "CLOSED";
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }
}

const circuitRegistry = new Map<string, CircuitBreaker>();

export function getCircuitBreaker(name: string, options?: CircuitBreakerOptions): CircuitBreaker {
  if (!circuitRegistry.has(name)) {
    circuitRegistry.set(name, new CircuitBreaker(name, options));
  }
  return circuitRegistry.get(name)!;
}
