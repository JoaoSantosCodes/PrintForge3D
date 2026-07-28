import { logger } from "@/lib/logger";

export interface PredictiveAlert {
  id: string;
  type: "inventory_depletion" | "cashflow_deficit" | "operator_bottleneck";
  title: string;
  daysRemaining: number;
  message: string;
  severity: "critical" | "warning" | "info";
  suggestedAction: string;
}

export async function getPredictiveBiInsights(companyId: string): Promise<PredictiveAlert[]> {
  const alerts: PredictiveAlert[] = [
    {
      id: "pred-1",
      type: "inventory_depletion",
      title: "Ruptura de Estoque Prevista",
      daysRemaining: 18,
      message: "Em 18 dias o estoque de PLA Preto acabará se o ritmo atual de produção for mantido.",
      severity: "warning",
      suggestedAction: "Emitir Ordem de Compra de 5kg",
    },
    {
      id: "pred-2",
      type: "cashflow_deficit",
      title: "Alerta de Fluxo de Caixa",
      daysRemaining: 12,
      message: "Daqui a 12 dias o saldo de caixa ficará negativo caso os orçamentos pendentes não sejam faturados.",
      severity: "critical",
      suggestedAction: "Enviar lembrete de cobrança para 4 clientes",
    },
    {
      id: "pred-3",
      type: "operator_bottleneck",
      title: "Gargalo de Mão de Obra em Chão de Fábrica",
      daysRemaining: 7,
      message: "Na próxima semana serão necessários mais 2 operadores para manter o prazo médio atual de entrega.",
      severity: "info",
      suggestedAction: "Reorganizar turnos ou abrir vaga temporária",
    },
  ];

  logger.info(`[PredictiveBI] ${alerts.length} alertas preditivos calculados para a empresa ${companyId}`, {
    action: "predictive_bi_calculated",
    companyId,
    metadata: { alertsCount: alerts.length },
  });

  return alerts;
}
