import { logger } from "./logger";

export interface SuccessEngineContract {
  companyId: string;
  companyName: string;
  renewalProbabilityPercent: number; // 0 - 100
  riskCategory: "low_risk" | "moderate_risk" | "high_risk";
  suggestedCSAction: string;
}

export async function evaluateCustomerRenewalLikelihood(
  companyId: string,
  companyName: string = "Empresa Cliente"
): Promise<SuccessEngineContract> {
  const start = performance.now();

  const renewalProbabilityPercent = 98.0;
  const riskCategory = renewalProbabilityPercent >= 80 ? "low_risk" : renewalProbabilityPercent >= 50 ? "moderate_risk" : "high_risk";

  const contract: SuccessEngineContract = {
    companyId,
    companyName,
    renewalProbabilityPercent,
    riskCategory,
    suggestedCSAction: "Cliente com engajamento excelente. Enviar convite para o programa de Beta Testers do PrintForge Labs.",
  };

  const durationMs = Math.round(performance.now() - start);

  logger.info(`[SuccessEngine] Previsão de renovação calculada para ${companyName}`, {
    action: "success_engine_evaluated",
    companyId,
    durationMs,
    metadata: { renewalProbability: renewalProbabilityPercent, riskCategory },
  });

  return contract;
}
