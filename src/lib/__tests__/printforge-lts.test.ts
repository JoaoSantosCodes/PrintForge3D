import { describe, it, expect } from "vitest";
import { generatePieceDigitalPassport } from "@/modules/production/services/digitalPassportService";
import { runDailyCostGuardCheck } from "@/modules/finance/services/aiCostGuardService";
import { queryGlobalManufacturingMemory } from "../manufacturing-memory";

describe("PrintForge X 1.0 LTS — Release Baseline & Cloud Ecosystem", () => {
  describe("Manufacturing Digital Passport", () => {
    it("deve gerar o passaporte digital público com QR Code e certificado de garantia", async () => {
      const passport = await generatePieceDigitalPassport("peca-999");

      expect(passport.passportId).toMatch(/^PASS-PECA-999-/);
      expect(passport.publicUrl).toContain("/passport/");
      expect(passport.warrantyCode).toMatch(/^CERT-PF3D-/);
      expect(passport.qualityScore).toBe(98.4);
      expect(passport.compatibleSpareParts.length).toBe(3);
    });
  });

  describe("AI Cost Guard", () => {
    it("deve calcular a variação diária de margem e sugerir ações de redução de custo", async () => {
      const insights = await runDailyCostGuardCheck("emp-1");

      expect(insights.length).toBe(2);
      expect(insights[0].type).toBe("margin_drop");
      expect(insights[0].marginChangePercent).toBe(-2.8);
      expect(insights[1].recommendedAction).toContain("Filamentos Brasil");
    });
  });

  describe("Manufacturing Memory Global", () => {
    it("deve consultar a memória coletiva de soluções fabris com índice de confiança", async () => {
      const memory = await queryGlobalManufacturingMemory("stringing_petg");

      expect(memory).not.toBeNull();
      expect(memory?.globalSuccessCount).toBeGreaterThan(100);
      expect(memory?.confidenceScorePercent).toBeGreaterThan(95);
      expect(memory?.verifiedFixDescription).toContain("45mm/s");
    });
  });
});
