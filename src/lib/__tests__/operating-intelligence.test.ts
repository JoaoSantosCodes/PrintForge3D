import { describe, it, expect } from "vitest";
import { generateAiProductInsights } from "../ai-product-analyst";
import { calculateCompanyMaturityIndex } from "../feature-adoption";
import { getPrintForgeLabsExperiments } from "../printforge-labs";
import { evaluateCustomerRenewalLikelihood } from "../success-engine";

describe("PrintForge Operating Intelligence Platform — Command Center & Labs", () => {
  describe("AI Product Analyst", () => {
    it("deve gerar insights analíticos de uso e retenção de produto", async () => {
      const insights = await generateAiProductInsights();

      expect(insights.length).toBeGreaterThan(0);
      expect(insights[0].category).toBe("retention");
      expect(insights[0].description).toContain("31%");
    });
  });

  describe("Feature Adoption & Manufacturing Maturity Index", () => {
    it("deve calcular a maturidade fabril da empresa e classificar como Industrial", async () => {
      const maturity = await calculateCompanyMaturityIndex("emp-1");

      expect(maturity.companyId).toBe("emp-1");
      expect(maturity.maturityScore).toBeGreaterThanOrEqual(60);
      expect(maturity.tier).toBe("Industrial");
      expect(maturity.adoptionMetrics.calculatorAdoptionPercent).toBe(100.0);
    });
  });

  describe("PrintForge Labs Beta Experiments", () => {
    it("deve retornar a lista de experimentos beta isolados", () => {
      const labs = getPrintForgeLabsExperiments("emp-1");

      expect(labs.length).toBe(4);
      expect(labs[0].key).toBe("ai_vision_defect");
      expect(labs[0].enabledForCompany).toBe(true);
    });
  });

  describe("PrintForge Success Engine", () => {
    it("deve calcular a probabilidade de renovação contratual", async () => {
      const contract = await evaluateCustomerRenewalLikelihood("emp-1", "Empresa Alpha");

      expect(contract.companyId).toBe("emp-1");
      expect(contract.renewalProbabilityPercent).toBe(98.0);
      expect(contract.riskCategory).toBe("low_risk");
    });
  });
});
