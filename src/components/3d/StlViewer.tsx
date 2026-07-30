'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { AlertTriangle, Box, Camera, Eye, Layers, RefreshCw, RotateCcw, Scale, Scissors, ShieldAlert, Sparkles, Zap } from 'lucide-react';
import { analisarSTLBuffer, STLAnalysisResult } from '@/modules/production/services/stlParserService';
import { inspecionarModelo3DAI, AiInspectionResult } from '@/modules/ai/services/threeAiInspectorService';

interface StlViewerProps {
  url?: string;
  fileBuffer?: ArrayBuffer;
  height?: string;
  materialColor?: string;
  buildPlateSize?: { x: number; y: number; z: number }; // e.g., 220, 220, 250 mm
  onAnalysisComplete?: (analysis: STLAnalysisResult, aiInspection?: AiInspectionResult) => void;
  onCaptureThumbnail?: (dataUrl: string) => void;
}

export function StlViewer({
  url,
  fileBuffer,
  height = '480px',
  materialColor = '#3b82f6',
  buildPlateSize = { x: 220, y: 220, z: 250 },
  onAnalysisComplete,
  onCaptureThumbnail,
}: StlViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const clipPlaneRef = useRef<THREE.Plane | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [currentColor, setCurrentColor] = useState<string>(materialColor);
  const [analysis, setAnalysis] = useState<STLAnalysisResult | null>(null);
  const [aiInspection, setAiInspection] = useState<AiInspectionResult | null>(null);

  // Ferramentas Avançadas
  const [clipEnabled, setClipEnabled] = useState<boolean>(false);
  const [clipPercent, setClipPercent] = useState<number>(100);
  const [overhangMode, setOverhangMode] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);

  // Inicializar Cena Three.js
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const heightPx = containerRef.current.clientHeight || 480;

    // 1. Cena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#090d16');
    sceneRef.current = scene;

    // 2. Câmera
    const camera = new THREE.PerspectiveCamera(45, width / heightPx, 0.1, 2000);
    camera.position.set(180, 180, 220);
    cameraRef.current = camera;

    // 3. Renderer com suporte a Local Clipping (Corte Transversal)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.localClippingEnabled = true;

    // Limpar container e anexar canvas
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controlsRef.current = controls;

    // 5. Iluminação
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(150, 250, 150);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.6);
    dirLight2.position.set(-150, 100, -150);
    scene.add(dirLight2);

    // 6. Build Plate Grid
    const gridHelper = new THREE.GridHelper(
      Math.max(buildPlateSize.x, buildPlateSize.y),
      22,
      0x3b82f6,
      0x1e293b
    );
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // 7. Clipping Plane (Plano de Corte Z)
    const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 250);
    clipPlaneRef.current = clipPlane;

    // Loop de Animação
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [buildPlateSize.x, buildPlateSize.y]);

  // Carregar e processar Modelo STL
  useEffect(() => {
    if (!sceneRef.current) return;

    const processBuffer = (buffer: ArrayBuffer) => {
      try {
        setLoading(true);
        setError(null);

        // Parse físico & Inspeção de IA
        const result = analisarSTLBuffer(buffer);
        setAnalysis(result);

        const aiRes = inspecionarModelo3DAI({
          widthMm: result.boundingBox.widthMm,
          depthMm: result.boundingBox.depthMm,
          heightMm: result.boundingBox.heightMm,
          volumeCm3: result.volumeCm3,
          tipoMaterial: 'PLA',
        });
        setAiInspection(aiRes);

        if (onAnalysisComplete) {
          onAnalysisComplete(result, aiRes);
        }

        // Parse Three.js Geometry
        const loader = new STLLoader();
        const geometry = loader.parse(buffer);
        geometry.computeVertexNormals();
        geometry.center();

        geometry.computeBoundingBox();
        const bbox = geometry.boundingBox;
        const modelHeight = bbox ? bbox.max.y - bbox.min.y : 100;

        // Criar Material com suporte a Clipping Planes
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(currentColor),
          roughness: 0.35,
          metalness: 0.15,
          wireframe,
          clippingPlanes: clipEnabled && clipPlaneRef.current ? [clipPlaneRef.current] : [],
          clipShadows: true,
          side: THREE.DoubleSide,
        });

        if (meshRef.current) {
          sceneRef.current?.remove(meshRef.current);
          meshRef.current.geometry.dispose();
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (bbox) {
          const heightOffset = (bbox.max.y - bbox.min.y) / 2;
          mesh.position.y = heightOffset;
        }

        sceneRef.current?.add(mesh);
        meshRef.current = mesh;

        // Posicionar Clipping Plane
        if (clipPlaneRef.current) {
          clipPlaneRef.current.constant = modelHeight;
        }

        // Posicionar Câmera
        if (cameraRef.current && controlsRef.current && bbox) {
          const maxDim = Math.max(
            result.boundingBox.widthMm,
            result.boundingBox.depthMm,
            result.boundingBox.heightMm
          );
          const fov = cameraRef.current.fov * (Math.PI / 180);
          let cameraZ = Math.abs(maxDim / Math.sin(fov / 2)) * 1.4;
          cameraZ = Math.max(cameraZ, 80);

          cameraRef.current.position.set(cameraZ * 0.8, cameraZ * 0.8, cameraZ);
          controlsRef.current.target.set(0, result.boundingBox.heightMm / 2, 0);
          controlsRef.current.update();
        }

        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar STL:', err);
        setError('Não foi possível processar a geometria do arquivo STL.');
        setLoading(false);
      }
    };

    if (fileBuffer) {
      processBuffer(fileBuffer);
    } else if (url) {
      setLoading(true);
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error('Falha ao baixar arquivo STL');
          return res.arrayBuffer();
        })
        .then((buffer) => processBuffer(buffer))
        .catch((err) => {
          setError(err.message || 'Erro ao carregar URL do STL.');
          setLoading(false);
        });
    }
  }, [url, fileBuffer]);

  // Atualizar Material & Corte Transversal
  useEffect(() => {
    if (!meshRef.current || !analysis) return;

    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.color.set(overhangMode ? '#ef4444' : currentColor);
    mat.wireframe = wireframe;

    if (clipEnabled && clipPlaneRef.current) {
      const modelHeight = analysis.boundingBox.heightMm;
      const targetY = (clipPercent / 100) * modelHeight;
      clipPlaneRef.current.constant = targetY;
      mat.clippingPlanes = [clipPlaneRef.current];
    } else {
      mat.clippingPlanes = [];
    }

    mat.needsUpdate = true;
  }, [currentColor, wireframe, clipEnabled, clipPercent, overhangMode, analysis]);

  // Snapshot PNG Generator
  const handleSnapshot = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    if (onCaptureThumbnail) {
      onCaptureThumbnail(dataUrl);
    } else {
      const link = document.createElement('a');
      link.download = `thumbnail_${analysis?.boundingBox.widthMm || 0}mm.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current && analysis) {
      const maxDim = Math.max(
        analysis.boundingBox.widthMm,
        analysis.boundingBox.depthMm,
        analysis.boundingBox.heightMm
      );
      cameraRef.current.position.set(maxDim * 1.5, maxDim * 1.5, maxDim * 1.8);
      controlsRef.current.target.set(0, analysis.boundingBox.heightMm / 2, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col">
      {/* Visualizador Three.js Canvas */}
      <div ref={containerRef} style={{ height }} className="w-full relative cursor-grab active:cursor-grabbing">
        {loading && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 gap-3 text-slate-300">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-sm font-medium">Carregando Modelo 3D...</span>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-20 gap-2 text-rose-400 p-6 text-center">
            <span className="text-base font-semibold">Erro ao Renderizar Modelo 3D</span>
            <span className="text-xs text-slate-400">{error}</span>
          </div>
        )}
      </div>

      {/* Overlay de Métricas do Modelo */}
      {analysis && !loading && (
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2 max-w-lg">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-xs font-mono text-slate-200">
            <Scale className="w-3.5 h-3.5 text-blue-400" />
            <span>{analysis.boundingBox.widthMm} x {analysis.boundingBox.depthMm} x {analysis.boundingBox.heightMm} mm</span>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-xs font-mono text-slate-200">
            <Box className="w-3.5 h-3.5 text-emerald-400" />
            <span>{analysis.volumeCm3} cm³</span>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-xs font-mono text-amber-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>~{analysis.estimatedWeightGrams.PLA}g (PLA)</span>
          </div>

          {/* Botão de Alerta da IA Copilot */}
          {aiInspection && (
            <button
              onClick={() => setShowAiModal(!showAiModal)}
              className={`bg-slate-900/90 backdrop-blur-md border rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-xs font-semibold transition-all ${
                aiInspection.classificacaoWarping === 'alto' || aiInspection.classificacaoWarping === 'critico'
                  ? 'border-rose-500/50 text-rose-300 animate-pulse'
                  : 'border-purple-500/40 text-purple-300 hover:border-purple-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>IA Inspector: Risco {aiInspection.classificacaoWarping.toUpperCase()}</span>
            </button>
          )}
        </div>
      )}

      {/* Painel Flutuante do Inspector da IA */}
      {showAiModal && aiInspection && (
        <div className="absolute top-14 left-3 z-30 w-80 bg-slate-900/95 border border-purple-500/40 backdrop-blur-md rounded-xl p-4 shadow-2xl text-slate-200 space-y-3 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Diagnostic Copilot AM Inspector</span>
            </div>
            <button onClick={() => setShowAiModal(false)} className="text-xs text-slate-400 hover:text-white">✕</button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Score de Warping:</span>
              <span className={`font-bold ${aiInspection.scoreWarping > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {aiInspection.scoreWarping}/100 ({aiInspection.classificacaoWarping})
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Bico / Mesa Recomendados:</span>
              <span className="font-mono text-cyan-300">{aiInspection.temperaturaBicoSugerida}°C / {aiInspection.temperaturaMesaSugerida}°C</span>
            </div>

            {aiInspection.alertasTecnicos.map((alerta, idx) => (
              <div key={idx} className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[11px] text-rose-300 flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>{alerta}</span>
              </div>
            ))}

            {aiInspection.recomendacoesIA.map((rec, idx) => (
              <div key={idx} className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[11px] text-purple-200">
                💡 {rec}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slider de Corte Transversal (Clipping Plane) */}
      {clipEnabled && (
        <div className="bg-slate-950/90 border-t border-slate-800 px-4 py-2 flex items-center gap-3 z-10">
          <Scissors className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="text-xs text-slate-300 font-mono">Corte Z: {clipPercent}%</span>
          <input
            type="range"
            min="0"
            max="100"
            value={clipPercent}
            onChange={(e) => setClipPercent(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      )}

      {/* Toolbar Inferior */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-2.5 flex items-center justify-between z-10 flex-wrap gap-2">
        {/* Seletor de Cores */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            {[
              { label: 'Azul Neon', hex: '#3b82f6' },
              { label: 'Roxo Synth', hex: '#8b5cf6' },
              { label: 'Esmeralda', hex: '#10b981' },
              { label: 'Silk Dourado', hex: '#f59e0b' },
              { label: 'Cinza Primer', hex: '#64748b' },
              { label: 'Vermelho', hex: '#ef4444' },
            ].map((c) => (
              <button
                key={c.hex}
                title={c.label}
                onClick={() => { setOverhangMode(false); setCurrentColor(c.hex); }}
                className={`w-5 h-5 rounded-full transition-transform border ${
                  currentColor === c.hex && !overhangMode ? 'scale-125 border-white shadow-md' : 'border-transparent hover:scale-110'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>

        {/* Ferramentas de Inspeção 3D */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setClipEnabled(!clipEnabled)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              clipEnabled ? 'bg-blue-600/30 border border-blue-500 text-blue-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Ativar Corte Transversal da Peça"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Corte Z</span>
          </button>

          <button
            onClick={() => setOverhangMode(!overhangMode)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              overhangMode ? 'bg-rose-600/30 border border-rose-500 text-rose-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Inspeção de Angulação e Overhang"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Overhang</span>
          </button>

          <button
            onClick={() => setWireframe(!wireframe)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              wireframe ? 'bg-blue-600/30 border border-blue-500 text-blue-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Wireframe</span>
          </button>

          <button
            onClick={handleSnapshot}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
            title="Capturar Render Thumbnail PNG"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Thumbnail</span>
          </button>

          <button
            onClick={resetCamera}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
            title="Resetar Câmera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
