import { logger, generateCorrelationId } from "@/lib/logger";

export type DecisionCategory = "production" | "inventory" | "pricing" | "maintenance";

export interface ProactiveDecision {
  id: string;
  companyId: string;
  category: DecisionCategory;
  title: string;
  description: string;
  estimatedImpact: string;
  impactType: "time_saving" | "cost_reduction" | "revenue_increase" | "reliability";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export async function getPendingProactiveDecisions(companyId: string): Promise<ProactiveDecision[]> {
  return [
    {
      id: "dec-1",
      companyId,
      category: "production",
      title: "Transferir Job #241 para Impressora P3",
      description: "A impressora Voron 2.4 (P3) está ociosa e possui velocidade de fatiamento 35% superior para este modelo.",
      estimatedImpact: "Economia de 2h18m na fila",
      impactType: "time_saving",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      id: "dec-2",
      companyId,
      category: "inventory",
      title: "Emitir ordem de compra de 3 kg de PLA Branco",
      description: "Com a taxa atual de consumo, o estoque de PLA Branco chegará a 0g em menos de 48 horas.",
      estimatedImpact: "Prevenir parada da linha de produção",
      impactType: "reliability",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      id: "dec-3",
      companyId,
      category: "pricing",
      title: "Aumentar preço da Peça XYZ em +8%",
      description: "A margem de lucro deste modelo (24%) está abaixo da média observada no mercado (36%).",
      estimatedImpact: "+R$ 420,00 de lucro mensal extra",
      impactType: "revenue_increase",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      id: "dec-4",
      companyId,
      category: "maintenance",
      title: "Agendar manutenção preventiva da Impressora P2",
      description: "Bico extrusor atingiu 97% da vida útil estimada (970 horas trabalhadas).",
      estimatedImpact: "Evitar perda de material porentupimento",
      impactType: "cost_reduction",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
  ];
}

export async function approveProactiveDecisionsBatch(
  companyId: string,
  decisionIds: string[]
): Promise<{ approvedCount: number; correlationId: string }> {
  const correlationId = generateCorrelationId();

  logger.info(`[AIDecisionEngine] ${decisionIds.length} decisão(ões) aprovadas em lote para a empresa ${companyId}`, {
    action: "decision_batch_approved",
    companyId,
    correlationId,
    metadata: { decisionIds },
  });

  return {
    approvedCount: decisionIds.length,
    correlationId,
  };
}
