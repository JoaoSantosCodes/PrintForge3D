import { logger } from "@/lib/logger";

export interface DigitalPassportData {
  passportId: string;
  publicUrl: string;
  pieceName: string;
  stlVersion: string;
  filamentMaterial: string;
  filamentBatch: string;
  printerName: string;
  operatorName: string;
  manufacturedAt: string;
  qualityScore: number;
  warrantyCode: string;
  compatibleSpareParts: string[];
}

export async function generatePieceDigitalPassport(pieceId: string): Promise<DigitalPassportData> {
  const start = performance.now();

  const passportId = `PASS-${pieceId.toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const data: DigitalPassportData = {
    passportId,
    publicUrl: `https://printforge.app/passport/${passportId}`,
    pieceName: "Engrenagem Helicoidal M1.5 Industrial",
    stlVersion: "engrenagem_m1.5_v2.stl",
    filamentMaterial: "PETG Branco High-Speed",
    filamentBatch: "LOTE-2026-07-PETG-WHT-012",
    printerName: "Voron 2.4 #03",
    operatorName: "Carlos Silva (Operador #03)",
    manufacturedAt: new Date().toISOString(),
    qualityScore: 98.4,
    warrantyCode: "CERT-PF3D-9921-2026",
    compatibleSpareParts: ["Eixo M6 Aço Inox", "Rolamento 608ZZ", "Anel O-Ring Viton"],
  };

  const durationMs = Math.round(performance.now() - start);

  logger.info(`[DigitalPassport] Passaporte digital gerado (${passportId}) para a peça ${pieceId}`, {
    action: "digital_passport_generated",
    durationMs,
    metadata: { passportId, publicUrl: data.publicUrl, qualityScore: data.qualityScore },
  });

  return data;
}
