import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pedido: {
      count: vi.fn().mockResolvedValue(3),
      findMany: vi.fn().mockResolvedValue([{ precoAcordado: 100, quantidade: 2 }]),
    },
    printer: {
      count: vi.fn().mockResolvedValue(1),
    },
    filament: {
      count: vi.fn().mockResolvedValue(2),
    },
  },
}));

import { getDailyMorningBriefing, processCopilotQuery } from "@/modules/ai/services/copilotService";
import { getIndustryBenchmarkReport } from "@/modules/ai/services/benchmarkService";

describe("PrintForge Platform 2.0 — Product Excellence Engine", () => {
  describe("Conversational Operational AI Copilot", () => {
    it("deve gerar o Morning Briefing diário com resumo de pedidos e alertas", async () => {
      const briefing = await getDailyMorningBriefing("emp-1", "Carlos");

      expect(briefing.userName).toBe("Carlos");
      expect(briefing.urgentOrdersCount).toBe(3);
      expect(briefing.stoppedPrintersCount).toBe(1);
      expect(briefing.pendingPaymentsAmountBRL).toBe(200);
      expect(briefing.aiActionRecommendation).toContain("impressora");
    });

    it("deve responder consultas de faturamento e lucro em linguagem natural", async () => {
      const res = await processCopilotQuery("emp-1", "Quanto lucrei com PLA este mês?");

      expect(res.answer).toContain("PLA Preto");
      expect(res.dataSummary?.lucroLiquidoBRL).toBe(7320);
      expect(res.suggestedAction?.actionUrl).toBe("/admin/financeiro");
    });
  });

  describe("Industry Benchmark Intelligence", () => {
    it("deve comparar métricas anonimizadas com o mercado", async () => {
      const report = await getIndustryBenchmarkReport("emp-1", true);

      expect(report.optedIn).toBe(true);
      expect(report.metrics.successRatePercent.company).toBe(93.5);
      expect(report.metrics.estimatedMonthlySavingsBRL).toBe(1250.0);
      expect(report.recommendation).toContain("velocidade");
    });
  });
});
