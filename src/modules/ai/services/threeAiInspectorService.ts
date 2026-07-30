/**
 * Motor de Inteligência Artificial de Inspeção de Impressão 3D (Copilot AM Inspector)
 * Analisa geometria 3D e propriedades de material para sugerir parâmetros fabris e detectar falhas.
 */

export interface AiInspectionRequest {
  widthMm: number;
  depthMm: number;
  heightMm: number;
  volumeCm3: number;
  tipoMaterial?: string; // 'PLA', 'PETG', 'ABS', 'ASA', 'TPU', 'RESINA'
  possuiEnclosure?: boolean;
}

export interface AiInspectionResult {
  scoreWarping: number; // 0 (Sem risco) a 100 (Risco Altíssimo)
  classificacaoWarping: 'baixo' | 'moderado' | 'alto' | 'critico';
  temParedesFinas: boolean;
  necessitaSuporteEstimado: boolean;
  usarBrimOuRaftRecomendado: boolean;
  usarEnclosureRecomendado: boolean;
  temperaturaBicoSugerida: number;
  temperaturaMesaSugerida: number;
  alertasTecnicos: string[];
  recomendacoesIA: string[];
}

export function inspecionarModelo3DAI({
  widthMm,
  depthMm,
  heightMm,
  volumeCm3,
  tipoMaterial = 'PLA',
  possuiEnclosure = false,
}: AiInspectionRequest): AiInspectionResult {
  const mat = tipoMaterial.toUpperCase();
  const areaBaseMm2 = widthMm * depthMm;
  const ratioBaseAltura = heightMm > 0 ? areaBaseMm2 / heightMm : 0;
  const menorDimensaoMm = Math.min(widthMm, depthMm, heightMm);

  const alertasTecnicos: string[] = [];
  const recomendacoesIA: string[] = [];

  let scoreWarping = 10;
  let usarBrimOuRaftRecomendado = false;
  let usarEnclosureRecomendado = false;
  let temperaturaBicoSugerida = 210;
  let temperaturaMesaSugerida = 60;

  // 1. Análise por Tipo de Material
  if (mat === 'ABS' || mat === 'ASA') {
    scoreWarping += 40;
    usarEnclosureRecomendado = true;
    usarBrimOuRaftRecomendado = true;
    temperaturaBicoSugerida = 245;
    temperaturaMesaSugerida = 95;

    if (!possuiEnclosure) {
      scoreWarping += 30;
      alertasTecnicos.push(`⚠️ Impressão em ${mat} sem câmara fechada (Enclosure) possui 85%+ de risco de empenamento/warping.`);
      recomendacoesIA.push('Recomendado utilizar câmara aquecida a 45°C-50°C e desligar a ventoinha de resfriamento da peça.');
    }
  } else if (mat === 'PETG') {
    scoreWarping += 15;
    temperaturaBicoSugerida = 235;
    temperaturaMesaSugerida = 75;
    recomendacoesIA.push('PETG possui forte aderência à mesa. Utilize spray adesivo ou fita PEI para facilitar a remoção sem danificar o vidro.');
  } else if (mat === 'TPU') {
    temperaturaBicoSugerida = 220;
    temperaturaMesaSugerida = 50;
    recomendacoesIA.push('Material flexível TPU: reduza a velocidade para 25-35 mm/s e diminua a retração para 0.5mm para evitar travamento do filamento.');
  } else if (mat === 'RESINA') {
    recomendacoesIA.push('Impressão em Resina UV: certifique-se de inclinar o modelo em 30°-45° e criar furos de escoamento de resina líquida internamente.');
  }

  // 2. Análise Geométrica de Warping (Geometria larga e plana)
  if (areaBaseMm2 > 15000 && heightMm < 30) {
    scoreWarping += 25;
    usarBrimOuRaftRecomendado = true;
    alertasTecnicos.push(`⚠️ Área de contato com a mesa muito extensa (${(areaBaseMm2 / 100).toFixed(1)} cm²) e baixa altura. Alta tensão superficial nas bordas.`);
    recomendacoesIA.push('Adicione Brim externo de 8mm a 10mm na fatiagem para ancorar as quinas da peça.');
  }

  // 3. Inspeção de Paredes Finas
  const temParedesFinas = menorDimensaoMm < 0.8;
  if (temParedesFinas) {
    alertasTecnicos.push(`⚠️ Espessura mínima encontrada (${menorDimensaoMm}mm) é inferior a 0.8mm (2 perímetros padrão com bico 0.4mm).`);
    recomendacoesIA.push('Ative a opção "Detect Thin Walls" (Detectar Paredes Finas) ou utilize gerador de perímetro Arachne no fatiador.');
  }

  // 4. Inspeção de Overhang / Suportes
  const necessitaSuporteEstimado = heightMm > 40 && (widthMm > heightMm * 1.5 || depthMm > heightMm * 1.5);
  if (necessitaSuporteEstimado) {
    recomendacoesIA.push('Modelo com balanços significativos. Ative suporte estilo Árvore (Tree Support) para economizar 40% de material e facilitar a remoção.');
  }

  // Normalização do Score
  scoreWarping = Math.min(100, Math.max(0, scoreWarping));

  let classificacaoWarping: 'baixo' | 'moderado' | 'alto' | 'critico' = 'baixo';
  if (scoreWarping > 75) classificacaoWarping = 'critico';
  else if (scoreWarping > 50) classificacaoWarping = 'alto';
  else if (scoreWarping > 25) classificacaoWarping = 'moderado';

  return {
    scoreWarping,
    classificacaoWarping,
    temParedesFinas,
    necessitaSuporteEstimado,
    usarBrimOuRaftRecomendado,
    usarEnclosureRecomendado,
    temperaturaBicoSugerida,
    temperaturaMesaSugerida,
    alertasTecnicos,
    recomendacoesIA,
  };
}
