type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogPayload {
  message: string;
  action?: string;
  correlationId?: string;
  requestId?: string;
  companyId?: string;
  empresaId?: string;
  userId?: string;
  durationMs?: number;
  queryDurationMs?: number;
  actionDurationMs?: number;
  metadata?: Record<string, unknown>;
  error?: unknown;
}

export function generateCorrelationId(): string {
  return `corr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function formatLog(level: LogLevel, payload: LogPayload) {
  const timestamp = new Date().toISOString();
  return {
    timestamp,
    level,
    correlationId: payload.correlationId || generateCorrelationId(),
    companyId: payload.companyId || payload.empresaId,
    ...payload,
    environment: process.env.NODE_ENV || "development",
  };
}

export const logger = {
  info: (message: string, payload: Omit<LogPayload, "message"> = {}) => {
    const formatted = formatLog("info", { message, ...payload });
    console.log(JSON.stringify(formatted));
  },

  warn: (message: string, payload: Omit<LogPayload, "message"> = {}) => {
    const formatted = formatLog("warn", { message, ...payload });
    console.warn(JSON.stringify(formatted));
  },

  error: (message: string, payload: Omit<LogPayload, "message"> = {}) => {
    const formatted = formatLog("error", { message, ...payload });
    console.error(JSON.stringify(formatted));
  },

  debug: (message: string, payload: Omit<LogPayload, "message"> = {}) => {
    if (process.env.NODE_ENV !== "production") {
      const formatted = formatLog("debug", { message, ...payload });
      console.log(JSON.stringify(formatted));
    }
  },

  measureTime: async <T>(
    actionName: string,
    fn: () => Promise<T>,
    meta: { correlationId?: string; requestId?: string; empresaId?: string; companyId?: string; userId?: string } = {}
  ): Promise<T> => {
    const start = performance.now();
    const correlationId = meta.correlationId || generateCorrelationId();
    try {
      const result = await fn();
      const durationMs = Math.round(performance.now() - start);
      logger.info(`Action ${actionName} concluída`, {
        action: actionName,
        correlationId,
        durationMs,
        actionDurationMs: durationMs,
        ...meta,
      });
      return result;
    } catch (err: unknown) {
      const durationMs = Math.round(performance.now() - start);
      logger.error(`Action ${actionName} falhou`, {
        action: actionName,
        correlationId,
        durationMs,
        actionDurationMs: durationMs,
        error: err instanceof Error ? err.message : String(err),
        ...meta,
      });
      throw err;
    }
  },
};
