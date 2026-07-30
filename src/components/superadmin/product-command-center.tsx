"use client";

import React, { useState } from "react";
import { Gauge, TrendingUp, Users, DollarSign, Activity, Sparkles, CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ProductCommandCenter() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl backdrop-blur-xl text-slate-100 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Gauge className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30 text-[10px] uppercase font-bold">
              PRINTFORGE PRODUCT COMMAND CENTER
            </Badge>
            <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
              Telemetria Operacional & Saúde do Produto (Internal SaaS Metrics)
            </h2>
          </div>
        </div>

        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs py-1 px-3">
          SAAS STATUS: OPTIMAL
        </Badge>
      </div>

      {/* Internal SaaS Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-bold block">Novos Trials Hoje</span>
          <div className="flex items-baseline gap-2">
            <strong className="text-2xl font-black text-white">18</strong>
            <span className="text-xs text-emerald-400 font-bold">+12%</span>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-bold block">Conversão Trial ➔ Pago</span>
          <div className="flex items-baseline gap-2">
            <strong className="text-2xl font-black text-cyan-400">22%</strong>
            <span className="text-xs text-emerald-400 font-bold">Meta: 15%</span>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-bold block">MRR Adicionado Hoje</span>
          <div className="flex items-baseline gap-2">
            <strong className="text-2xl font-black text-emerald-400">+R$ 4.250</strong>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400 font-bold block">Tempo Médio Onboarding</span>
          <div className="flex items-baseline gap-2">
            <strong className="text-2xl font-black text-indigo-400">11 min</strong>
            <span className="text-xs text-emerald-400 font-bold">Meta: &lt;15m</span>
          </div>
        </div>
      </div>

      {/* AI Product Analyst Insights */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
          <Sparkles className="w-4 h-4" /> AI Product Analyst Insights
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-white">Retenção:</strong> Empresas que utilizam o módulo <strong>Fleet Mapper</strong> apresentam retenção 31% superior à média global de clientes.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-white">Engajamento:</strong> O uso do <strong>AI Copilot Conversacional</strong> aumentou 18% após a introdução do resumo matinal diário na v1.0.3.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
