"use client";

import { formatarMoeda } from "@/lib/custos";
import { DollarSign, TrendingUp, PieChart, ArrowUpRight, ArrowDownRight, Layers, FileSpreadsheet, ShieldAlert, Sparkles } from "lucide-react";

interface DREMetrics {
  receitaBruta: number;
  descontosCupons: number;
  receitaLiquida: number;
  custoMaterial: number;
  custoEnergia: number;
  custoDepreciacao: number;
  custoPintura: number;
  custoEmbalagem: number;
  custoTotalCPV: number;
  lucroBruto: number;
  margemBrutaPercentual: number;
  despesasManutencao: number;
  lucroLiquido: number;
  margemLiquidaPercentual: number;
}

export default function FinanceiroClientPage({ dre }: { dre: DREMetrics }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <DollarSign className="w-7 h-7 text-emerald-500" /> Módulo Financeiro & DRE
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Demonstrativo do Resultado do Exercício (DRE), margem bruta, lucratividade líquida e fluxo de caixa.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Margem Líquida: {dre.margemLiquidaPercentual.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Receita Líquida
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shrink-0">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatarMoeda(dre.receitaLiquida)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Vendas brutas menos descontos</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Custo dos Produtos (CPV)
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 shrink-0">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
            {formatarMoeda(dre.custoTotalCPV)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Material, energia, depreciação e acabamento</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Lucro Bruto
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center border border-cyan-500/20 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400 tracking-tight">
            {formatarMoeda(dre.lucroBruto)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Margem Bruta de {dre.margemBrutaPercentual.toFixed(1)}%</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Lucro Líquido Final
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shrink-0">
              <PieChart className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
            {formatarMoeda(dre.lucroLiquido)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Resultado após despesas fixas</p>
        </div>
      </div>

      {/* DRE Detailed Table Component */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-500" /> Demonstrativo do Resultado (DRE Simplificado)
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Consolidado da Operação</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs sm:text-sm font-medium">
          {/* Receita Bruta */}
          <div className="py-3 flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
            <span>(+) Receita Operacional Bruta</span>
            <span>{formatarMoeda(dre.receitaBruta)}</span>
          </div>

          {/* Descontos */}
          <div className="py-3 flex items-center justify-between text-slate-500 dark:text-slate-400 pl-4">
            <span>(-) Deduções & Cupons de Desconto</span>
            <span className="text-rose-500">({formatarMoeda(dre.descontosCupons)})</span>
          </div>

          {/* Receita Líquida */}
          <div className="py-3 flex items-center justify-between font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 px-3 rounded-xl">
            <span>(=) Receita Líquida</span>
            <span>{formatarMoeda(dre.receitaLiquida)}</span>
          </div>

          {/* Custos FDM e Resina */}
          <div className="py-3 flex items-center justify-between text-slate-500 dark:text-slate-400 pl-4">
            <span>(-) Custos de Materiais (Filamentos / Resinas)</span>
            <span className="text-rose-500">({formatarMoeda(dre.custoMaterial)})</span>
          </div>

          <div className="py-3 flex items-center justify-between text-slate-500 dark:text-slate-400 pl-4">
            <span>(-) Custos de Energia Elétrica (KWh)</span>
            <span className="text-rose-500">({formatarMoeda(dre.custoEnergia)})</span>
          </div>

          <div className="py-3 flex items-center justify-between text-slate-500 dark:text-slate-400 pl-4">
            <span>(-) Depreciação de Máquinas & Equipamentos</span>
            <span className="text-rose-500">({formatarMoeda(dre.custoDepreciacao)})</span>
          </div>

          <div className="py-3 flex items-center justify-between text-slate-500 dark:text-slate-400 pl-4">
            <span>(-) Custos de Pintura & Acabamento</span>
            <span className="text-rose-500">({formatarMoeda(dre.custoPintura)})</span>
          </div>

          <div className="py-3 flex items-center justify-between text-slate-500 dark:text-slate-400 pl-4">
            <span>(-) Custos de Embalagem & Envio</span>
            <span className="text-rose-500">({formatarMoeda(dre.custoEmbalagem)})</span>
          </div>

          {/* Lucro Bruto */}
          <div className="py-3 flex items-center justify-between font-black text-cyan-600 dark:text-cyan-400 bg-cyan-500/5 px-3 rounded-xl">
            <span>(=) Lucro Bruto Operacional (Margem Bruta: {dre.margemBrutaPercentual.toFixed(1)}%)</span>
            <span>{formatarMoeda(dre.lucroBruto)}</span>
          </div>

          {/* Despesas Operacionais */}
          <div className="py-3 flex items-center justify-between text-slate-500 dark:text-slate-400 pl-4">
            <span>(-) Despesas Fixas & Manutenção Estimada</span>
            <span className="text-rose-500">({formatarMoeda(dre.despesasManutencao)})</span>
          </div>

          {/* Resultado Líquido Final */}
          <div className="py-4 flex items-center justify-between font-black text-base text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-4 rounded-2xl border border-indigo-500/20">
            <span>(=) LUCRO LÍQUIDO DO PERÍODO (Margem Líquida: {dre.margemLiquidaPercentual.toFixed(1)}%)</span>
            <span>{formatarMoeda(dre.lucroLiquido)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
