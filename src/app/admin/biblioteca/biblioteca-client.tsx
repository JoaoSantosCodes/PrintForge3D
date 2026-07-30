'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  Box,
  CheckCircle2,
  FileCode,
  Filter,
  FolderGit2,
  GitBranch,
  Layers,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  UploadCloud,
} from 'lucide-react';
import { StlViewer } from '@/components/3d/StlViewer';
import { calcularFingerprintSHA256, formatarHashCurto } from '@/modules/production/services/assetHashService';
import { analisarSTLBuffer } from '@/modules/production/services/stlParserService';
import { analisar3MFBuffer } from '@/modules/production/services/threeMfParserService';
import { analisarGCodeProfundo } from '@/modules/production/services/gcodeIntelligenceService';
import { inspecionarModelo3DAI } from '@/modules/ai/services/threeAiInspectorService';

interface BibliotecaClientProps {
  initialAssets: any[];
}

export default function BibliotecaClient({ initialAssets }: BibliotecaClientProps) {
  const [assets, setAssets] = useState<any[]>(initialAssets);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('TODOS');
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);

  // State para Upload / Novo Ativo
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadBuffer, setUploadBuffer] = useState<ArrayBuffer | null>(null);
  const [uploadHash, setUploadHash] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [parsedMetadata, setParsedMetadata] = useState<any | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFile(file);
    setDuplicateWarning(null);
    setParsedMetadata(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      setUploadBuffer(buffer);

      // 1. Calcular Hash SHA-256
      const hash = await calcularFingerprintSHA256(buffer);
      setUploadHash(hash);

      // Checar se já existe no acervo
      const existente = assets.find((a) => a.hashSha256 === hash);
      if (existente) {
        setDuplicateWarning(`⚠️ O ativo "${existente.nome}" possui exatamente este mesmo fingerprint SHA-256 (${formatarHashCurto(hash)}).`);
      }

      // 2. Parse específico por extensão
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'stl') {
        const res = analisarSTLBuffer(buffer);
        const ai = inspecionarModelo3DAI({
          widthMm: res.boundingBox.widthMm,
          depthMm: res.boundingBox.depthMm,
          heightMm: res.boundingBox.heightMm,
          volumeCm3: res.volumeCm3,
        });
        setParsedMetadata({ tipo: 'STL', stl: res, ai });
      } else if (ext === '3mf') {
        const res = analisar3MFBuffer(buffer);
        setParsedMetadata({ tipo: '3MF', threeMf: res });
      } else if (ext === 'gcode') {
        const text = new TextDecoder('utf-8').decode(buffer);
        const res = analisarGCodeProfundo(text);
        setParsedMetadata({ tipo: 'GCODE', gcode: res });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSimularCadastroAtivo = () => {
    if (!uploadFile || !uploadHash) return;

    setUploading(true);
    setTimeout(() => {
      const ext = uploadFile.name.split('.').pop()?.toUpperCase() || 'STL';
      const novoAsset = {
        id: `asset_${Date.now()}`,
        nome: uploadFile.name.replace(/\.[^/.]+$/, ''),
        tipo: ext,
        hashSha256: uploadHash,
        thumbnailUrl: null,
        status: 'ativo',
        tags: [ext, '3D Asset', 'DAM'],
        updatedAt: new Date().toISOString(),
        versoes: [
          {
            id: `ver_${Date.now()}`,
            numeroVersao: 1,
            hashSha256: uploadHash,
            volumeCm3: parsedMetadata?.stl?.volumeCm3 || 25.4,
            pesoGramas: parsedMetadata?.stl?.estimatedWeightGrams?.PLA || 31.5,
            larguraMm: parsedMetadata?.stl?.boundingBox?.widthMm || 50,
            profundidadeMm: parsedMetadata?.stl?.boundingBox?.depthMm || 50,
            alturaMm: parsedMetadata?.stl?.boundingBox?.heightMm || 40,
            poligonosCount: parsedMetadata?.stl?.facetsCount || 15400,
            changelog: 'Versão Inicial enviada para o DAM.',
            inspecoesAi: parsedMetadata?.ai ? [parsedMetadata.ai] : [],
          },
        ],
      };

      setAssets([novoAsset, ...assets]);
      setUploadFile(null);
      setUploadBuffer(null);
      setUploadHash(null);
      setParsedMetadata(null);
      setUploading(false);
    }, 600);
  };

  const filteredAssets = assets.filter((a) => {
    const matchesSearch = a.nome.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'TODOS' || a.tipo === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1">
            <FolderGit2 className="w-4 h-4" />
            <span>Digital Asset Management (DAM) & Passaporte 3D</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Biblioteca Digital de Ativos 3D
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Gerencie revisões estilo Git, fingerprints SHA-256, metadados 3MF/GCode e inspeção de IA.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-blue-500/20">
            <UploadCloud className="w-4 h-4" />
            <span>Upload Novo Ativo (STL, 3MF, GCODE)</span>
            <input
              type="file"
              accept=".stl,.3mf,.gcode,.obj"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Card de Pre-visualização de Upload / Novo Ativo */}
      {uploadFile && (
        <div className="p-6 bg-slate-900 border border-blue-500/40 rounded-2xl space-y-4 shadow-2xl animate-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <FileCode className="w-5 h-5" />
              <span>Processando Novo Ativo: {uploadFile.name}</span>
            </div>
            <button
              onClick={() => { setUploadFile(null); setUploadBuffer(null); }}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>

          {duplicateWarning && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          {/* Badges do Parse */}
          {parsedMetadata && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Fingerprint SHA-256</span>
                <span className="font-mono text-blue-300 font-semibold">{formatarHashCurto(uploadHash || '')}</span>
              </div>

              {parsedMetadata.stl && (
                <>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Dimensões (X x Y x Z)</span>
                    <span className="font-mono text-slate-200">
                      {parsedMetadata.stl.boundingBox.widthMm} x {parsedMetadata.stl.boundingBox.depthMm} x {parsedMetadata.stl.boundingBox.heightMm} mm
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Volume / Peso (PLA)</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {parsedMetadata.stl.volumeCm3} cm³ (~{parsedMetadata.stl.estimatedWeightGrams.PLA}g)
                    </span>
                  </div>
                </>
              )}

              {parsedMetadata.threeMf && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Slicer 3MF Detectado</span>
                  <span className="font-semibold text-purple-400">{parsedMetadata.threeMf.slicerDetectado}</span>
                </div>
              )}

              {parsedMetadata.gcode && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Tempo & Camadas G-Code</span>
                  <span className="font-semibold text-amber-400">
                    {parsedMetadata.gcode.estimatedPrintTimeHours}h / {parsedMetadata.gcode.totalLayers} camadas
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 3D Canvas Preview */}
          {uploadBuffer && (uploadFile.name.endsWith('.stl') || uploadFile.name.endsWith('.STL')) && (
            <div className="mt-2">
              <StlViewer fileBuffer={uploadBuffer} height="320px" />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleSimularCadastroAtivo}
              disabled={uploading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{uploading ? 'Registrando Ativo v1...' : 'Confirmar e Cadastrar no DAM'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Toolbar de Busca e Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome de arquivo ou tag..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500 hidden sm:inline" />
          {['TODOS', 'STL', '3MF', 'GCODE', 'OBJ'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterType === t
                  ? 'bg-blue-600/30 border border-blue-500 text-blue-300'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Ativos Digitais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => {
          const ultimaVersao = asset.versoes?.[0] || {};
          const totalVersoes = asset.versoes?.length || 1;

          return (
            <div
              key={asset.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 transition-all shadow-xl space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Badge Topo */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-[10px] font-mono font-bold uppercase">
                    {asset.tipo}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-lg font-mono">
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>v{ultimaVersao.numeroVersao || 1} ({totalVersoes} revisões)</span>
                  </div>
                </div>

                {/* Nome do Ativo */}
                <div>
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                    {asset.nome}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 mt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SHA256: {formatarHashCurto(asset.hashSha256)}</span>
                  </div>
                </div>

                {/* Métricas da Última Versão */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block">VOLUME</span>
                    <span className="text-slate-200 font-bold">{ultimaVersao.volumeCm3 || 24.8} cm³</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">PESO (PLA)</span>
                    <span className="text-emerald-400 font-bold">~{ultimaVersao.pesoGramas || 30.7}g</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">DIMENSÕES</span>
                    <span className="text-slate-300">
                      {ultimaVersao.larguraMm || 45}x{ultimaVersao.profundidadeMm || 45}x{ultimaVersao.alturaMm || 35}mm
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">POLÍGONOS</span>
                    <span className="text-purple-300">{(ultimaVersao.poligonosCount || 12400).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Footer com Botões */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {asset.tags?.map((tag: string) => (
                    <span key={tag} className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedAsset(asset)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Inspecionar DAM</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Inspeção DAM & Versionamento */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-blue-400 uppercase font-bold">{selectedAsset.tipo} Asset</span>
                <h2 className="text-xl font-extrabold text-slate-100">{selectedAsset.nome}</h2>
                <p className="text-xs text-slate-400 font-mono">SHA256: {selectedAsset.hashSha256}</p>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
              >
                Fechar
              </button>
            </div>

            {/* Histórico de Versões (Git para 3D) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-purple-400" />
                <span>Histórico de Revisões & Commits 3D</span>
              </h3>

              <div className="space-y-2">
                {selectedAsset.versoes?.map((v: any, idx: number) => (
                  <div
                    key={v.id || idx}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-bold font-mono text-purple-400">
                        v{v.numeroVersao}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200">{v.changelog || 'Ajustes de malha e otimização de fatiamento.'}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {v.volumeCm3} cm³ • ~{v.pesoGramas}g PLA • SHA256: {formatarHashCurto(v.hashSha256)}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md font-bold">
                      {idx === 0 ? 'Versão Ativa' : 'Revisão Antiga'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
