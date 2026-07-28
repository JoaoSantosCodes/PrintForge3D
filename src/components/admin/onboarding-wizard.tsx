"use client";

import React, { useState } from "react";
import { CheckCircle2, Circle, ArrowRight, Printer, Package, FileUp, DollarSign, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
}

export function OnboardingWizard() {
  const [steps, setSteps] = useState<OnboardingStep[]>([
    { id: 1, title: "Cadastrar Primeira Impressora", description: "Informe o modelo e potência da sua máquina", icon: Printer, completed: true },
    { id: 2, title: "Cadastrar Primeiro Filamento", description: "Selecione o material (PLA, ABS, PETG) e valor por kg", icon: Package, completed: true },
    { id: 3, title: "Importar Modelo STL", description: "Análise geométrica instantânea com Inteligência Artificial", icon: FileUp, completed: true },
    { id: 4, title: "Gerar Primeiro Orçamento", description: "Cálculo preciso de custos fixos, energia e margem de lucro", icon: DollarSign, completed: false },
    { id: 5, title: "Ver Dashboard Operacional", description: "Tudo pronto para operar em menos de 15 minutos!", icon: Sparkles, completed: false },
  ]);

  const completeNextStep = () => {
    setSteps((prev) => {
      const nextIncomplete = prev.find((s) => !s.completed);
      if (!nextIncomplete) return prev;
      return prev.map((s) => (s.id === nextIncomplete.id ? { ...s, completed: true } : s));
    });
  };

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl backdrop-blur-xl text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-[10px] font-bold">
            ONBOARDING ACELERADO — TIME TO VALUE &lt; 15 MIN
          </Badge>
          <h2 className="text-xl font-black text-white tracking-tight mt-1">
            Primeiros Passos no PrintForge OS
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <span className="text-slate-400 block font-semibold">Progresso da Configuração</span>
            <strong className="text-cyan-400 text-sm">{progressPercent}% Concluído</strong>
          </div>
          <div className="w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-cyan-400">
            {completedCount}/{steps.length}
          </div>
        </div>
      </div>

      {/* Step Items */}
      <div className="space-y-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${
                step.completed
                  ? "bg-slate-950/80 border-slate-800 text-slate-300"
                  : "bg-cyan-500/5 border-cyan-500/30 text-white font-semibold"
              }`}
            >
              <div className="flex items-center gap-3">
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-cyan-400 shrink-0 animate-pulse" />
                )}

                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
                  <Icon className="w-4.5 h-4.5" />
                </div>

                <div>
                  <h4 className="text-xs sm:text-sm font-bold">{step.title}</h4>
                  <p className="text-[11px] text-slate-400">{step.description}</p>
                </div>
              </div>

              {!step.completed && (
                <Button
                  variant="primary"
                  size="sm"
                  className="h-9 px-3.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                  onClick={completeNextStep}
                >
                  Concluir <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
