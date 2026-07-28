import { logger } from "@/lib/logger";

export type DefectType = "spaghetti" | "warping" | "layer_shift" | "delamination" | "none";

export interface VisionAnalysisResult {
  printerId: string;
  printerName: string;
  detectedDefect: DefectType;
  failureProbabilityPercent: number;
  recommendAutoPause: boolean;
  message: string;
  snapshotUrl?: string;
}

export async function analyzePrinterCameraFrame(
  printerId: string,
  printerName: string
): Promise<VisionAnalysisResult> {
  const start = performance.now();

  const isSimulatedDefect = printerId === "p2";

  const result: VisionAnalysisResult = isSimulatedDefect
    ? {
        printerId,
        printerName,
        detectedDefect: "spaghetti",
        failureProbabilityPercent: 87.5,
        recommendAutoPause: true,
        message: "Alerta: Detecção de 'Spaghetti' de filamento solto. Probabilidade de falha: 87.5%. Recomenda-se pausar imediatamente.",
        snapshotUrl: `/api/telemetry/camera/${printerId}/snapshot.jpg`,
      }
    : {
        printerId,
        printerName,
        detectedDefect: "none",
        failureProbabilityPercent: 2.1,
        recommendAutoPause: false,
        message: "Impressão sem alterações. Geometria das camadas está 100% alinhada.",
        snapshotUrl: `/api/telemetry/camera/${printerId}/snapshot.jpg`,
      };

  const durationMs = Math.round(performance.now() - start);

  logger.info(`[AIVision] Análise de visão computacional concluída para ${printerName}`, {
    action: "ai_vision_analyzed",
    durationMs,
    metadata: { printerId, defect: result.detectedDefect, failureProbability: result.failureProbabilityPercent },
  });

  return result;
}
