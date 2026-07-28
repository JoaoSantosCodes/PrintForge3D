import { logger } from "./logger";

export type DomainEvent =
  | "PEDIDO_CRIADO"
  | "PEDIDO_CONCLUIDO"
  | "PEDIDO_CANCELADO"
  | "LOJA_CRIADA"
  | "RECOMPENSA_RESGATADA"
  | "ASSINATURA_RENOVADA"
  | "ESTOQUE_BAIXADO";

export interface EventPayload<T = unknown> {
  event: DomainEvent;
  companyId: string;
  userId?: string;
  data: T;
  timestamp: string;
  correlationId?: string;
}

type EventHandler<T = any> = (payload: EventPayload<T>) => Promise<void>;

class EventBus {
  private handlers: Map<DomainEvent, EventHandler[]> = new Map();

  subscribe<T>(event: DomainEvent, handler: EventHandler<T>): () => void {
    const list = this.handlers.get(event) || [];
    list.push(handler);
    this.handlers.set(event, list);

    return () => {
      const current = this.handlers.get(event) || [];
      this.handlers.set(
        event,
        current.filter((h) => h !== handler)
      );
    };
  }

  async publish<T>(
    event: DomainEvent,
    companyId: string,
    data: T,
    meta: { userId?: string; correlationId?: string } = {}
  ): Promise<void> {
    const payload: EventPayload<T> = {
      event,
      companyId,
      userId: meta.userId,
      data,
      timestamp: new Date().toISOString(),
      correlationId: meta.correlationId,
    };

    logger.info(`[EventBus] Evento publicado: ${event}`, {
      action: "eventbus_publish",
      companyId,
      correlationId: payload.correlationId,
      metadata: { event, dataKeys: Object.keys(data as any || {}) },
    });

    const handlers = this.handlers.get(event) || [];
    const promises = handlers.map((h) =>
      h(payload).catch((err) => {
        logger.error(`[EventBus] Erro no handler do evento ${event}`, {
          action: "eventbus_handler_error",
          companyId,
          error: err?.message || err,
        });
      })
    );

    await Promise.all(promises);
  }
}

export const eventBus = new EventBus();
