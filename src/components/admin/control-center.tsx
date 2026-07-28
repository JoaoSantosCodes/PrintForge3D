"use client";

import React, { useState } from "react";
import {
  Printer,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Sparkles,
  Package,
  Layers,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface ControlCenterPrinter {
  id: string;
  name: string;
  model: string;
  status: "printing" | "idle" | "paused" | "heating" | "error";
  progressPercent: number;
  currentMaterial: string;
  currentJob?: string;
  tempNozzleActual: number;
  tempNozzleTarget: number;
  tempBedActual: number;
  tempBedTarget: number;
}

export interface ControlCenterQueueItem {
  id: string;
  pieceName: string;
  customerName: string;
  estimatedHours: number;
  materialNeeded: string;
  weightGrams: number;
}

const INITIAL_PRINTERS: ControlCenterPrinter[] = [
  {
    id: "p1",
    name: "Impressora P1",
    model: "Bambu Lab X1-Carbon",
    status: "printing",
    progressPercent: 82,
    currentMaterial: "PLA Preto Premium",
    currentJob: "Suporte Suporte Xbox Elite v2",
    tempNozzleActual: 215,
    tempNozzleTarget: 215,
    tempBedActual: 60,
    tempBedTarget: 60,
  },
  {
    id: "p2",
    name: "Impressora P2",
    model: "Ender 3 S1 Pro (Klipper)",
    status: "printing",
    progressPercent: 28,
    currentMaterial: "PETG Branco",
    currentJob: "Engrenagem Planetária M1.5",
    tempNozzleActual: 238,
    tempNozzleTarget: 240,
    tempBedActual: 79,
    tempBedTarget: 80,
  },
  {
    id: "p3",
    name: "Impressora P3",
    model: "Prusa MK4",
    status: "idle",
    progressPercent: 100,
    currentMaterial: "PLA Cinza",
    currentJob: "Finalizado: Capacete Iron Man (Parte 3)",
    tempNozzleActual: 28,
    tempNozzleTarget: 0,
    tempBedActual: 25,
    tempBedTarget: 0,
  },
  {
    id: "p4",
    name: "Impressora P4",
    model: "Voron 2.4 350mm",
    status: "paused",
    progressPercent: 64,
    currentMaterial: "ABS Vermelho",
    currentJob: "Capa Protetora Industrial",
    tempNozzleActual: 245,
    tempNozzleTarget: 245,
    tempBedActual: 105,
    tempBedTarget: 105,
  },
];

const INITIAL_QUEUE: ControlCenterQueueItem[] = [
  { id: "q1", pieceName: "Organizador de Cabos Modular (x5)", customerName: "Empresa TecLog", estimatedHours: 4.5, materialNeeded: "PLA Preto", weightGrams: 140 },
  { id: "q2", pieceName: "Estátua Dragão Articulado", customerName: "Lucas Santos", estimatedHours: 12.0, materialNeeded: "PLA Arco-Íris", weightGrams: 280 },
  { id: "q3", pieceName: "Case para Raspberry Pi 5", customerName: "Dev Studio", estimatedHours: 2.2, materialNeeded: "PETG Preto", weightGrams: 65 },
];

export function PrintForgeControlCenter() {
  const [printers] = useState<ControlCenterPrinter[]>(INITIAL_PRINTERS);
  const [queue] = useState<ControlCenterQueueItem[]>(INITIAL_QUEUE);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl backdrop-blur-2xl text-slate-100">
      {/* Control Center Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <Cpu className="w-3.5 h-3.5" /> Gêmeo Digital da Fazenda de Impressão 3D
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            PrintForge <span className="text-cyan-400">Control Center</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Painel operacional em tempo real: telemetria das impressoras, fila de trabalhos e otimização por IA.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 py-1.5 px-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-2" /> 4 Impressoras Conectadas
          </Badge>
        </div>
      </div>

      {/* AI Smart Dispatch Recommendation Alert */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-cyan-950/80 border border-indigo-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              Sugestão de Otimização via IA (Production Assistant)
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              "A Impressora P3 ficou livre. Recomendo mover a peça <strong className="text-cyan-300 font-semibold">Organizador de Cabos Modular</strong> da fila para a P3. Redução de <strong>2h15m</strong> no prazo geral da fazenda."
            </p>
          </div>
        </div>

        <Button variant="primary" size="sm" className="shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
          Aplicar Sugestão <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Real-Time Printer Telemetry Grid */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-slate-200 flex items-center gap-2">
          <Printer className="w-4 h-4 text-cyan-400" /> Status da Frota em Tempo Real
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {printers.map((printer) => {
            const isPrinting = printer.status === "printing";
            const isIdle = printer.status === "idle";
            const isPaused = printer.status === "paused";

            return (
              <div
                key={printer.id}
                className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-colors shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                      <Printer className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{printer.name}</h4>
                      <p className="text-[11px] text-slate-400">{printer.model}</p>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={
                      isPrinting
                        ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                        : isIdle
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : isPaused
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-slate-800 text-slate-400"
                    }
                  >
                    {isPrinting && <Play className="w-3 h-3 mr-1 fill-cyan-400" />}
                    {isIdle && <CheckCircle2 className="w-3 h-3 mr-1" />}
                    {isPaused && <Pause className="w-3 h-3 mr-1" />}
                    {printer.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300 truncate max-w-[200px]">{printer.currentJob}</span>
                    <span className="text-cyan-400 font-mono">{printer.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isPrinting
                          ? "bg-gradient-to-r from-cyan-500 to-indigo-500"
                          : isIdle
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${printer.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Temps & Filaments Footer */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-900 text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Bico: <strong className="text-slate-200">{printer.tempNozzleActual}°C</strong> / {printer.tempNozzleTarget}°C</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Mesa: <strong className="text-slate-200">{printer.tempBedActual}°C</strong> / {printer.tempBedTarget}°C</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Queue & Inventory Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {/* Jobs Queue */}
        <div className="md:col-span-2 bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" /> Fila de Impressão Aguardando
            </h3>
            <span className="text-xs text-slate-400 font-mono">{queue.length} peças prontas</span>
          </div>

          <div className="space-y-2.5">
            {queue.map((item, idx) => (
              <div
                key={item.id}
                className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 font-mono font-bold text-cyan-400 flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h5 className="font-bold text-white">{item.pieceName}</h5>
                    <p className="text-[11px] text-slate-400">{item.customerName} • {item.materialNeeded}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-cyan-400 font-bold">{item.estimatedHours}h</span>
                  <p className="text-[10px] text-slate-500">{item.weightGrams}g</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Alerta de Insumos & Estoque
          </h3>

          <div className="space-y-3">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-amber-300">
                <span>PETG Branco Premium</span>
                <span>180 g</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Suficiente apenas para os próximos 2 trabalhos. Comprar novo carretel em <strong>3 dias</strong>.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold text-slate-300">
                <span>PLA Preto Pro</span>
                <span>620 g</span>
              </div>
              <p className="text-[11px] text-slate-500">Estoque suficiente para 8 dias.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
