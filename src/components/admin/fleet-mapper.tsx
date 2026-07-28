"use client";

import React, { useState } from "react";
import { Building2, MapPin, Layers, Server, Printer, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface FleetNode {
  city: string;
  factoryName: string;
  roomName: string;
  rackId: string;
  printers: Array<{
    id: string;
    name: string;
    model: string;
    status: "printing" | "idle" | "error" | "maintenance";
    tempNozzle: number;
  }>;
}

const SAMPLE_FLEET: FleetNode[] = [
  {
    city: "São Paulo - SP",
    factoryName: "Planta Principal (Matriz)",
    roomName: "Sala Limpa A1",
    rackId: "RACK-01",
    printers: [
      { id: "p1", name: "Bambu Lab X1C #01", model: "X1-Carbon", status: "printing", tempNozzle: 215 },
      { id: "p2", name: "Ender 3 S1 Pro #02", model: "E3-S1", status: "printing", tempNozzle: 240 },
    ],
  },
  {
    city: "Campinas - SP",
    factoryName: "Planta Industrial Campinas",
    roomName: "Chão de Fábrica C2",
    rackId: "RACK-02",
    printers: [
      { id: "p3", name: "Voron 2.4 #03", model: "V2.4 350mm", status: "idle", tempNozzle: 28 },
      { id: "p4", name: "Prusa MK4 #04", model: "MK4", status: "maintenance", tempNozzle: 25 },
    ],
  },
];

export function FleetMapper() {
  const [fleet] = useState<FleetNode[]>(SAMPLE_FLEET);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl backdrop-blur-xl text-slate-100 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-[10px] uppercase font-bold">
              PRINTFORGE FLEET MAPPER 1.0 LTS
            </Badge>
            <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
              Visão Espacial Global da Frota (Google Maps da Fábrica)
            </h2>
          </div>
        </div>
      </div>

      {/* Fleet Hierarchy Tree */}
      <div className="space-y-6">
        {fleet.map((node, idx) => (
          <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            {/* Location Bar */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-sm font-black text-white">{node.city}</span>
                <span className="text-xs text-slate-400">— {node.factoryName}</span>
              </div>
              <Badge variant="outline" className="bg-slate-900 text-slate-300 border-slate-800 text-[10px]">
                {node.roomName} / {node.rackId}
              </Badge>
            </div>

            {/* Printers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {node.printers.map((printer) => {
                const isPrinting = printer.status === "printing";
                const isIdle = printer.status === "idle";

                return (
                  <div
                    key={printer.id}
                    className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          isPrinting ? "bg-cyan-400 animate-pulse" : isIdle ? "bg-emerald-400" : "bg-amber-400"
                        }`}
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white">{printer.name}</h4>
                        <span className="text-[11px] text-slate-400">{printer.model}</span>
                      </div>
                    </div>

                    <div className="text-right text-[11px]">
                      <span className="font-bold text-amber-400">{printer.tempNozzle}°C</span>
                      <span className="block text-[10px] text-slate-500 uppercase">{printer.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
