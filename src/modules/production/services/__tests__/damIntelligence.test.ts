import { describe, it, expect } from 'vitest';
import { calcularFingerprintSHA256, formatarHashCurto } from '../assetHashService';
import { analisar3MFBuffer } from '../threeMfParserService';
import { analisarGCodeProfundo } from '../gcodeIntelligenceService';
import { inspecionarModelo3DAI } from '@/modules/ai/services/threeAiInspectorService';

describe('Digital Asset Management (DAM) & 3D Intelligence Engine', () => {
  it('deve gerar fingerprint SHA-256 válido a partir de um ArrayBuffer', async () => {
    const encoder = new TextEncoder();
    const buffer = encoder.encode('PRINTFORGE_3D_ASSET_DATA').buffer;

    const hash = await calcularFingerprintSHA256(buffer);
    expect(hash).toBeDefined();
    expect(hash.length).toBe(64); // SHA-256 gera string hex de 64 caracteres

    const hashCurto = formatarHashCurto(hash, 8);
    expect(hashCurto.length).toBe(19); // 8 + 3(...) + 8 = 19
  });

  it('deve extrair metadados e slicer de um arquivo .3MF simulado', () => {
    const xmlSimulado = `
      <model unit="millimeter" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">
        <metadata name="Title">Busto Cyberpunk V2</metadata>
        <metadata name="Designer">PrintForge Studio</metadata>
        <resources>
          <object id="1" name="Modelo">
            <mesh>
              <vertices>
                <vertex x="0" y="0" z="0" />
                <vertex x="50" y="0" z="0" />
                <vertex x="50" y="50" z="40" />
              </vertices>
              <triangles>
                <triangle v1="0" v2="1" v3="2" />
              </triangles>
            </mesh>
          </object>
        </resources>
        <metadata name="BambuStudio:Version">1.09</metadata>
      </model>
    `;
    const encoder = new TextEncoder();
    const buffer = encoder.encode(xmlSimulado).buffer;

    const res = analisar3MFBuffer(buffer);
    expect(res.is3MF).toBe(true);
    expect(res.titulo).toBe('Busto Cyberpunk V2');
    expect(res.autor).toBe('PrintForge Studio');
    expect(res.slicerDetectado).toBe('Bambu Studio');
    expect(res.boundingBox.widthMm).toBe(50);
    expect(res.boundingBox.heightMm).toBe(40);
  });

  it('deve extrair telemetria profunda de um arquivo .gcode', () => {
    const gcodeText = `
      ; Slicer: OrcaSlicer 2.1
      ; estimated printing time = 1h 45m
      ; filament used [g] = 42.5
      M104 S220 ; Nozzle Temp
      M140 S60  ; Bed Temp
      M106 S255 ; Fan 100%
      G1 X10 Y10 Z0.2 F1200
      G1 X110 Y110 Z35.0 F3000 E15.4
      ; LAYER: 175
      ; COLOR_CHANGE
    `;

    const res = analisarGCodeProfundo(gcodeText);
    expect(res.slicerName).toBe('OrcaSlicer');
    expect(res.nozzleTempC).toBe(220);
    expect(res.bedTempC).toBe(60);
    expect(res.maxFanSpeedPercent).toBe(100);
    expect(res.maxZHeightMm).toBe(35);
    expect(res.colorChangesCount).toBe(1);
    expect(res.boundingBox.widthMm).toBe(100);
  });

  it('deve inspecionar modelo 3D com IA e alertar sobre risco de warping em ABS sem câmara', () => {
    const aiRes = inspecionarModelo3DAI({
      widthMm: 180,
      depthMm: 180,
      heightMm: 25,
      volumeCm3: 150,
      tipoMaterial: 'ABS',
      possuiEnclosure: false,
    });

    expect(aiRes.scoreWarping).toBeGreaterThan(60); // Risco alto/crítico
    expect(aiRes.usarEnclosureRecomendado).toBe(true);
    expect(aiRes.usarBrimOuRaftRecomendado).toBe(true);
    expect(aiRes.alertasTecnicos.length).toBeGreaterThan(0);
  });
});
