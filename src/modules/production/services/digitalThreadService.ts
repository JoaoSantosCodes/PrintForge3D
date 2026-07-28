import { logger } from "@/lib/logger";

export interface DigitalThreadRecord {
  pieceId: string;
  pieceName: string;
  stlFilename: string;
  slicerProfile: string;
  gcodeFilename: string;
  printerId: string;
  printerName: string;
  operatorName: string;
  filamentBatch: string;
  filamentMaterial: string;
  nozzleTempCelsius: number;
  bedTempCelsius: number;
  printDurationMinutes: number;
  inspectionStatus: "approved" | "rejected" | "reworked";
  customerName: string;
  orderId: string;
  warrantyCertificateCode: string;
  createdAt: string;
}

export async function getDigitalThreadForPiece(pieceId: string): Promise<DigitalThreadRecord> {
  const start = performance.now();

  const record: DigitalThreadRecord = {
    pieceId,
    pieceName: "Suporte Articulado Xbox Elite v2",
    stlFilename: "suporte_xbox_v2_v3.stl",
    slicerProfile: "0.20mm Standard @Bambu X1C - PLA",
    gcodeFilename: "suporte_xbox_v2_0.2mm_PLA_X1C_2h45m.gcode",
    printerId: "p1",
    printerName: "Bambu Lab X1-Carbon #01",
    operatorName: "Carlos Silva (Operador #03)",
    filamentBatch: "LOTE-2026-07-PLA-BLK-049",
    filamentMaterial: "PLA Preto Premium",
    nozzleTempCelsius: 215,
    bedTempCelsius: 60,
    printDurationMinutes: 165,
    inspectionStatus: "approved",
    customerName: "TechLab Design Ltda",
    orderId: "PED-142",
    warrantyCertificateCode: "CERT-PF3D-8849-2026",
    createdAt: new Date().toISOString(),
  };

  const durationMs = Math.round(performance.now() - start);

  logger.info(`[DigitalThread] Histórico de rastreabilidade gerado para a peça ${pieceId}`, {
    action: "digital_thread_generated",
    durationMs,
    metadata: { pieceId, warrantyCode: record.warrantyCertificateCode, printer: record.printerName },
  });

  return record;
}
