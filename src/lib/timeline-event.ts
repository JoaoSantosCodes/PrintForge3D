import { prisma } from './prisma';

export type EntityTypeTimeline = 'PECA' | 'PEDIDO' | 'JOB' | 'IMPRESSORA' | 'ATIVO_3D' | 'EMPRESA';

export interface RegistrarTimelineEventParams {
  empresaId: string;
  entityType: EntityTypeTimeline;
  entityId: string;
  event: string; // ex: "CRIADO", "FATIAMENTO_CONCLUIDO", "IMPRESSAO_INICIADA", "ENTREGUE", "VERSAO_COMMITTED"
  payload?: Record<string, any>;
}

/**
 * Registra um evento na Linha do Tempo Universal da PrintForge Data Platform
 */
export async function registrarTimelineEvent({
  empresaId,
  entityType,
  entityId,
  event,
  payload = {},
}: RegistrarTimelineEventParams) {
  try {
    const payloadJson = JSON.stringify({
      ...payload,
      timestampISO: new Date().toISOString(),
    });

    return await prisma.timelineEvent.create({
      data: {
        empresaId,
        entityType,
        entityId,
        event,
        payloadJson,
      },
    });
  } catch (err) {
    console.warn('[TimelineEvent] Falha ao gravar evento na linha do tempo:', err);
    return null;
  }
}

/**
 * Consulta a linha do tempo completa de uma entidade específica para Replay Operacional
 */
export async function obterTimelineEventos(empresaId: string, entityType: EntityTypeTimeline, entityId: string) {
  try {
    const eventos = await prisma.timelineEvent.findMany({
      where: {
        empresaId,
        entityType,
        entityId,
      },
      orderBy: { createdAt: 'asc' },
    });

    return eventos.map((ev) => ({
      ...ev,
      payload: JSON.parse(ev.payloadJson || '{}'),
    }));
  } catch (err) {
    console.warn('[TimelineEvent] Falha ao consultar eventos:', err);
    return [];
  }
}

/**
 * Consulta a linha do tempo agregada de toda a empresa para o Feed de Atividades do Dashboard
 */
export async function obterTimelineEmpresa(empresaId: string, limit: number = 20) {
  try {
    const eventos = await prisma.timelineEvent.findMany({
      where: { empresaId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return eventos.map((ev) => ({
      ...ev,
      payload: JSON.parse(ev.payloadJson || '{}'),
    }));
  } catch (err) {
    console.warn('[TimelineEvent] Falha ao consultar feed da empresa:', err);
    return [];
  }
}
