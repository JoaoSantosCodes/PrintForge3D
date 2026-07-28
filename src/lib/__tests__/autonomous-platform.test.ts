import { describe, it, expect } from "vitest";
import { getPendingProactiveDecisions, approveProactiveDecisionsBatch } from "@/modules/ai/services/decisionEngineService";
import { getPredictiveBiInsights } from "@/modules/ai/services/predictiveBiService";
import { getAiWorkforceStatus } from "@/modules/ai/services/aiWorkforceService";
import { evaluateCapacityOverflow } from "@/lib/network";

describe("PrintForge Platform 3.0 — Autonomous Manufacturing Platform", () => {
  describe("AI Decision Engine", () => {
    it("deve gerar recomendações proativas operacionais", async () => {
      const decisions = await getPendingProactiveDecisions("emp-1");
      expect(decisions.length).toBe(4);
      expect(decisions[0].category).toBe("production");
    });

    it("deve aprovar decisões em lote com correlationId", async () => {
      const result = await approveProactiveDecisionsBatch("emp-1", ["dec-1", "dec-2"]);
      expect(result.approvedCount).toBe(2);
      expect(result.correlationId).toMatch(/^corr_/);
    });
  });

  describe("BI Preditivo de Futuro", () => {
    it("deve calcular alertas de ruptura de estoque e fluxo de caixa", async () => {
      const alerts = await getPredictiveBiInsights("emp-1");
      expect(alerts.length).toBe(3);
      expect(alerts[0].type).toBe("inventory_depletion");
      expect(alerts[1].daysRemaining).toBe(12);
    });
  });

  describe("Multi-Agent AI Workforce System", () => {
    it("deve retornar o catálogo de agentes especializados", async () => {
      const agents = await getAiWorkforceStatus("emp-1");
      expect(agents.length).toBe(4);
      expect(agents[0].domain).toBe("production");
    });
  });

  describe("PrintForge Network", () => {
    it("deve sugerir empresa parceira ao detectar sobrecarga >90%", () => {
      const offer = evaluateCapacityOverflow("emp-1", 95, "ped-888");
      expect(offer).not.toBeNull();
      expect(offer?.targetCompanyName).toBe("3D Lab Pro Impressões");
      expect(offer?.estimatedCommissionBRL).toBe(85.0);
    });

    it("não deve rotear se a ocupação for menor que 90%", () => {
      const offer = evaluateCapacityOverflow("emp-1", 70, "ped-888");
      expect(offer).toBeNull();
    });
  });
});
