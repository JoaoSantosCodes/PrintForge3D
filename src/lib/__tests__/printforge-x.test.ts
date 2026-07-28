import { describe, it, expect } from "vitest";
import { executeManufacturingHubQuery } from "../manufacturing-hub";
import { recordOperatorCorrection, getLearnedSolutionForError } from "@/modules/ai/services/learningEngineService";
import { getCompanyManufacturingDna } from "@/modules/ai/services/manufacturingDnaService";
import { getManufacturingTimelineReplay } from "@/modules/production/services/manufacturingTimelineService";
import { calculateGlobalManufacturingScore } from "../manufacturing-score";
import { getPmfUnitEconomics } from "../pmf-unit-economics";

describe("PrintForge X — The Manufacturing Intelligence Platform", () => {
  describe("Manufacturing Intelligence Hub", () => {
    it("deve orquestrar consultas entre os 8 motores de IA", async () => {
      const capsule = await executeManufacturingHubQuery("emp-1");

      expect(capsule.companyId).toBe("emp-1");
      expect(capsule.contextData.activePrinters).toBe(4);
      expect(capsule.brainReport.healthScorePercent).toBeGreaterThan(50);
      expect(capsule.recommendedNextAction).toContain("Aprovar em lote");
    });
  });

  describe("Learning Engine (Auto-Aprendizado)", () => {
    it("deve registrar o aprendizado de correções operacionais de chão de fábrica", async () => {
      const pattern = await recordOperatorCorrection("emp-1", "ERR_ADHESION_BED", "Limpar mesa com Álcool 99%");

      expect(pattern.errorPattern).toBe("ERR_ADHESION_BED");
      expect(pattern.resolutionProbabilityPercent).toBe(92.4);

      const solution = await getLearnedSolutionForError("emp-1", "ERR_ADHESION_BED");
      expect(solution?.resolutionProbabilityPercent).toBe(92.4);
    });
  });

  describe("Digital Manufacturing DNA", () => {
    it("deve retornar o perfil calibrado da empresa", async () => {
      const dna = await getCompanyManufacturingDna("emp-1");

      expect(dna.companyId).toBe("emp-1");
      expect(dna.favoriteMaterials).toContain("PLA Preto Premium");
      expect(dna.targetProfitMarginPercent).toBe(35.0);
    });
  });

  describe("Manufacturing Timeline & Replay", () => {
    it("deve gerar o replay cronológico de execução do pedido", async () => {
      const replay = await getManufacturingTimelineReplay("PED-142");

      expect(replay.orderId).toBe("PED-142");
      expect(replay.timeline.length).toBe(7);
      expect(replay.replayPlaybackUrl).toContain("orderId=PED-142");
    });
  });

  describe("Global Manufacturing Score", () => {
    it("deve calcular a pontuação global e percentil da empresa", async () => {
      const score = await calculateGlobalManufacturingScore("emp-1");

      expect(score.overallScore).toBe(91.5);
      expect(score.industryAverageScore).toBe(84.0);
      expect(score.percentileRank).toBeGreaterThan(90);
    });
  });

  describe("PMF & SaaS Unit Economics", () => {
    it("deve calcular métricas de MRR, LTV/CAC e retenção", async () => {
      const pmf = await getPmfUnitEconomics();

      expect(pmf.mrrBRL).toBe(42500.0);
      expect(pmf.ltvToCacRatio).toBe(9.0);
      expect(pmf.monthlyChurnPercent).toBeLessThan(2.0);
      expect(pmf.productMarketFitScore).toBe(94.0);
    });
  });
});
