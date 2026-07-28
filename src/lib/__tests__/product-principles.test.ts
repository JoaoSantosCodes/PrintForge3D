import { describe, it, expect } from "vitest";
import { getProductIntelligenceMetrics } from "../product-intelligence";
import { calculateCustomerHealthScore } from "../customer-health-score";

describe("PrintForge Product Principles, Intelligence & Customer Health Score", () => {
  describe("Product Intelligence Metrics", () => {
    it("deve medir o tempo até o primeiro orçamento e primeiro job", async () => {
      const report = await getProductIntelligenceMetrics();

      expect(report.timeToFirstQuoteMinutes).toBeLessThan(3.0);
      expect(report.timeToFirstJobMinutes).toBeLessThan(5.0);
      expect(report.copilotDailyActiveUsersPercent).toBeGreaterThan(70.0);
      expect(report.mostUsedFeatures.length).toBeGreaterThan(0);
    });
  });

  describe("Customer Health Score Engine", () => {
    it("deve calcular o índice de saúde e classificar o status como excelente", async () => {
      const report = await calculateCustomerHealthScore("emp-1");

      expect(report.companyId).toBe("emp-1");
      expect(report.healthScore).toBeGreaterThanOrEqual(85);
      expect(report.statusLevel).toBe("excellent");
      expect(report.metrics.paymentStatus).toBe("up_to_date");
    });
  });
});
