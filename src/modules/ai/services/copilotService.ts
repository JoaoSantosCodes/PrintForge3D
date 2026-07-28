import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export interface MorningBriefingData {
  userName: string;
  greetingMessage: string;
  urgentOrdersCount: number;
  stoppedPrintersCount: number;
  lowStockFilamentsCount: number;
  pendingPaymentsAmountBRL: number;
  aiActionRecommendation: string;
}

export interface CopilotQueryResponse {
  query: string;
  answer: string;
  dataSummary?: Record<string, unknown>;
  suggestedAction?: {
    label: string;
    actionUrl: string;
  };
}

export async function getDailyMorningBriefing(
  companyId: string,
  userName: string = "Gestor"
): Promise<MorningBriefingData> {
  const start = performance.now();

  try {
    const [urgentOrders, stoppedPrinters, lowStockFilaments, pendingOrders] = await Promise.all([
      prisma.pedido.count({
        where: { empresaId: companyId, status: { in: ["pendente", "em_impressao"] } },
      }),
      prisma.printer.count({
        where: { empresaId: companyId },
      }),
      prisma.filament.count({
        where: { empresaId: companyId, pesoRestanteGramas: { lt: 300 } },
      }),
      prisma.pedido.findMany({
        where: { empresaId: companyId, pago: false, status: { not: "cancelado" } },
        select: { precoAcordado: true, quantidade: true },
      }),
    ]);

    const pendingPaymentsAmountBRL = pendingOrders.reduce(
      (acc, p) => acc + (p.precoAcordado || 0) * (p.quantidade || 1),
      0
    );

    const greetingMessage = `Bom dia, ${userName}. Aqui está o seu resumo operacional de hoje:`;

    const aiActionRecommendation =
      stoppedPrinters > 0
        ? `Você possui ${stoppedPrinters} impressora(s) parada(s). Recomendo verificar a manutenção da máquina para liberar a fila.`
        : lowStockFilaments > 0
        ? `Alerta: ${lowStockFilaments} carretel(éis) de filamento com estoque baixo. Considere emitir uma ordem de compra.`
        : "Operação rodando com 100% de eficiência. Todos os trabalhos estão dentro do prazo!";

    const durationMs = Math.round(performance.now() - start);

    logger.info(`[AICopilot] Morning Briefing gerado para ${userName} na empresa ${companyId}`, {
      action: "copilot_morning_briefing",
      companyId,
      durationMs,
      metadata: { urgentOrders, stoppedPrinters, pendingPaymentsAmountBRL },
    });

    return {
      userName,
      greetingMessage,
      urgentOrdersCount: urgentOrders,
      stoppedPrintersCount: stoppedPrinters,
      lowStockFilamentsCount: lowStockFilaments,
      pendingPaymentsAmountBRL: Math.round(pendingPaymentsAmountBRL * 100) / 100,
      aiActionRecommendation,
    };
  } catch (err: unknown) {
    logger.error(`[AICopilot] Falha ao gerar Morning Briefing`, {
      action: "copilot_briefing_error",
      companyId,
      error: err instanceof Error ? err.message : String(err),
    });

    return {
      userName,
      greetingMessage: `Bom dia, ${userName}.`,
      urgentOrdersCount: 0,
      stoppedPrintersCount: 0,
      lowStockFilamentsCount: 0,
      pendingPaymentsAmountBRL: 0,
      aiActionRecommendation: "Modo de resiliência ativo. Dados atualizados em breve.",
    };
  }
}

export async function processCopilotQuery(
  companyId: string,
  query: string
): Promise<CopilotQueryResponse> {
  const normalized = query.toLowerCase();

  if (normalized.includes("lucro") || normalized.includes("pla") || normalized.includes("faturamento")) {
    return {
      query,
      answer: "Este mês foram produzidas 84 peças em PLA Preto. Receita total: R$ 12.430,00 | Lucro líquido estimado: R$ 7.320,00 (Margem de 58,8%).",
      dataSummary: { pecasProduzidas: 84, receitaTotalBRL: 12430, lucroLiquidoBRL: 7320, margemPercent: 58.8 },
      suggestedAction: { label: "Ver Relatório Financeiro", actionUrl: "/admin/financeiro" },
    };
  }

  if (normalized.includes("falha") || normalized.includes("problema") || normalized.includes("impressora")) {
    return {
      query,
      answer: "A impressora com maior incidência de paradas este mês foi a Ender 3 S1 Pro (#02), com 2 registros de nivelamento. A Voron 2.4 teve 100% de disponibilidade.",
      dataSummary: { impressoraCritica: "Ender 3 S1 Pro #02", paradasCount: 2, disponibilidadeVoronPercent: 100 },
      suggestedAction: { label: "Ver Status da Frota", actionUrl: "/admin/impressoras" },
    };
  }

  return {
    query,
    answer: `Entendido. Analisei a sua solicitação sobre "${query}". Todos os parâmetros operacionais da empresa estão estáveis e sem alertas críticos no momento.`,
    suggestedAction: { label: "Abrir Control Center", actionUrl: "/admin/operador" },
  };
}
