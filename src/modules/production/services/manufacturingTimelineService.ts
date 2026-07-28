import { logger } from "@/lib/logger";

export interface TimelineStepEvent {
  timestamp: string;
  stepName: string;
  description: string;
  actor: string;
  status: "completed" | "in_progress" | "failed";
}

export interface ManufacturingReplayCapsule {
  orderId: string;
  pieceName: string;
  timeline: TimelineStepEvent[];
  replayPlaybackUrl: string;
}

export async function getManufacturingTimelineReplay(orderId: string): Promise<ManufacturingReplayCapsule> {
  const timeline: TimelineStepEvent[] = [
    { timestamp: "08:10:00", stepName: "Pedido Recebido", description: "Orçamento iniciado via e-commerce", actor: "Cliente TechLab", status: "completed" },
    { timestamp: "08:12:00", stepName: "Análise STL & Custo", description: "Fatiamento simulado e precificação calculada em R$ 19,91", actor: "PrintForge AI Engine", status: "completed" },
    { timestamp: "08:15:00", stepName: "Orçamento Aprovado", description: "Pagamento efetuado via PIX", actor: "Cliente TechLab", status: "completed" },
    { timestamp: "08:18:00", stepName: "Impressora Alocada", description: "Alocado para Voron 2.4 (P3)", actor: "AI Decision Engine", status: "completed" },
    { timestamp: "11:42:00", stepName: "Impressão Concluída", description: "Impressão finalizada sem erros de camada", actor: "Voron 2.4 (P3)", status: "completed" },
    { timestamp: "12:15:00", stepName: "Inspeção & Qualidade", description: "Aprovado na inspeção dimensional com Score 98/100", actor: "Carlos Silva (Operador)", status: "completed" },
    { timestamp: "13:10:00", stepName: "Pedido Despachado", description: "Código de rastreamento gerado e enviado", actor: "PrintForge Logistics", status: "completed" },
  ];

  logger.info(`[ManufacturingReplay] Timeline Replay gerado para o pedido ${orderId}`, {
    action: "manufacturing_replay_generated",
    metadata: { orderId, stepsCount: timeline.length },
  });

  return {
    orderId,
    pieceName: "Suporte Articulado Xbox",
    timeline,
    replayPlaybackUrl: `/admin/replay?orderId=${orderId}`,
  };
}
