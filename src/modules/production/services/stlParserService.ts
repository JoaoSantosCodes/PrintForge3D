export interface STLAnalysisResult {
  volumeMm3: number;
  volumeCm3: number;
  facetsCount: number;
  boundingBox: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
    widthMm: number;
    depthMm: number;
    heightMm: number;
  };
  estimatedWeightGrams: Record<string, number>; // e.g., { PLA: 12.4, PETG: 12.7, ABS: 10.4 }
  isBinary: boolean;
}

// Densidades padrão em g/cm³
export const DENSIDADES_MATERIAIS: Record<string, number> = {
  PLA: 1.24,
  PETG: 1.27,
  ABS: 1.04,
  ASA: 1.07,
  RESINA_PADRAO: 1.15,
  TPU: 1.21,
};

/**
 * Calcula o peso estimado em gramas para uma peça dado seu volume em cm³ e tipo de material.
 */
export function calcularPesoEstimado(volumeCm3: number, tipoMaterial: string = 'PLA'): number {
  const densidade = DENSIDADES_MATERIAIS[tipoMaterial.toUpperCase()] ?? DENSIDADES_MATERIAIS.PLA;
  return Number((volumeCm3 * densidade).toFixed(2));
}

/**
 * Analisa um ArrayBuffer de um arquivo STL (Binário ou ASCII) e extrai métricas físicas.
 */
export function analisarSTLBuffer(buffer: ArrayBuffer): STLAnalysisResult {
  const isBinary = checarSeEBinario(buffer);

  if (isBinary) {
    return parseSTLBinary(buffer);
  } else {
    return parseSTLAscii(buffer);
  }
}

function checarSeEBinario(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 84) return false;

  const dataView = new DataView(buffer);
  const totalTriangulos = dataView.getUint32(80, true);
  const tamanhoEsperadoBinario = 84 + totalTriangulos * 50;

  if (buffer.byteLength === tamanhoEsperadoBinario) return true;

  const decoder = new TextDecoder('utf-8');
  const cabecalhoTexto = decoder.decode(buffer.slice(0, 80));
  
  if (cabecalhoTexto.startsWith('solid') && !cabecalhoTexto.includes('\x00')) {
    const corpoAmostra = decoder.decode(buffer.slice(0, Math.min(buffer.byteLength, 500)));
    if (corpoAmostra.includes('facet') && corpoAmostra.includes('vertex')) {
      return false;
    }
  }

  return true;
}

function parseSTLBinary(buffer: ArrayBuffer): STLAnalysisResult {
  const dataView = new DataView(buffer);
  const totalTriangulos = dataView.getUint32(80, true);

  let volumeTotalSigned = 0;
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  let offset = 84;
  for (let i = 0; i < totalTriangulos; i++) {
    offset += 12;

    const v1x = dataView.getFloat32(offset, true);
    const v1y = dataView.getFloat32(offset + 4, true);
    const v1z = dataView.getFloat32(offset + 8, true);

    const v2x = dataView.getFloat32(offset + 12, true);
    const v2y = dataView.getFloat32(offset + 16, true);
    const v2z = dataView.getFloat32(offset + 20, true);

    const v3x = dataView.getFloat32(offset + 24, true);
    const v3y = dataView.getFloat32(offset + 28, true);
    const v3z = dataView.getFloat32(offset + 32, true);

    offset += 36;
    offset += 2;

    minX = Math.min(minX, v1x, v2x, v3x);
    maxX = Math.max(maxX, v1x, v2x, v3x);
    minY = Math.min(minY, v1y, v2y, v3y);
    maxY = Math.max(maxY, v1y, v2y, v3y);
    minZ = Math.min(minZ, v1z, v2z, v3z);
    maxZ = Math.max(maxZ, v1z, v2z, v3z);

    const v321 = v3x * v2y * v1z;
    const v231 = v2x * v3y * v1z;
    const v312 = v3x * v1y * v2z;
    const v132 = v1x * v3y * v2z;
    const v213 = v2x * v1y * v3z;
    const v123 = v1x * v2y * v3z;

    volumeTotalSigned += (-v321 + v231 + v312 - v132 - v213 + v123) / 6.0;
  }

  const volumeMm3 = Math.abs(volumeTotalSigned);
  const volumeCm3 = Number((volumeMm3 / 1000).toFixed(3));

  const widthMm = Number((maxX - minX).toFixed(2));
  const depthMm = Number((maxY - minY).toFixed(2));
  const heightMm = Number((maxZ - minZ).toFixed(2));

  const estimatedWeightGrams: Record<string, number> = {};
  for (const [mat, dens] of Object.entries(DENSIDADES_MATERIAIS)) {
    estimatedWeightGrams[mat] = Number((volumeCm3 * dens).toFixed(2));
  }

  return {
    volumeMm3: Number(volumeMm3.toFixed(2)),
    volumeCm3,
    facetsCount: totalTriangulos,
    boundingBox: {
      minX, maxX, minY, maxY, minZ, maxZ,
      widthMm, depthMm, heightMm,
    },
    estimatedWeightGrams,
    isBinary: true,
  };
}

