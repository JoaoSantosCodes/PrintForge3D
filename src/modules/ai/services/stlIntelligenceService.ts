import { logger } from "@/lib/logger";

export interface STLAnalysisRequest {
  filename: string;
  volumeCm3: number;
  boundingBoxMm: { x: number; y: number; z: number };
  infillPercent?: number;
  materialType?: "PLA" | "PETG" | "ABS" | "TPU" | "Resina";
  layerHeightMm?: number;
}

export interface STLIntelligenceAnalysis {
  filename: string;
  complexidade: "baixa" | "media" | "alta" | "critica";
  densidadeSuportesSugeridaPercent: number;
  orientacaoMesaRecomendada: string;
  materialRecomendado: string;
  pesoEstimadoGramas: number;
  tempoEstimadoHoras: number;
  probabilidadeFalhaPercent: number;
  precoSugeridoBRL: number;
  margemLucroEstimadaPercent: number;
  consumoEnergiaKwh: number;
  insightsIA: string[];
}

export async function analisarGeometriaSTL(
  request: STLAnalysisRequest
): Promise<STLIntelligenceAnalysis> {
  const start = performance.now();
  const { volumeCm3, boundingBoxMm, infillPercent = 15, materialType = "PLA" } = request;

  // Densidade aproximada dos materiais em g/cm3
  const densidadeMaterial: Record<string, number> = {
    PLA: 1.24,
    PETG: 1.27,
    ABS: 1.04,
    TPU: 1.21,
    Resina: 1.15,
  };

  const densidade = densidadeMaterial[materialType] || 1.24;
  
  // Cálculo de peso com infill + casca externa estimada (20% peso fixo de parede)
  const pesoEstimadoGramas = Math.round((volumeCm3 * (infillPercent / 100 + 0.2)) * densidade * 10) / 10;

  // Estimativa de altura Z e tempo de impressão
  const maxDim = Math.max(boundingBoxMm.x, boundingBoxMm.y, boundingBoxMm.z);
  const ratioVolumeBox = volumeCm3 / ((boundingBoxMm.x * boundingBoxMm.y * boundingBoxMm.z) / 1000);

  let complexidade: STLIntelligenceAnalysis["complexidade"] = "media";
  let probabilidadeFalha = 5;

  if (maxDim > 200 || ratioVolumeBox < 0.15) {
    complexidade = "alta";
    probabilidadeFalha = 15;
  } else if (maxDim > 280 || ratioVolumeBox < 0.08) {
    complexidade = "critica";
    probabilidadeFalha = 25;
  } else if (maxDim < 80 && ratioVolumeBox > 0.4) {
    complexidade = "baixa";
    probabilidadeFalha = 2;
  }

  // Estimativa de horas (baseado na vazão de 15g/hora em FDM)
  const tempoEstimadoHoras = Math.max(0.5, Math.round((pesoEstimadoGramas / 18) * 10) / 10);

  // Estimativa de custos e precificação inteligente
  const custoFilamento = (110 / 1000) * pesoEstimadoGramas; // R$ 110/kg
  const consumoEnergiaKwh = Math.round(0.25 * tempoEstimadoHoras * 100) / 100;
  const custoEnergia = consumoEnergiaKwh * 0.85; // R$ 0.85/kWh
  const custoTotal = custoFilamento + custoEnergia;

  // Margem dinâmica sugerida conforme complexidade
  const margemLucro = complexidade === "critica" ? 180 : complexidade === "alta" ? 120 : 80;
  const precoSugeridoBRL = Math.round(custoTotal * (1 + margemLucro / 100) * 100) / 100;

  const insightsIA: string[] = [
    `Geometria com rácio de preenchimento de ${(ratioVolumeBox * 100).toFixed(1)}% em relação à caixa delimitadora.`,
    complexidade === "alta" || complexidade === "critica"
      ? "Recomendado aplicar suporte tipo árvore para reduzir marcas na peça."
      : "Peça autossustentável com excelente estabilidade de mesa.",
    `Tempo estimado de impressão: ${tempoEstimadoHoras}h utilizando bico 0.4mm.`,
  ];

  const durationMs = Math.round(performance.now() - start);

  logger.info(`[STL Intelligence AI] Análise concluída para ${request.filename}`, {
    action: "stl_ai_analysis",
    durationMs,
    metadata: { filename: request.filename, complexidade, precoSugeridoBRL },
  });

  return {
    filename: request.filename,
    complexidade,
    densidadeSuportesSugeridaPercent: complexidade === "critica" ? 25 : complexidade === "alta" ? 15 : 5,
    orientacaoMesaRecomendada: boundingBoxMm.z > boundingBoxMm.x ? "Rotacionar 90° em X para maior aderência à mesa" : "Orientação Z padrão ideal",
    materialRecomendado: materialType,
    pesoEstimadoGramas,
    tempoEstimadoHoras,
    probabilidadeFalhaPercent: probabilidadeFalha,
    precoSugeridoBRL: Math.max(15.0, precoSugeridoBRL),
    margemLucroEstimadaPercent: margemLucro,
    consumoEnergiaKwh,
    insightsIA,
  };
}
