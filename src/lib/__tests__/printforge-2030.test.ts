import { describe, it, expect } from "vitest";
import { generateOptimalJobShopSchedule } from "@/modules/ai/services/aiSchedulingService";
import { analyzePrinterCameraFrame } from "@/modules/ai/services/aiVisionService";
import { getEnterpriseComplianceReport } from "../enterprise-compliance";

describe("PrintForge Vision 2030 — Master Architecture & Enterprise Innovation", () => {
  describe("AI Job Shop Scheduler", () => {
    it("deve alocar a fila de 120 trabalhos entre as impressoras com economia calculada", async () => {
      const plan = await generateOptimalJobShopSchedule("emp-1", 120);

      expect(plan.totalJobsCount).toBe(120);
      expect(plan.totalPrintersUtilized).toBe(4);
      expect(plan.estimatedCostSavingsBRL).toBe(1820.0);
      expect(plan.slaReductionDays).toBe(3.0);
      expect(plan.schedule.length).toBe(4);
    });
  });

  describe("AI Vision Defect Prevention", () => {
    it("deve detectar falhas de fatiamento/spaghetti e recomendar pausa automática", async () => {
      const resDefect = await analyzePrinterCameraFrame("p2", "Ender 3 S1 Pro #02");
      expect(resDefect.detectedDefect).toBe("spaghetti");
      expect(resDefect.failureProbabilityPercent).toBeGreaterThan(80);
      expect(resDefect.recommendAutoPause).toBe(true);

      const resNormal = await analyzePrinterCameraFrame("p1", "Bambu Lab X1-Carbon #01");
      expect(resNormal.detectedDefect).toBe("none");
      expect(resNormal.recommendAutoPause).toBe(false);
    });
  });

  describe("Multi-Factory & Enterprise Compliance Center", () => {
    it("deve validar a conformidade com ISO 9001, ISO 13485 e hierarquia multi-fábricas", async () => {
      const report = await getEnterpriseComplianceReport("emp-1");

      expect(report.companyId).toBe("emp-1");
      expect(report.iso9001Status).toBe("certified");
      expect(report.iso13485MedicalStatus).toBe("certified");
      expect(report.lgpdGdprCompliant).toBe(true);
      expect(report.fourEyesPrincipleEnabled).toBe(true);
      expect(report.factories.length).toBe(4);
      expect(report.factories[0].name).toContain("São Paulo");
    });
  });
});
