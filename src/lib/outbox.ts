import { logger, generateCorrelationId } from "./logger";
import { DomainEvent, eventBus } from "./event-bus";

export interface OutboxMessage {
  id: string;
  companyId: string;
  event: DomainEvent;
  payload: unknown;
  status: "pending" | "processed" | "failed";
  attempts: number;
  createdAt: string;
  correlationId: string;
}

class TransactionalOutbox {
  private queue: OutboxMessage[] = [];

  enqueue(companyId: string, event: DomainEvent, payload: unknown): OutboxMessage {
    const correlationId = generateCorrelationId();
    const message: OutboxMessage = {
      id: `outbox_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      companyId,
      event,
      payload,
      status: "pending",
      attempts: 0,
      createdAt: new Date().toISOString(),
      correlationId,
    };

    this.queue.push(message);

    logger.info(`[Outbox] Evento '${event}' adicionado à fila Outbox (${message.id})`, {
      action: "outbox_enqueued",
      companyId,
      correlationId,
      metadata: { outboxId: message.id, event },
    });

    return message;
  }

  async processPendingMessages(): Promise<number> {
    const pending = this.queue.filter((m) => m.status === "pending" || m.status === "failed");
    let processedCount = 0;

    for (const msg of pending) {
      try {
        msg.attempts++;
        await eventBus.publish(msg.event, msg.companyId, msg.payload, {
          correlationId: msg.correlationId,
        });

        msg.status = "processed";
        processedCount++;

        logger.info(`[Outbox] Mensagem ${msg.id} processada com sucesso`, {
          action: "outbox_processed",
          companyId: msg.companyId,
          correlationId: msg.correlationId,
        });
      } catch (err: unknown) {
        msg.status = "failed";
        logger.error(`[Outbox] Falha ao processar mensagem ${msg.id}`, {
          action: "outbox_process_failed",
          companyId: msg.companyId,
          correlationId: msg.correlationId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return processedCount;
  }

  getPendingCount(): number {
    return this.queue.filter((m) => m.status === "pending" || m.status === "failed").length;
  }
}

export const transactionalOutbox = new TransactionalOutbox();
