export * from "@/lib/custos";
import { calcularCustoPeca, DetalhamentoCustos } from "@/lib/custos";
import { STLAnalysisResult, calcularPesoEstimado } from "./stlParserService";

export interface STLParamsCalculo {
  stlAnalysis: STLAnalysisResult;
  tipoMaterial?: string; // 'PLA', 'PETG', etc.
  precoPorKg: number;
  tempoHoras: number;
  consumoWatts?: number;
  tarifaEnergiaKwh?: number;
  precoImpressora?: number;
  vidaUtilHoras?: number;
  valorHoraPintura?: number;
  tempoHoraPintura?: number;
  custoTintas?: number;
  custoEmbalagem?: number;
  margemDesejadaPercentual?: number;
}

/**
 * Conecta o resultado da análise física do STL à calculadora central de custos do PrintForge 3D
 */
export function calcularCustoPorSTL({
  stlAnalysis,
  tipoMaterial = 'PLA',
  precoPorKg,
  tempoHoras,
  consumoWatts = 200, // Padrão impressora FDM média (200W)
  tarifaEnergiaKwh = 0.95, // Padrão BRL por KWh
  precoImpressora = 3500,
  vidaUtilHoras = 5000,
  valorHoraPintura = 0,
  tempoHoraPintura = 0,
  custoTintas = 0,
  custoEmbalagem = 0,
  margemDesejadaPercentual = 50,
}: STLParamsCalculo): DetalhamentoCustos & { pesoGramasCalculado: number } {
  const pesoGramasCalculado = stlAnalysis.estimatedWeightGrams[tipoMaterial.toUpperCase()] ?? 
    calcularPesoEstimado(stlAnalysis.volumeCm3, tipoMaterial);

  const custos = calcularCustoPeca({
    material: {
      precoPorKg,
      pesoGramas: pesoGramasCalculado,
    },
    energia: {
      consumoWatts,
      tempoHoras,
      tarifaEnergiaKwh,
    },
    depreciacao: {
      precoImpressora,
      vidaUtilHoras,
      tempoHoras,
    },
    pintura: {
      tempoHoras: tempoHoraPintura,
      valorHoraMaoDeObra: valorHoraPintura,
      custoTintas,
    },
    embalagem: {
      custoUnitario: custoEmbalagem,
    },
    margemDesejadaPercentual,
  });

  return {
    ...custos,
    pesoGramasCalculado,
  };
}