function parseSTLAscii(buffer: ArrayBuffer): STLAnalysisResult {
  const decoder = new TextDecoder('utf-8');
  const text = decoder.decode(buffer);

  const vertexPattern = /vertex\s+([\d.\-eE]+)\s+([\d.\-eE]+)\s+([\d.\-eE]+)/gi;
  const vertices: { x: number; y: number; z: number }[] = [];

  let match: RegExpExecArray | null;
  while ((match = vertexPattern.exec(text)) !== null) {
    vertices.push({
      x: parseFloat(match[1]),
      y: parseFloat(match[2]),
      z: parseFloat(match[3]),
    });
  }

  let volumeTotalSigned = 0;
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  const facetsCount = Math.floor(vertices.length / 3);

  for (let i = 0; i < facetsCount; i++) {
    const v1 = vertices[i * 3];
    const v2 = vertices[i * 3 + 1];
    const v3 = vertices[i * 3 + 2];

    minX = Math.min(minX, v1.x, v2.x, v3.x);
    maxX = Math.max(maxX, v1.x, v2.x, v3.x);
    minY = Math.min(minY, v1.y, v2.y, v3.y);
    maxY = Math.max(maxY, v1.y, v2.y, v3.y);
    minZ = Math.min(minZ, v1.z, v2.z, v3.z);
    maxZ = Math.max(maxZ, v1.z, v2.z, v3.z);

    const v321 = v3.x * v2.y * v1.z;
    const v231 = v2.x * v3.y * v1.z;
    const v312 = v3.x * v1.y * v2.z;
    const v132 = v1.x * v3.y * v2.z;
    const v213 = v2.x * v1.y * v3.z;
    const v123 = v1.x * v2.y * v3.z;

    volumeTotalSigned += (-v321 + v231 + v312 - v132 - v213 + v123) / 6.0;
  }

  const volumeMm3 = Math.abs(volumeTotalSigned);
  const volumeCm3 = Number((volumeMm3 / 1000).toFixed(3));

  const widthMm = Number((maxX - minX).toFixed(2));
  const depthMm = Number((maxY - minY).toFixed(2));
  const heightMm = Number((maxZ - minZ).toFixed(2));

  const estimatedWeightGrams: Record<string, number> = {};
  for (const [mat, dens] of Object.entries(DENSIDADES_MATERIAIS)) {
    estimatedWeightGrams[mat] = Number((volumeCm3 * dens).toFixed(2));
  }

  return {
    volumeMm3: Number(volumeMm3.toFixed(2)),
    volumeCm3,
    facetsCount,
    boundingBox: {
      minX, maxX, minY, maxY, minZ, maxZ,
      widthMm, depthMm, heightMm,
    },
    estimatedWeightGrams,
    isBinary: false,
  };
}
