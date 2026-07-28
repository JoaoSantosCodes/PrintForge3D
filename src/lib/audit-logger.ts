import { logger, generateCorrelationId } from "./logger";
import { PersonaKey } from "./permissions";

export interface AuditLogEvent {
  userId: string;
  empresaId: string;
  persona: PersonaKey | string;
  action: string;
  resource: string;
  details?: Record<string, unknown>;
  correlationId?: string;
  ipAddress?: string;
}

export function logAuditEvent(event: AuditLogEvent) {
  const correlationId = event.correlationId || generateCorrelationId();
  const timestamp = new Date().toISOString();

  const formattedLog = {
    type: "AUDIT_EVENT",
    timestamp,
    correlationId,
    userId: event.userId,
    empresaId: event.empresaId,
    persona: event.persona,
    action: event.action,
    resource: event.resource,
    ipAddress: event.ipAddress || "127.0.0.1",
    details: event.details || {},
  };

  logger.info(`[AuditLog] ${event.persona} -> ${event.action} em ${event.resource}`, {
    action: `audit_${event.action}`,
    companyId: event.empresaId,
    userId: event.userId,
    correlationId,
    metadata: formattedLog,
  });

  return formattedLog;
}
