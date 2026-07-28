import React from "react";
import Link from "next/link";
import { Store, Compass, CheckCircle2, Clock, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PublicRoadmapPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-xl px-6 py-4 flex items-center justify-between max-w-7xl mx-auto relative z-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Store className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            PrintForge <span className="text-cyan-400">Roadmap</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/docs">
            <Button variant="secondary" size="sm">
              Dev Portal
            </Button>
          </Link>
          <Link href="/criar-loja">
            <Button variant="primary" size="sm">
              Criar Conta <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Roadmap Content */}
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-12 relative z-10">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30 px-3 py-1 text-xs">
            <Compass className="w-3.5 h-3.5 mr-1.5" /> Visão Transparente de Produto
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Roadmap Público do <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">PrintForge Platform</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Acompanhe a evolução técnica e funcional da plataforma operacional de manufatura aditiva.
          </p>
        </div>

        {/* Roadmap Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Concluído */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Entregue / Ativo
              </h3>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">1.0</Badge>
            </div>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="bg-slate-950 p-3 rounded-xl border border-slate-800">ERP SaaS Multi-Tenant com Isolamento por empresaId</li>
              <li className="bg-slate-950 p-3 rounded-xl border border-slate-800">Calculadora de Custos FDM e Resina</li>
              <li className="bg-slate-950 p-3 rounded-xl border border-slate-800">PrintForge Rewards (Pontos, Níveis, Missões)</li>
              <li className="bg-slate-950 p-3 rounded-xl border border-slate-800">Domain Event Bus & Structured Observability</li>
              <li className="bg-slate-950 p-3 rounded-xl border border-slate-800">Plugin SDK & Conectores Klipper / OctoPrint</li>
              <li className="bg-slate-950 p-3 rounded-xl border border-slate-800">STL AI Geometry Intelligence & Dynamic Pricing</li>
            </ul>
          </div>

          {/* Em Desenvolvimento */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-cyan-400 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Em Desenvolvimento
              </h3>
              <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30">2026 Q3</Badge>
            </div>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-semibold text-white">PrintForge Control Center (Gêmeo Digital de Impressoras)</li>
              <li className="bg-slate-950 p-3 rounded-xl border border-slate-800">Tracking Público de Pedidos para Clientes</li>
              <li className="bg-slate-950 p-3 rounded-xl border border-slate-800">Integração Bambu Studio & OrcaSlicer</li>
              <li className="bg-slate-950 p-3 rounded-xl border border-slate-800">Modo Operador Mobile (PWA)</li>
            </ul>
          </div>

          {/* Em Planejamento */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-indigo-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Em Planejamento
              </h3>
              <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30">2026-2027</Badge>
            </div>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="bg-slate-950 p-3 rounded-xl border border-slate-800">Marketplace de Extensões & Plugins de Terceiros</li>
              <li className="bg-slate-950 p-3 rounded-xl border border-slate-800">Marketplace de Modelos 3D com Royalties Automáticos</li>
              <li className="bg-slate-950 p-3 rounded-xl border border-slate-800">BI Avançado & Previsão de Demanda de Insumos</li>
              <li className="bg-slate-950 p-3 rounded-xl border border-slate-800">Integração Oficial Mercado Livre, Shopee & WhatsApp</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
