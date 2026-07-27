"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit2, Trash2, Eye, EyeOff, Box, Tag, DollarSign, CheckCircle2, Clock, ShoppingBag, FileText, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatarMoeda, calcularCustoPeca } from "@/lib/custos";
import { exportToCSV } from "@/lib/csv";
import { togglePublicacaoAction, updateStatusAction, deletePecaAction, duplicarPecaAction } from "@/app/actions/pecas";
import { PDFModal } from "@/components/admin/pdf-modal";
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";

export default function PecasClientPage({
  initialPecas,
  printers,
  filaments,
}: {
  initialPecas: any[];
  printers: any[];
  filaments: any[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [filterPublicada, setFilterPublicada] = useState<string>("todos");
  const [selectedPecaPDF, setSelectedPecaPDF] = useState<any | null>(null);
  const [deletingPeca, setDeletingPeca] = useState<any | null>(null);

  const printerMap = new Map(printers.map((p) => [p.id, p]));
  const filamentMap = new Map(filaments.map((f) => [f.id, f]));

  const filteredPecas = initialPecas.filter((peca) => {
    const matchesSearch =
      peca.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (peca.categoria && peca.categoria.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterStatus !== "todos" && peca.status !== filterStatus) return false;
    if (filterPublicada === "sim" && !peca.publicada) return false;
    if (filterPublicada === "nao" && peca.publicada) return false;
    return true;
  });

  const handleTogglePublicada = async (id: string, atual: boolean) => {
    await togglePublicacaoAction(id, !atual);
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateStatusAction(id, status);
  };

  const confirmDelete = async () => {
    if (deletingPeca) {
      await deletePecaAction(deletingPeca.id);
      setDeletingPeca(null);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Nome",
      "Categoria",
      "Status",
      "Publicada no Catálogo",
      "Custo Impressão (R$)",
      "Custo Pintura (R$)",
      "Custo Embalagem (R$)",
      "Custo Total Produção (R$)",
      "Preço Sugerido (R$)",
    ];

    const rows = filteredPecas.map((peca) => {
      const imp = peca.custoImpressao;
      const pin = peca.custoPintura;
      const emb = peca.custoEmbalagem;
      const printer = imp ? printerMap.get(imp.printerId) : null;
      const filament = imp ? filamentMap.get(imp.filamentId) : null;
      const c = calcularCustoPeca({
        material: filament && imp ? { precoPorKg: filament.precoPorKg, pesoGramas: imp.pesoGramas } : undefined,
        energia: imp ? { consumoWatts: printer?.consumoWatts || 150, tempoHoras: imp.tempoHoras, tarifaEnergiaKwh: imp.tarifaEnergiaKwh } : undefined,
        depreciacao: printer && imp ? { precoImpressora: printer.preco, vidaUtilHoras: printer.vidaUtilHoras, tempoHoras: imp.tempoHoras } : undefined,
        pintura: pin ? { tempoHoras: pin.tempoHoras, valorHoraMaoDeObra: pin.valorHoraMaoDeObra, custoTintas: pin.custoTintas } : undefined,
        embalagem: emb ? { custoUnitario: emb.custoUnitario } : undefined,
      });

      return [
        peca.nome,
        peca.categoria || "Geral",
        peca.status,
        peca.publicada ? "Sim" : "Não",
        c.custoImpressaoTotal.toFixed(2),
        c.custoPintura.toFixed(2),
        c.custoEmbalagem.toFixed(2),
        c.custoTotal.toFixed(2),
        c.precoSugerido.toFixed(2),
      ];
    });

    exportToCSV("printforge_pecas_custos.csv", headers, rows);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <Box className="w-7 h-7 sm:w-8 sm:h-8 text-teal-500 dark:text-teal-400" /> Peças & Produção
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Gerencie seu acervo de peças 3D, altere status e visibilidade do catálogo público.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs">
            <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Exportar </span>CSV
          </Button>
          <Link href="/admin/pecas/nova">
            <Button variant="primary" size="sm" className="text-xs">
              <Plus className="w-3.5 h-3.5" /> Nova Peça & Calculadora
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm transition-colors">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span>Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="todos">Todos os Status</option>
            <option value="em_producao">Em Produção</option>
            <option value="pronta">Pronta</option>
            <option value="vendida">Vendida</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span>Catálogo Público:</span>
          <select
            value={filterPublicada}
            onChange={(e) => setFilterPublicada(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="todos">Todas</option>
            <option value="sim">Publicadas (Sim)</option>
            <option value="nao">Ocultas (Não)</option>
          </select>
        </div>
      </div>

      {filteredPecas.length === 0 ? (
        <EmptyState
          icon={Box}
          title="Nenhuma peça cadastrada ainda"
          description="Cadastre sua primeira peça 3D utilizando a calculadora de custos integrada para precificar material, energia, pintura e gerar orçamentos em PDF."
          actionLabel="Cadastrar Primeira Peça"
          actionHref="/admin/pecas/nova"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPecas.map((peca) => {
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

            return (
              <div
                key={peca.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden group hover:border-teal-500/40 transition-all flex flex-col justify-between shadow-md dark:shadow-lg"
              >
                {/* Photo & Badge header */}
                <div className="relative h-48 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-center overflow-hidden">
                  {peca.fotoUrl ? (
                    <img
                      src={peca.fotoUrl}
                      alt={peca.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Box className="w-10 h-10 text-slate-400 dark:text-slate-700 mx-auto mb-2" />
                      <span className="text-xs text-slate-500">Sem Imagem</span>
                    </div>
                  )}

                  {/* Public toggle badge overlay */}
                  <button
                    onClick={() => handleTogglePublicada(peca.id, peca.publicada)}
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md backdrop-blur-md transition-all ${
                      peca.publicada
                        ? "bg-teal-500/90 text-slate-950 hover:bg-teal-400"
                        : "bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {peca.publicada ? (
                      <>
                        <Eye className="w-3.5 h-3.5" /> No Catálogo
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> Oculta
                      </>
                    )}
                  </button>

                  {/* Category badge overlay */}
                  {peca.categoria && (
                    <span className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 text-[10px] font-semibold px-2.5 py-1 rounded-md backdrop-blur-md">
                      {peca.categoria}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {peca.nome}
                    </h3>
                    {peca.descricao && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                        {peca.descricao}
                      </p>
                    )}
                  </div>

                  {/* Status selector */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Status de Produção:</span>
                    <select
                      value={peca.status}
                      onChange={(e) => handleStatusChange(peca.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none ${
                        peca.status === "pronta"
                          ? "text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                          : peca.status === "vendida"
                          ? "text-cyan-700 dark:text-cyan-400 border-cyan-500/30"
                          : "text-amber-700 dark:text-amber-400 border-amber-500/30"
                      }`}
                    >
                      <option value="em_producao">⚙️ Em Produção</option>
                      <option value="pronta">✅ Pronta</option>
                      <option value="vendida">🛍️ Vendida</option>
                    </select>
                  </div>

                  {/* Internal Costs breakdown */}
                  <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3.5 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                      <span>Custo de Impressão:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">{formatarMoeda(custos.custoImpressaoTotal)}</span>
                    </div>
                    {custos.custoPintura > 0 && (
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Custo de Pintura:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{formatarMoeda(custos.custoPintura)}</span>
                      </div>
                    )}
                    {custos.custoEmbalagem > 0 && (
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Embalagem:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{formatarMoeda(custos.custoEmbalagem)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 font-bold">
                      <span className="text-slate-800 dark:text-slate-300">Preço Sugerido:</span>
                      <span className="text-teal-600 dark:text-teal-400">{formatarMoeda(custos.precoSugerido)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedPecaPDF({ ...peca, precoSugerido: custos.precoSugerido })}
                    className="flex-1 px-3 py-2 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" /> PDF Orçamento
                  </button>

                  <Link href={`/admin/pecas/${peca.id}/editar`}>
                    <Button variant="secondary" className="text-xs">
                      <Edit2 className="w-3.5 h-3.5" /> Editar
                    </Button>
                  </Link>

                  <button
                    onClick={async () => {
                      await duplicarPecaAction(peca.id);
                    }}
                    className="p-2 text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Duplicar Peça"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeletingPeca(peca)}
                    className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Excluir Peça"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PDF Generation Modal */}
      {selectedPecaPDF && (
        <PDFModal
          isOpen={!!selectedPecaPDF}
          onClose={() => setSelectedPecaPDF(null)}
          pecaNome={selectedPecaPDF.nome}
          pecaDescricao={selectedPecaPDF.descricao}
          pecaCategoria={selectedPecaPDF.categoria}
          fotoUrl={selectedPecaPDF.fotoUrl}
          precoPadrao={selectedPecaPDF.precoSugerido || 0}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!deletingPeca}
        itemName={deletingPeca?.nome}
        onClose={() => setDeletingPeca(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

