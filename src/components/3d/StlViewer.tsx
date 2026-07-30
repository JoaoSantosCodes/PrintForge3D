'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { Box, Eye, Layers, Maximize2, RefreshCw, RotateCcw, Scale, Zap } from 'lucide-react';
import { analisarSTLBuffer, STLAnalysisResult } from '@/modules/production/services/stlParserService';

interface StlViewerProps {
  url?: string;
  fileBuffer?: ArrayBuffer;
  height?: string;
  materialColor?: string;
  buildPlateSize?: { x: number; y: number; z: number }; // e.g., 220, 220, 250 mm
  onAnalysisComplete?: (analysis: STLAnalysisResult) => void;
}

export function StlViewer({
  url,
  fileBuffer,
  height = '450px',
  materialColor = '#3b82f6',
  buildPlateSize = { x: 220, y: 220, z: 250 },
  onAnalysisComplete,
}: StlViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [currentColor, setCurrentColor] = useState<string>(materialColor);
  const [analysis, setAnalysis] = useState<STLAnalysisResult | null>(null);

  // Inicializar Cena Three.js
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const heightPx = containerRef.current.clientHeight || 450;

    // 1. Cena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#090d16');
    sceneRef.current = scene;

    // 2. Câmera
    const camera = new THREE.PerspectiveCamera(45, width / heightPx, 0.1, 2000);
    camera.position.set(180, 180, 220);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Limpar container e anexar canvas
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Não afundar abaixo da mesa
    controlsRef.current = controls;

    // 5. Iluminação
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(150, 250, 150);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.6); // Luz rim azul neon
    dirLight2.position.set(-150, 100, -150);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xa855f7, 0.5, 300); // Highlight roxo
    pointLight.position.set(0, 150, 0);
    scene.add(pointLight);

    // 6. Mesa de Impressão (Build Plate Grid)
    const gridHelper = new THREE.GridHelper(
      Math.max(buildPlateSize.x, buildPlateSize.y),
      22,
      0x3b82f6,
      0x1e293b
    );
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // 7. Animação Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 450;
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

        // Parse físico
        const result = analisarSTLBuffer(buffer);
        setAnalysis(result);
        if (onAnalysisComplete) {
          onAnalysisComplete(result);
        }

        // Parse Three.js Geometry
        const loader = new STLLoader();
        const geometry = loader.parse(buffer);
        geometry.computeVertexNormals();
        geometry.center(); // Centralizar na origem

        // Criar Material & Mesh
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(currentColor),
          roughness: 0.35,
          metalness: 0.15,
          wireframe,
        });

        // Remover mesh anterior se houver
        if (meshRef.current) {
          sceneRef.current?.remove(meshRef.current);
          meshRef.current.geometry.dispose();
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Ajustar altura para que o fundo da peça toque a mesa (Y = 0)
        geometry.computeBoundingBox();
        if (geometry.boundingBox) {
          const heightOffset = (geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2;
          mesh.position.y = heightOffset;
        }

        sceneRef.current?.add(mesh);
        meshRef.current = mesh;

        // Posicionar câmera para enquadrar perfeitamente
        if (cameraRef.current && controlsRef.current && geometry.boundingBox) {
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

  // Atualizar Material Cor/Wireframe
  useEffect(() => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.color.set(currentColor);
      mat.wireframe = wireframe;
      mat.needsUpdate = true;
    }
  }, [currentColor, wireframe]);

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
            <span className="text-sm font-medium">Processando Geometria 3D...</span>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-20 gap-2 text-rose-400 p-6 text-center">
            <span className="text-base font-semibold">Erro ao Renderizar STL</span>
            <span className="text-xs text-slate-400">{error}</span>
          </div>
        )}
      </div>

      {/* Overlay de Estatísticas do Modelo (Badges Neon) */}
      {analysis && !loading && (
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2 max-w-md">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-xs font-mono text-slate-200">
            <Scale className="w-3.5 h-3.5 text-blue-400" />
            <span>
              {analysis.boundingBox.widthMm} x {analysis.boundingBox.depthMm} x {analysis.boundingBox.heightMm} mm
            </span>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-xs font-mono text-slate-200">
            <Box className="w-3.5 h-3.5 text-emerald-400" />
            <span>{analysis.volumeCm3} cm³</span>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-xs font-mono text-amber-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>~{analysis.estimatedWeightGrams.PLA}g (PLA)</span>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-xs font-mono text-purple-300">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>{analysis.facetsCount.toLocaleString()} Polígonos</span>
          </div>
        </div>
      )}

      {/* Barra de Ferramentas / Controls */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-2.5 flex items-center justify-between z-10">
        {/* Seletor de Cores do Material */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Material:</span>
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
                onClick={() => setCurrentColor(c.hex)}
                className={`w-5 h-5 rounded-full transition-transform border ${
                  currentColor === c.hex ? 'scale-125 border-white shadow-md' : 'border-transparent hover:scale-110'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              wireframe
                ? 'bg-blue-600/30 border border-blue-500 text-blue-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Wireframe</span>
          </button>

          <button
            onClick={resetCamera}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
            title="Resetar Posição da Câmera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Recentralizar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
