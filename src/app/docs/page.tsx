import React from "react";
import Link from "next/link";
import { Store, Code, Terminal, Key, Webhook, Cpu, ArrowRight, BookOpen, Layers, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DevDocsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-xl px-6 py-4 flex items-center justify-between max-w-7xl mx-auto relative z-10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Store className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            PrintForge <span className="text-cyan-400">Devs</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="secondary" size="sm">
              Acessar Painel
            </Button>
          </Link>
          <Link href="/criar-loja">
            <Button variant="primary" size="sm">
              Começar Agora <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-12 relative z-10">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 px-3 py-1 text-xs">
            <Code className="w-3.5 h-3.5 mr-1.5" /> Portal de Desenvolvedores & Documentação da API
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Construa e Integre com o <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">PrintForge Platform</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            API REST v1, Plugin SDK, assinaturas de Webhook via HMAC SHA-256 e conectores nativos para Klipper, OctoPrint e marketplaces.
          </p>
        </div>

        {/* Documentation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* API Keys */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3 backdrop-blur-xl">
            <Key className="w-7 h-7 text-cyan-400" />
            <h3 className="font-bold text-lg text-white">API Keys & Autenticação</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Autentique suas requisições REST adicionando o cabeçalho <code>Authorization: Bearer pf_live_...</code> ou <code>X-API-Key</code>.
            </p>
          </div>

          {/* Plugin SDK */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3 backdrop-blur-xl">
            <Cpu className="w-7 h-7 text-indigo-400" />
            <h3 className="font-bold text-lg text-white">Plugin SDK (@printforge/sdk)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Crie plugins e extensões com manifesto padronizado (Zod), escopos de permissão granular e escuta direta do Domain Event Bus.
            </p>
          </div>

          {/* Webhooks */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3 backdrop-blur-xl">
            <Webhook className="w-7 h-7 text-emerald-400" />
            <h3 className="font-bold text-lg text-white">Signed Webhooks</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Receba notificações em tempo real para <code>PEDIDO_CRIADO</code>, <code>ESTOQUE_BAIXADO</code> e <code>RECOMPENSA_RESGATADA</code> com assinatura <code>X-PrintForge-Signature</code>.
            </p>
          </div>
        </div>

        {/* Code Example Snippet */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Terminal className="w-4 h-4 text-cyan-400" /> plugin-manifest.json — Exemplo de Manifesto do Plugin Klipper
            </div>
            <Badge variant="outline" className="text-[10px] text-slate-400">JSON Schema v1</Badge>
          </div>

          <pre className="text-xs font-mono text-cyan-300 overflow-x-auto bg-slate-950 p-4 rounded-xl leading-relaxed">
{`{
  "id": "klipper-connector",
  "name": "Klipper Moonraker Connector",
  "version": "1.0.0",
  "author": "PrintForge Ecosystem",
  "permissions": [
    "printers:read",
    "events:listen"
  ],
  "hooks": [
    "PEDIDO_CRIADO",
    "PRINT_FINALIZADA"
  ]
}`}
          </pre>
        </div>
      </div>
    </main>
  );
}
