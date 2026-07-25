"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatarMoeda, calcularCustoPeca } from "@/lib/custos";
import { duplicarPecaAction } from "@/app/actions/pecas";
import { Button } from "@/components/ui/button";
import { PDFModal } from "@/components/admin/pdf-modal";
import {
  ArrowLeft,
  Box,
  FileText,
  Edit2,
  Printer,
  Palette,
  Package,
  Eye,
  EyeOff,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Copy,
} from "lucide-react";

export default function PecaDetailClientPage({
  peca,
  printers,
  filaments,
}: {
  peca: any;
  printers: any[];
  filaments: any[];
}) {
  const router = useRouter();
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const printerMap = new Map(printers.map((p) => [p.id, p]));
  const filamentMap = new Map(filaments.map((f) => [f.id, f]));

  const imp = peca.custoImpressao;
  const pin = peca.custoPintura;
  const emb = peca.custoEmbalagem;

  const printer = imp ? printerMap.get(imp.printerId) : null;
  const filament = imp ? filamentMap.get(imp.filamentId) : null;

  const custos = calcularCustoPeca({
    material: filament && imp ? { precoPorKg: filament.precoPorKg, pesoGramas: imp.pesoGramas } : undefined,
    energia: imp ? { consumoWatts: printer?.consumoWatts || 150, tempoHoras: imp.tempoHoras, tarifaEnergiaKwh: imp.tarifaEnergiaKwh } : undefined,
    depreciacao: printer && imp ? { precoImpressora: printer.preco, vidaUtilHoras: printer.vidaUtilHoras, tempoHoras: imp.tempoHoras } : undefined,
    pintura: pin ? { tempoHoras: pin.tempoHoras, valorHoraMaoDeObra: pin.valorHoraMaoDeObra, custoTintas: pin.custoTintas } : undefined,
    embalagem: emb ? { custoUnitario: emb.custoUnitario } : undefined,
    margemDesejadaPercentual: 100,
  });

  const handleDuplicate = async () => {
    setDuplicating(true);
    const res = await duplicarPecaAction(peca.id);
    setDuplicating(false);
    if (res?.success && res.newId) {
      router.push(`/admin/pecas/${res.newId}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/pecas"
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
                {peca.nome}
              </h1>
              {peca.categoria && (
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-800 border border-slate-700 text-teal-400">
                  {peca.categoria}
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Detalhamento técnico, cálculo de custos e geração de orçamentos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleDuplicate} disabled={duplicating}>
            <Copy className="w-4 h-4" /> {duplicating ? "Duplicando..." : "Duplicar Peça"}
          </Button>
          <Button variant="primary" onClick={() => setIsPDFModalOpen(true)}>
            <FileText className="w-4 h-4" /> Gerar Orçamento PDF
          </Button>
          <Link href={`/admin/pecas/${peca.id}/editar`}>
            <Button variant="secondary">
              <Edit2 className="w-4 h-4" /> Editar Peça
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image and Description */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 overflow-hidden relative group">
            {peca.fotoUrl ? (
              <img
                src={peca.fotoUrl}
                alt={peca.nome}
                className="w-full h-72 object-cover rounded-2xl"
              />
            ) : (
              <div className="w-full h-72 bg-slate-950 rounded-2xl flex flex-col items-center justify-center text-slate-600">
                <Box className="w-12 h-12 mb-2" />
                <span className="text-xs">Sem Imagem Cadastrada</span>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-400">Status Catálogo:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                  peca.publicada
                    ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {peca.publicada ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {peca.publicada ? "Publicado no Catálogo" : "Oculto dos Clientes"}
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
            <h3 className="font-bold text-slate-200 text-sm uppercase tracking-wider">
              Descrição da Peça
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              {peca.descricao || "Nenhuma descrição informada."}
            </p>
          </div>
        </div>

        {/* Right Column: Financial Summary and Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 text-cyan-500/10">
                <DollarSign className="w-16 h-16" />
              </div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Custo de Fabricação
              </p>
              <div className="text-3xl font-extrabold text-cyan-400">
                {formatarMoeda(custos.custoTotal)}
              </div>
              <p className="text-xs text-slate-500 mt-2">Material + Energia + Depreciação + Acabamento</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 text-teal-500/10">
                <TrendingUp className="w-16 h-16" />
              </div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Preço Sugerido (100% Margem)
              </p>
              <div className="text-3xl font-extrabold text-teal-400">
                {formatarMoeda(custos.precoSugerido)}
              </div>
              <p className="text-xs text-slate-500 mt-2">Preço base recomendado de venda</p>
            </div>
          </div>

          {/* Internal Breakdown Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <Printer className="w-5 h-5 text-teal-400" /> Composição Detalhada dos Custos
            </h3>

            <div className="space-y-4 text-sm">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex justify-between font-bold text-slate-200 border-b border-slate-800 pb-2">
                  <span>1. Impressão 3D</span>
                  <span className="text-teal-400">{formatarMoeda(custos.custoImpressaoTotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 pt-1">
                  <span>Material / Filamento ({imp?.pesoGramas || 0}g):</span>
                  <span className="text-slate-300 font-mono">{formatarMoeda(custos.custoMaterial)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Energia Elétrica ({imp?.tempoHoras || 0}h):</span>
                  <span className="text-slate-300 font-mono">{formatarMoeda(custos.custoEnergia)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Depreciação de Máquina:</span>
                  <span className="text-slate-300 font-mono">{formatarMoeda(custos.custoDepreciacao)}</span>
                </div>
              </div>

              {pin && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                  <div className="flex justify-between font-bold text-slate-200 border-b border-slate-800 pb-2">
                    <span>2. Pintura e Acabamento</span>
                    <span className="text-pink-400">{formatarMoeda(custos.custoPintura)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 pt-1">
                    <span>Mão de Obra ({pin.tempoHoras}h x {formatarMoeda(pin.valorHoraMaoDeObra)}/h):</span>
                    <span className="text-slate-300 font-mono">{formatarMoeda(pin.tempoHoras * pin.valorHoraMaoDeObra)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Insumos e Tintas:</span>
                    <span className="text-slate-300 font-mono">{formatarMoeda(pin.custoTintas)}</span>
                  </div>
                </div>
              )}

              {emb && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                  <div className="flex justify-between font-bold text-slate-200 border-b border-slate-800 pb-2">
                    <span>3. Embalagem</span>
                    <span className="text-indigo-400">{formatarMoeda(custos.custoEmbalagem)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 pt-1">
                    <span>Material: {emb.materialDescricao || "Padrão"}</span>
                    <span className="text-slate-300 font-mono">{formatarMoeda(emb.custoUnitario)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PDF Modal */}
      {isPDFModalOpen && (
        <PDFModal
          isOpen={isPDFModalOpen}
          onClose={() => setIsPDFModalOpen(false)}
          pecaNome={peca.nome}
          pecaDescricao={peca.descricao}
          pecaCategoria={peca.categoria}
          fotoUrl={peca.fotoUrl}
          precoPadrao={custos.precoSugerido}
        />
      )}
    </div>
  );
}
