"use client";

import React, { useState } from "react";
import {
  Printer,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Layers,
  Zap,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface TouchPrinterItem {
  id: string;
  name: string;
  model: string;
  status: "printing" | "idle" | "paused" | "error";
  progressPercent: number;
  currentJob?: string;
  currentMaterial: string;
  tempNozzle: number;
  tempBed: number;
}

const SAMPLE_TOUCH_PRINTERS: TouchPrinterItem[] = [
  {
    id: "p1",
    name: "Bambu Lab X1-Carbon",
    model: "X1-C #01",
    status: "printing",
    progressPercent: 82,
    currentJob: "Suporte Xbox Elite v2",
    currentMaterial: "PLA Preto Premium",
    tempNozzle: 215,
    tempBed: 60,
  },
  {
    id: "p2",
    name: "Ender 3 S1 Pro",
    model: "E3-S1 #02",
    status: "printing",
    progressPercent: 28,
    currentJob: "Engrenagem M1.5",
    currentMaterial: "PETG Branco",
    tempNozzle: 240,
    tempBed: 80,
  },
  {
    id: "p3",
    name: "Prusa MK4",
    model: "MK4 #03",
    status: "idle",
    progressPercent: 100,
    currentJob: "Pronto: Capacete Iron Man",
    currentMaterial: "PLA Cinza",
    tempNozzle: 28,
    tempBed: 25,
  },
  {
    id: "p4",
    name: "Voron 2.4",
    model: "V2.4 #04",
    status: "paused",
    progressPercent: 64,
    currentJob: "Capa Protetora Industrial",
    currentMaterial: "ABS Vermelho",
    tempNozzle: 245,
    tempBed: 105,
  },
];

export function OperadorTouchClient() {
  const [printers, setPrinters] = useState<TouchPrinterItem[]>(SAMPLE_TOUCH_PRINTERS);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  const handleAction = (printerId: string, actionName: string, newStatus?: TouchPrinterItem["status"]) => {
    if (newStatus) {
      setPrinters((prev) =>
        prev.map((p) => (p.id === printerId ? { ...p, status: newStatus } : p))
      );
    }
    setActiveNotification(`Ação '${actionName}' executada com sucesso na impressora.`);
    setTimeout(() => setActiveNotification(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 space-y-6 font-sans selection:bg-cyan-500">
      {/* Header Touch Minimalista */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Printer className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-[10px]">
                MODO OPERADOR TOUCH-FIRST
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              Chão de Fábrica — Estação de Impressão
            </h1>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping mr-1" />
          <span>4 Máquinas Sincronizadas</span>
        </div>
      </div>

      {/* Touch Notification Banner */}
      {activeNotification && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-center text-sm font-bold animate-in fade-in shadow-xl">
          {activeNotification}
        </div>
      )}

      {/* Grid Touch de Impressoras (Botões Grandes de 1-Clique) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {printers.map((printer) => {
          const isPrinting = printer.status === "printing";
          const isIdle = printer.status === "idle";
          const isPaused = printer.status === "paused";

          return (
            <div
              key={printer.id}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between"
            >
              {/* Informações da Máquina */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black text-white">{printer.name}</span>
                    <span className="text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800 font-mono">
                      {printer.model}
                    </span>
                  </div>

                  <Badge
                    variant="outline"
                    className={
                      isPrinting
                        ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs py-1 px-3 font-bold"
                        : isIdle
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs py-1 px-3 font-bold"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs py-1 px-3 font-bold"
                    }
                  >
                    {printer.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Nome do Trabalho & Progresso */}
                <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-200 truncate">{printer.currentJob}</span>
                    <span className="text-cyan-400 font-mono font-bold text-sm">{printer.progressPercent}%</span>
                  </div>

                  <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isPrinting ? "bg-gradient-to-r from-cyan-500 to-indigo-500" : isIdle ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${printer.progressPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                    <span>Material: <strong className="text-white">{printer.currentMaterial}</strong></span>
                    <div className="flex items-center gap-3">
                      <span>Bico: <strong className="text-amber-400">{printer.tempNozzle}°C</strong></span>
                      <span>Mesa: <strong className="text-indigo-400">{printer.tempBed}°C</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões Touch de Ação em Tamanho G (60px+) */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {isPrinting && (
                  <Button
                    variant="secondary"
                    className="h-16 rounded-2xl bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-sm font-bold flex items-center justify-center gap-2"
                    onClick={() => handleAction(printer.id, "Pausar Impressão", "paused")}
                  >
                    <Pause className="w-5 h-5 fill-amber-400" /> Pausar
                  </Button>
                )}

                {isPaused && (
                  <Button
                    variant="primary"
                    className="h-16 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold flex items-center justify-center gap-2"
                    onClick={() => handleAction(printer.id, "Retomar Impressão", "printing")}
                  >
                    <Play className="w-5 h-5 fill-white" /> Retomar
                  </Button>
                )}

                {isIdle && (
                  <Button
                    variant="primary"
                    className="h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-2"
                    onClick={() => handleAction(printer.id, "Iniciar Próximo Job", "printing")}
                  >
                    <Play className="w-5 h-5 fill-white" /> Iniciar Próximo
                  </Button>
                )}

                <Button
                  variant="secondary"
                  className="h-16 rounded-2xl bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-800 text-sm font-semibold flex items-center justify-center gap-2"
                  onClick={() => handleAction(printer.id, "Troca de Bobina / Filament Swap")}
                >
                  <RotateCcw className="w-5 h-5 text-indigo-400" /> Trocar Bobina
                </Button>

                <Button
                  variant="secondary"
                  className="col-span-2 h-14 rounded-2xl bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-bold flex items-center justify-center gap-2"
                  onClick={() => handleAction(printer.id, "Registrar Erro / Manutenção", "error")}
                >
                  <AlertTriangle className="w-4 h-4" /> Registrar Falha / Manutenção
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
