type LogLevel = "info" | "warn" | "error" | "debug";

interface LogPayload {
  message: string;
  action?: string;
  empresaId?: string;
  userId?: string;
  durationMs?: number;
  metadata?: Record<string, any>;
  error?: any;
}

function formatLog(level: LogLevel, payload: LogPayload) {
  const timestamp = new Date().toISOString();
  return {
    timestamp,
    level,
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
    meta: { empresaId?: string; userId?: string } = {}
  ): Promise<T> => {
    const start = performance.now();
    try {
      const result = await fn();
      const durationMs = Math.round(performance.now() - start);
      logger.info(`Action ${actionName} concluída`, {
        action: actionName,
        durationMs,
        ...meta,
      });
      return result;
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - start);
      logger.error(`Action ${actionName} falhou`, {
        action: actionName,
        durationMs,
        error: err?.message || err,
        ...meta,
      });
      throw err;
    }
  },
};
