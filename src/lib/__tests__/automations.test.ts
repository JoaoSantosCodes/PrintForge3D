import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
  },
}));

import { automationsEngine, AutomationRule } from "../automations";
import { checkPlatformHealth } from "../platform-health";

describe("PrintForge Platform 2.0 — Centro de Automações & Platform Health", () => {
  describe("Engine de Automações", () => {
    it("deve registrar e executar regras de automação ativas", async () => {
      const rule: AutomationRule = {
        id: "rule-1",
        name: "Notificar WhatsApp ao concluir impressão",
        companyId: "emp-1",
        trigger: "IMPRESSAO_CONCLUIDA",
        active: true,
        actions: [
          { type: "ENVIAR_WHATSAPP", target: "5511999999999" },
          { type: "CRIAR_NOTIFICACAO" },
        ],
      };

      automationsEngine.registerRule(rule);

      const rules = automationsEngine.getRulesForCompany("emp-1");
      expect(rules.length).toBeGreaterThan(0);

      const count = await automationsEngine.evaluateTrigger("IMPRESSAO_CONCLUIDA", {
        event: "PEDIDO_CONCLUIDO",
        companyId: "emp-1",
        data: { id: "ped-123" },
        timestamp: new Date().toISOString(),
      });

      expect(count).toBe(1);
    });
  });

  describe("Platform Health Monitoring", () => {
    it("deve gerar um relatório de saúde com score 100%", async () => {
      const report = await checkPlatformHealth();

      expect(report.scorePercent).toBe(100);
      expect(report.overallStatus).toBe("healthy");
      expect(report.services.length).toBe(4);
    });
  });
});
