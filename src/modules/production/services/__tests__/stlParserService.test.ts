import { describe, it, expect } from 'vitest';
import { analisarSTLBuffer, calcularPesoEstimado } from '../stlParserService';

describe('stlParserService - Cálculo de Volume e Massa STL', () => {
  it('deve calcular o peso estimado corretamente para PLA', () => {
    const peso = calcularPesoEstimado(10, 'PLA'); // 10 cm³ * 1.24 g/cm³ = 12.4g
    expect(peso).toBe(12.4);
  });

  it('deve calcular o peso estimado corretamente para PETG e ABS', () => {
    expect(calcularPesoEstimado(100, 'PETG')).toBe(127); // 100 * 1.27
    expect(calcularPesoEstimado(100, 'ABS')).toBe(104);  // 100 * 1.04
  });

  it('deve analisar um buffer de STL binário e retornar volume e bounding box', () => {
    // Criar um STL Binário simulado (Cube 10x10x10 mm = 1000 mm³ = 1.0 cm³)
    // Header 80 bytes + 4 bytes uint32 (12 triângulos para um cubo) + 12 * 50 bytes = 684 bytes
    const buffer = new ArrayBuffer(684);
    const view = new DataView(buffer);
    
    // Total de triângulos: 12
    view.setUint32(80, 12, true);

    // 12 triângulos do cubo (2 triângulos por face)
    const triangulos = [
      // Frente (z = 10)
      [[0, 0, 10], [10, 0, 10], [10, 10, 10]],
      [[0, 0, 10], [10, 10, 10], [0, 10, 10]],
      // Trás (z = 0)
      [[0, 0, 0], [10, 10, 0], [10, 0, 0]],
      [[0, 0, 0], [0, 10, 0], [10, 10, 0]],
      // Esquerda (x = 0)
      [[0, 0, 0], [0, 0, 10], [0, 10, 10]],
      [[0, 0, 0], [0, 10, 10], [0, 10, 0]],
      // Direita (x = 10)
      [[10, 0, 0], [10, 10, 10], [10, 0, 10]],
      [[10, 0, 0], [10, 10, 0], [10, 10, 10]],
      // Topo (y = 10)
      [[0, 10, 0], [0, 10, 10], [10, 10, 10]],
      [[0, 10, 0], [10, 10, 10], [10, 10, 0]],
      // Fundo (y = 0)
      [[0, 0, 0], [10, 0, 10], [0, 0, 10]],
      [[0, 0, 0], [10, 0, 0], [10, 0, 10]],
    ];

    let offset = 84;
    for (const t of triangulos) {
      // Normal fictícia (0, 0, 0)
      view.setFloat32(offset, 0, true);
      view.setFloat32(offset + 4, 0, true);
      view.setFloat32(offset + 8, 0, true);
      offset += 12;

      // Vertices
      for (const v of t) {
        view.setFloat32(offset, v[0], true);
        view.setFloat32(offset + 4, v[1], true);
        view.setFloat32(offset + 8, v[2], true);
        offset += 12;
      }

      // Attribute byte count
      view.setUint16(offset, 0, true);
      offset += 2;
    }

    const res = analisarSTLBuffer(buffer);

    expect(res.isBinary).toBe(true);
    expect(res.facetsCount).toBe(12);
    expect(res.boundingBox.widthMm).toBe(10);
    expect(res.boundingBox.depthMm).toBe(10);
    expect(res.boundingBox.heightMm).toBe(10);
    expect(res.volumeCm3).toBe(1); // 10x10x10 mm = 1.0 cm³
    expect(res.estimatedWeightGrams.PLA).toBe(1.24); // 1.0 cm³ * 1.24 g/cm³
  });
});
