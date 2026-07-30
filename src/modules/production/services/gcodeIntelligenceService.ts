/**
 * G-Code Intelligence Engine para Manufatura Aditiva
 * Extrai telemetria profunda e parâmetros operacionais de arquivos .gcode
 */

export interface GCodeTelemetryResult {
  slicerName?: string;
  slicerVersion?: string;
  totalLayers: number;
  maxZHeightMm: number;
  nozzleTempC: number;
  bedTempC: number;
  maxFanSpeedPercent: number;
  retractionDistanceMm?: number;
  retractionSpeedMmS?: number;
  colorChangesCount: number;
  estimatedPrintTimeHours: number;
  estimatedFilamentGrams: number;
  estimatedFilamentMeters: number;
  maxPrintSpeedMmS: number;
  boundingBox: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    widthMm: number;
    depthMm: number;
    heightMm: number;
  };
}

/**
 * Realiza análise profunda de um texto G-Code para extrair telemetria industrial
 */
export function analisarGCodeProfundo(gcodeContent: string): GCodeTelemetryResult {
  const lines = gcodeContent.split('\n');

  let totalLayers = 0;
  let maxZHeightMm = 0;
  let nozzleTempC = 0;
  let bedTempC = 0;
  let maxFanSpeedRaw = 0;
  let colorChangesCount = 0;
  let maxFeedrateF = 0;
  let retractionDistanceMm = 0;

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  let estimatedPrintTimeHours = 0;
  let estimatedFilamentGrams = 0;
  let estimatedFilamentMeters = 0;
  let slicerName = 'G-Code Genérico';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detecção de Slicer em comentários
    if (line.startsWith(';')) {
      const lower = line.toLowerCase();
      if (lower.includes('cura')) slicerName = 'UltiMaker Cura';
      else if (lower.includes('prusaslicer')) slicerName = 'PrusaSlicer';
      else if (lower.includes('bambustudio')) slicerName = 'Bambu Studio';
      else if (lower.includes('orcaslicer')) slicerName = 'OrcaSlicer';

      if (lower.includes('layer:') || lower.includes('layer_num:') || lower.includes('layer ')) {
        totalLayers++;
      }

      if (lower.includes('color_change') || lower.includes('m600')) {
        colorChangesCount++;
      }

      // Tentar extrair tempo estimado dos comentários
      if (lower.includes('estimated printing time') || lower.includes('time:')) {
        const matchTime = lower.match(/(\d+)\s*h\s*(\d+)\s*m/i) || lower.match(/(\d+)\s*s/i);
        if (matchTime) {
          if (matchTime[2]) {
            estimatedPrintTimeHours = parseInt(matchTime[1], 10) + parseInt(matchTime[2], 10) / 60;
          } else {
            estimatedPrintTimeHours = Number((parseInt(matchTime[1], 10) / 3600).toFixed(2));
          }
        }
      }

      // Tentar extrair filamento dos comentários
      if (lower.includes('filament used') || lower.includes('filament_weight')) {
        const matchWeight = lower.match(/([\d.]+)\s*g/i);
        if (matchWeight) {
          estimatedFilamentGrams = parseFloat(matchWeight[1]);
        }
        const matchMeter = lower.match(/([\d.]+)\s*m/i);
        if (matchMeter) {
          estimatedFilamentMeters = parseFloat(matchMeter[1]);
        }
      }
      continue;
    }

    // Leitura de Comandos G-Code
    const tokens = line.split(' ');
    const cmd = tokens[0].toUpperCase();

    // M104 / M109: Temperatura do Bico
    if (cmd === 'M104' || cmd === 'M109') {
      const sMatch = line.match(/S(\d+)/i);
      if (sMatch) nozzleTempC = Math.max(nozzleTempC, parseInt(sMatch[1], 10));
    }

    // M140 / M190: Temperatura da Mesa
    if (cmd === 'M140' || cmd === 'M190') {
      const sMatch = line.match(/S(\d+)/i);
      if (sMatch) bedTempC = Math.max(bedTempC, parseInt(sMatch[1], 10));
    }

    // M106: Velocidade do Ventoinha (Fan) 0-255
    if (cmd === 'M106') {
      const sMatch = line.match(/S(\d+)/i);
      if (sMatch) maxFanSpeedRaw = Math.max(maxFanSpeedRaw, parseInt(sMatch[1], 10));
    }

    // G1 / G0: Movimentos de Extrusão e Posições
    if (cmd === 'G0' || cmd === 'G1') {
      const xMatch = line.match(/X([\d.-]+)/i);
      if (xMatch) {
        const x = parseFloat(xMatch[1]);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }

      const yMatch = line.match(/Y([\d.-]+)/i);
      if (yMatch) {
        const y = parseFloat(yMatch[1]);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }

      const zMatch = line.match(/Z([\d.-]+)/i);
      if (zMatch) {
        maxZHeightMm = Math.max(maxZHeightMm, parseFloat(zMatch[1]));
      }

      const fMatch = line.match(/F([\d.-]+)/i);
      if (fMatch) {
        maxFeedrateF = Math.max(maxFeedrateF, parseFloat(fMatch[1]));
      }

      // Retração E negativa
      const eMatch = line.match(/E(-[\d.]+)/i);
      if (eMatch) {
        retractionDistanceMm = Math.max(retractionDistanceMm, Math.abs(parseFloat(eMatch[1])));
      }
    }
  }

  // Fallbacks razoáveis caso não haja dados em comentários
  if (minX === Infinity) { minX = 0; maxX = 150; }
  if (minY === Infinity) { minY = 0; maxY = 150; }

  const widthMm = Number((maxX - minX).toFixed(2));
  const depthMm = Number((maxY - minY).toFixed(2));
  const heightMm = Number(maxZHeightMm.toFixed(2));
  const maxFanSpeedPercent = Math.min(100, Math.round((maxFanSpeedRaw / 255) * 100));
  const maxPrintSpeedMmS = Math.round(maxFeedrateF / 60);

  return {
    slicerName,
    totalLayers: Math.max(1, totalLayers),
    maxZHeightMm: heightMm,
    nozzleTempC: nozzleTempC || 215,
    bedTempC: bedTempC || 60,
    maxFanSpeedPercent,
    retractionDistanceMm: retractionDistanceMm || 0.8,
    colorChangesCount,
    estimatedPrintTimeHours: estimatedPrintTimeHours || 2.5,
    estimatedFilamentGrams: estimatedFilamentGrams || 75,
    estimatedFilamentMeters: estimatedFilamentMeters || 25,
    maxPrintSpeedMmS: maxPrintSpeedMmS || 150,
    boundingBox: {
      minX, maxX, minY, maxY,
      widthMm, depthMm, heightMm,
    },
  };
}
