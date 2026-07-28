import { describe, it, expect } from "vitest";
import { getDigitalThreadForPiece } from "@/modules/production/services/digitalThreadService";
import { simulateOperationalScenario } from "@/modules/ai/services/simulationEngineService";
import { getMakerLabDemoData } from "@/lib/demo-data";

describe("PrintForge OS — The Operating System for Additive Manufacturing", () => {
  describe("Digital Thread & Rastreabilidade Industrial", () => {
    it("deve gerar o registro completo de rastreabilidade de uma peça", async () => {
      const thread = await getDigitalThreadForPiece("peca-101");

      expect(thread.pieceId).toBe("peca-101");
      expect(thread.warrantyCertificateCode).toMatch(/^CERT-PF3D-/);
      expect(thread.printerName).toContain("Bambu Lab");
      expect(thread.nozzleTempCelsius).toBe(215);
      expect(thread.inspectionStatus).toBe("approved");
    });
  });

  describe("Simulation Engine de Cenários", () => {
    it("deve simular o retorno sobre investimento (ROI) de nova impressora", async () => {
      const sim = await simulateOperationalScenario("emp-1", "printer_acquisition");

      expect(sim.scenario).toBe("printer_acquisition");
      expect(sim.roiMonths).toBe(14);
      expect(sim.capacityChangePercent).toBe(32.5);
      expect(sim.estimatedNetProfitMonthlyBRL).toBe(3800.0);
    });

    it("deve simular reajuste de preços de catálogo", async () => {
      const sim = await simulateOperationalScenario("emp-1", "price_adjustment");

      expect(sim.scenario).toBe("price_adjustment");
      expect(sim.estimatedNetProfitMonthlyBRL).toBe(1950.0);
      expect(sim.riskAssessment).toBe("low");
    });
  });

  describe("Ambiente Demo MakerLab 3D", () => {
    it("deve retornar o estado pré-populado da fazenda modelo", () => {
      const demo = getMakerLabDemoData();

      expect(demo.companyName).toContain("MakerLab");
      expect(demo.printersCount).toBe(5);
      expect(demo.ordersCount).toBe(120);
      expect(demo.activeJobs.length).toBe(4);
    });
  });
});
