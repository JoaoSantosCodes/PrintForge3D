import { logger } from "@/lib/logger";
import { getPendingProactiveDecisions, ProactiveDecision } from "./decisionEngineService";
import { getPredictiveBiInsights, PredictiveAlert } from "./predictiveBiService";
import { getIndustryBenchmarkReport, IndustryBenchmarkReport } from "./benchmarkService";
import { analyzeRootCauseForPieceFailure, RootCauseAnalysisResult } from "@/lib/knowledge-graph";

export interface UnifiedManufacturingBrainReport {
  companyId: string;
  decisions: ProactiveDecision[];
  predictiveAlerts: PredictiveAlert[];
  benchmark: IndustryBenchmarkReport;
  healthScorePercent: number;
  timestamp: string;
}

export async function queryManufacturingBrain(
  companyId: string
): Promise<UnifiedManufacturingBrainReport> {
  const start = performance.now();

  const [decisions, predictiveAlerts, benchmark] = await Promise.all([
    getPendingProactiveDecisions(companyId),
    getPredictiveBiInsights(companyId),
    getIndustryBenchmarkReport(companyId, true),
  ]);

  const healthScorePercent = Math.max(
    0,
    Math.round(100 - predictiveAlerts.filter((a) => a.severity === "critical").length * 15)
  );

  const durationMs = Math.round(performance.now() - start);

  logger.info(`[ManufacturingBrain] Relatório unificado de IA gerado para a empresa ${companyId}`, {
    action: "manufacturing_brain_queried",
    companyId,
    durationMs,
    metadata: { decisionsCount: decisions.length, alertsCount: predictiveAlerts.length, healthScorePercent },
  });

  return {
    companyId,
    decisions,
    predictiveAlerts,
    benchmark,
    healthScorePercent,
    timestamp: new Date().toISOString(),
  };
}
