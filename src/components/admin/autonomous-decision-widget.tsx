"use client";

import React, { useState } from "react";
import { Brain, CheckCheck, Check, Sparkles, Clock, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface DecisionItem {
  id: string;
  category: "production" | "inventory" | "pricing" | "maintenance";
  title: string;
  description: string;
  estimatedImpact: string;
}

const SAMPLE_DECISIONS: DecisionItem[] = [
  {
    id: "dec-1",
    category: "production",
    title: "Transferir Job #241 para Impressora P3",
    description: "A impressora Voron 2.4 (P3) está ociosa e possui velocidade de fatiamento 35% superior.",
    estimatedImpact: "Economia de 2h18m na fila",
  },
  {
    id: "dec-2",
    category: "inventory",
    title: "Emitir ordem de compra de 3 kg de PLA Branco",
    description: "Com a taxa atual de consumo, o estoque de PLA Branco chegará a 0g em menos de 48 horas.",
    estimatedImpact: "Prevenir parada de produção",
  },
  {
    id: "dec-3",
    category: "pricing",
    title: "Aumentar preço da Peça XYZ em +8%",
    description: "A margem de lucro deste modelo (24%) está abaixo da média observada no mercado.",
    estimatedImpact: "+R$ 420,00 de lucro mensal extra",
  },
  {
    id: "dec-4",
    category: "maintenance",
    title: "Agendar manutenção preventiva da Impressora P2",
    description: "Bico extrusor atingiu 97% da vida útil estimada (970 horas trabalhadas).",
    estimatedImpact: "Evitar perda de material por entupimento",
  },
];

export function AutonomousDecisionWidget() {
  const [decisions, setDecisions] = useState<DecisionItem[]>(SAMPLE_DECISIONS);
  const [notification, setNotification] = useState<string | null>(null);

  const handleApproveAll = () => {
    const count = decisions.length;
    setDecisions([]);
    setNotification(`Sucesso! ${count} decisões foram aprovadas e executadas pelo AI Decision Engine.`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleApproveOne = (id: string, title: string) => {
    setDecisions((prev) => prev.filter((d) => d.id !== id));
    setNotification(`Decisão '${title}' aprovada e executada.`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl backdrop-blur-xl text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/20">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30 text-[10px] uppercase font-bold">
                PRINTFORGE 3.0 AUTONOMOUS DECISION ENGINE
              </Badge>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
              Decisões Proativas & Automação Controlada
            </h2>
          </div>
        </div>

        {decisions.length > 0 && (
          <Button
            variant="primary"
            className="h-12 px-5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-600/20"
            onClick={handleApproveAll}
          >
            <CheckCheck className="w-5 h-5" /> Aprovar Tudo ({decisions.length})
          </Button>
        )}
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-center text-xs font-bold animate-in fade-in shadow-xl">
          {notification}
        </div>
      )}

      {/* Decision Cards List */}
      {decisions.length === 0 ? (
        <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800/80 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">Todas as decisões foram processadas!</h3>
          <p className="text-xs text-slate-400">O AI Decision Engine está monitorando a sua operação em segundo plano.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decisions.map((dec) => (
            <div
              key={dec.id}
              className="bg-slate-950 border border-slate-800/90 rounded-2xl p-5 space-y-4 flex flex-col justify-between hover:border-indigo-500/40 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-slate-900 text-slate-300 border-slate-800 text-[10px]">
                    {dec.category.toUpperCase()}
                  </Badge>
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {dec.estimatedImpact}
                  </span>
                </div>

                <h4 className="text-sm font-black text-white">{dec.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{dec.description}</p>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full h-11 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                  onClick={() => handleApproveOne(dec.id, dec.title)}
                >
                  <Check className="w-4 h-4 text-emerald-400" /> Aprovar Recomendação
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
