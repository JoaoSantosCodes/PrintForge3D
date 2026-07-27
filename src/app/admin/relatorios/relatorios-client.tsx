"use client";

import { useState } from "react";
import { formatarMoeda } from "@/lib/custos";
import { gerarPDFRelatorioMensal } from "@/lib/pdf-relatorio";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Calendar,
  Box,
  DollarSign,
  TrendingUp,
  Award,
  Download,
  ShoppingBag,
} from "lucide-react";

interface RelatoriosClientPageProps {
  pedidos: any[];
  pecas: any[];
  printers: any[];
  filaments: any[];
}

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function RelatoriosClientPage({
  pedidos,
  pecas,
  printers,
  filaments,
}: RelatoriosClientPageProps) {
  const now = new Date();
  const [selectedMes, setSelectedMes] = useState<number>(now.getMonth());
  const [selectedAno, setSelectedAno] = useState<number>(now.getFullYear());

  const printerMap = new Map(printers.map((p) => [p.id, p]));
  const filamentMap = new Map(filaments.map((f) => [f.id, f]));

  // Filter orders created in selected month/year
  const pedidosNoMes = pedidos.filter((p) => {
    const d = new Date(p.createdAt);
    return d.getMonth() === selectedMes && d.getFullYear() === selectedAno;
  });

  const pedidosConcluidos = pedidosNoMes.filter((p) =>
    ["pronto", "enviado", "entregue"].includes(p.status)
  );

  // Revenue: Sum of precoAcordado * quantidade for completed orders
  const receitaTotal = pedidosConcluidos.reduce(
    (acc, p) => acc + (p.precoAcordado || 0) * (p.quantidade || 1),
    0
  );

  // Total produced pieces count in orders in selected month
  const totalPecasProduzidas = pedidosNoMes.reduce(
    (acc, p) => acc + (p.quantidade || 1),
    0
  );

  // Most produced piece
  const countPorPeca = new Map<string, { nome: string; quantidade: number }>();
  pedidosNoMes.forEach((p) => {
    const name = p.peca?.nome || "Peça Desconhecida";
    const current = countPorPeca.get(name) || { nome: name, quantidade: 0 };
    countPorPeca.set(name, {
      nome: name,
      quantidade: current.quantidade + (p.quantidade || 1),
    });
  });

  let pecaMaisProduzida: { nome: string; quantidade: number } | null = null;
  countPorPeca.forEach((val) => {
    if (!pecaMaisProduzida || val.quantidade > pecaMaisProduzida.quantidade) {
      pecaMaisProduzida = val;
    }
  });

  // Calculate estimated production cost for pieces in selected month
  let custoTotalProducao = 0;
  pedidosNoMes.forEach((p) => {
    if (p.peca) {
      const imp = p.peca.custoImpressao;
      const pin = p.peca.custoPintura;
      const emb = p.peca.custoEmbalagem;
      const printer = imp ? printerMap.get(imp.printerId) : null;
      const filament = imp ? filamentMap.get(imp.filamentId) : null;

      const custoMat = filament && imp ? (filament.precoPorKg / 1000) * imp.pesoGramas : 0;
      const custoEne = printer && imp ? (printer.consumoWatts / 1000) * imp.tempoHoras * imp.tarifaEnergiaKwh : 0;
      const custoDep = printer && imp && printer.vidaUtilHoras > 0 ? (printer.preco / printer.vidaUtilHoras) * imp.tempoHoras : 0;
      const custoPin = pin ? (pin.tempoHoras * pin.valorHoraMaoDeObra) + pin.custoTintas : 0;
      const custoEmb = emb ? emb.custoUnitario : 0;

      const custoUnitario = custoMat + custoEne + custoDep + custoPin + custoEmb;
      custoTotalProducao += custoUnitario * (p.quantidade || 1);
    }
  });

  const lucroEstimado = receitaTotal - custoTotalProducao;
  const mesAnoExtenso = `${MESES[selectedMes]} de ${selectedAno}`;

  const handleExportPDF = () => {
    gerarPDFRelatorioMensal({
      mesAno: mesAnoExtenso,
      totalPecasProduzidas,
      custoTotalProducao,
      receitaTotal,
      lucroEstimado,
      pecaMaisProduzida,
      pedidosConcluidos: pedidosConcluidos.length,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-teal-500 dark:text-teal-400" /> Relatórios Mensais de Operação
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Análise consolidada de peças produzidas, faturamento, custos de insumos e lucro.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" size="sm" onClick={handleExportPDF} className="w-full sm:w-auto text-xs sm:text-sm">
            <Download className="w-4 h-4" /> Exportar PDF do Relatório
          </Button>
        </div>
      </div>

      {/* Month / Year Selector Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm transition-colors">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold">
          <Calendar className="w-4 h-4 text-teal-500 dark:text-teal-400" /> Selecione o Período de Análise:
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedMes}
            onChange={(e) => setSelectedMes(Number(e.target.value))}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-teal-500"
          >
            {MESES.map((m, idx) => (
              <option key={m} value={idx}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={selectedAno}
            onChange={(e) => setSelectedAno(Number(e.target.value))}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-teal-500"
          >
            {[2024, 2025, 2026, 2027].map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Monthly Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden group shadow-md dark:shadow-lg">
          <div className="absolute top-0 right-0 p-4 text-teal-500/10">
            <Box className="w-16 h-16" />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Peças Produzidas
          </p>
          <div className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">{totalPecasProduzidas}</div>
          <p className="text-xs text-slate-500 mt-2">
            Total de unidades em pedidos do mês
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden group shadow-md dark:shadow-lg">
          <div className="absolute top-0 right-0 p-4 text-rose-500/10">
            <DollarSign className="w-16 h-16" />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Custo Total de Produção
          </p>
          <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {formatarMoeda(custoTotalProducao)}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Insumos, energia, pintura e embalagem
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden group shadow-md dark:shadow-lg">
          <div className="absolute top-0 right-0 p-4 text-cyan-500/10">
            <ShoppingBag className="w-16 h-16" />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Receita de Vendas
          </p>
          <div className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">
            {formatarMoeda(receitaTotal)}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {pedidosConcluidos.length} pedidos concluídos
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden group shadow-md dark:shadow-lg">
          <div className="absolute top-0 right-0 p-4 text-emerald-500/10">
            <TrendingUp className="w-16 h-16" />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Lucro Estimado
          </p>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatarMoeda(lucroEstimado)}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Receita líquida da operação
          </p>
        </div>
      </div>

      {/* Top Produced Piece Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-md dark:shadow-lg transition-colors">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <Award className="w-5 h-5 text-amber-500 dark:text-amber-400" /> Destaque de Produção do Mês
        </h3>

        {(() => {
          const p = pecaMaisProduzida as { nome: string; quantidade: number } | null;
          if (!p) {
            return (
              <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 text-xs">
                Nenhum pedido registrado no mês de {mesAnoExtenso}.
              </div>
            );
          }
          return (
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Peça Mais Produzida
                </span>
                <h4 className="text-xl font-extrabold text-teal-600 dark:text-teal-300 mt-0.5">
                  {p.nome}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {p.quantidade}x
                </span>
                <p className="text-xs text-slate-500 font-medium">unidades produzidas</p>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
