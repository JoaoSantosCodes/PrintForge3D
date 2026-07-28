import { generateCorrelationId } from "./logger";

export interface ServiceResult<T> {
  success: boolean;
  data: T;
  error?: string;
  correlationId: string;
  isFallback: boolean;
  timestamp: string;
}

export function createSuccessResult<T>(
  data: T,
  correlationId?: string
): ServiceResult<T> {
  return {
    success: true,
    data,
    correlationId: correlationId || generateCorrelationId(),
    isFallback: false,
    timestamp: new Date().toISOString(),
  };
}

export function createFallbackResult<T>(
  errorMsg: string,
  fallbackData: T,
  correlationId?: string
): ServiceResult<T> {
  return {
    success: false,
    data: fallbackData,
    error: errorMsg,
    correlationId: correlationId || generateCorrelationId(),
    isFallback: true,
    timestamp: new Date().toISOString(),
  };
}
