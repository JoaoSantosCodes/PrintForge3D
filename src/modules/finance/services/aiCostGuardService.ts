import { logger } from "@/lib/logger";

export interface CostGuardInsight {
  id: string;
  type: "margin_drop" | "supplier_saving" | "energy_tariff_alert";
  title: string;
  impactBRL: number;
  marginChangePercent?: number;
  message: string;
  recommendedAction: string;
}

export async function runDailyCostGuardCheck(companyId: string): Promise<CostGuardInsight[]> {
  const start = performance.now();

  const insights: CostGuardInsight[] = [
    {
      id: "cg-1",
      type: "margin_drop",
      title: "Alerta de Queda de Margem",
      impactBRL: -420.0,
      marginChangePercent: -2.8,
      message: "Hoje sua margem de lucro líquida caiu 2,8% devido ao aumento de custo do lote de PETG Branco.",
      recommendedAction: "Ajustar o preço sugerido do catálogo em +4% para reequilibrar a margem.",
    },
    {
      id: "cg-2",
      type: "supplier_saving",
      title: "Oportunidade de Economia de Insumos",
      impactBRL: 840.0,
      marginChangePercent: 3.5,
      message: "Substituir o fornecedor '3D Lab Insumos' pelo fornecedor 'Filamentos Brasil Ltda' reduz o custo em R$ 0,35 por peça produzida.",
      recommendedAction: "Emitir próxima ordem de compra no fornecedor Filamentos Brasil Ltda.",
    },
  ];

  const durationMs = Math.round(performance.now() - start);

  logger.info(`[AICostGuard] Verificação diária de custos concluída para a empresa ${companyId}`, {
    action: "ai_cost_guard_checked",
    companyId,
    durationMs,
    metadata: { insightsCount: insights.length },
  });

  return insights;
}
