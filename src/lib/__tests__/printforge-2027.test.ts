import { describe, it, expect } from "vitest";
import { analyzeRootCauseForPieceFailure } from "../knowledge-graph";
import { queryManufacturingBrain } from "@/modules/ai/services/manufacturingBrainService";
import { calculatePieceQualityScore, getEnterpriseQualityReport } from "@/modules/production/services/qualityIntelligenceService";
import { getCustomerSuccessKpis } from "../customer-kpi";

describe("PrintForge OS 2027 — Enterprise Architecture & Manufacturing Knowledge Graph", () => {
  describe("Manufacturing Knowledge Graph", () => {
    it("deve realizar a análise de causa raiz correlacionada de falhas", async () => {
      const analysis = await analyzeRootCauseForPieceFailure("emp-1", "Suporte Xbox v2");

      expect(analysis.pieceName).toBe("Suporte Xbox v2");
      expect(analysis.failureRatePercent).toBe(18.5);
      expect(analysis.correlatedSupplier).toContain("Filamentos Brasil");
      expect(analysis.recommendedSolution).toContain("215°C");
    });
  });

  describe("Unified AI Manufacturing Brain", () => {
    it("deve unificar o relatório de decisões, alertas e benchmark de mercado", async () => {
      const report = await queryManufacturingBrain("emp-1");

      expect(report.companyId).toBe("emp-1");
      expect(report.decisions.length).toBeGreaterThan(0);
      expect(report.predictiveAlerts.length).toBeGreaterThan(0);
      expect(report.healthScorePercent).toBeGreaterThan(50);
    });
  });

  describe("Quality Intelligence Engine", () => {
    it("deve calcular o Quality Score de peças e o relatório geral de fábrica", async () => {
      const pieceScore = await calculatePieceQualityScore("peca-101");
      expect(pieceScore.pieceScore).toBe(96.4);
      expect(pieceScore.customerSatisfactionRating).toBe(5.0);

      const report = await getEnterpriseQualityReport("emp-1");
      expect(report.overallCompanyQualityScore).toBe(95.8);
      expect(report.topPrinterScore.printerName).toContain("Voron");
    });
  });

  describe("Customer Success KPI Tracker", () => {
    it("deve medir os KPIs de tempo de onboarding e adoção da plataforma", async () => {
      const kpis = await getCustomerSuccessKpis("emp-1");

      expect(kpis.onboardingTimeMinutes).toBeLessThan(15);
      expect(kpis.timeToFirstQuoteMinutes).toBeLessThan(5);
      expect(kpis.copilotAdoptionPercent).toBeGreaterThan(70);
      expect(kpis.platformUptimePercent).toBeGreaterThan(99.9);
      expect(kpis.status).toBe("target_achieved");
    });
  });
});
