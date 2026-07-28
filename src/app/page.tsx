import Link from "next/link";
import { Store, Lock, ArrowRight, Sparkles, Calculator, Printer, ShoppingBag, Cpu, Code, Compass, Layers, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PrintForgeControlCenter } from "@/components/admin/control-center";

export default function RootHomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-white">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-cyan-500/10 rounded-full blur-[180px] pointer-events-none" />

      {/* Navbar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-xl px-6 py-4 flex items-center justify-between max-w-7xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Store className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            PrintForge <span className="text-cyan-400">Platform</span>
          </span>
        </Link>

        <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link href="/docs" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
            <Code className="w-4 h-4 text-cyan-400" /> Desenvolvedores
          </Link>
          <Link href="/roadmap" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-indigo-400" /> Roadmap
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="secondary" size="sm">
              <Lock className="w-4 h-4 text-cyan-400" /> Entrar
            </Button>
          </Link>
          <Link href="/criar-loja">
            <Button variant="primary" size="sm">
              Criar Conta <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24 text-center relative z-10 space-y-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs sm:text-sm font-semibold shadow-lg">
          <Sparkles className="w-4 h-4" /> A Plataforma Operacional para Empresas de Manufatura Aditiva
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-7xl font-black text-white tracking-tight leading-tight">
            Controle Produção, Custos e IA em <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Uma Única Plataforma</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed">
            Precificação precisa de STL, telemetria em tempo real (Klipper/OctoPrint), controle de estoque inteligente, recompensas gamificadas e loja online pronta para escalar.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/criar-loja" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto px-8 py-4 text-base shadow-xl shadow-cyan-500/20">
              <Store className="w-5 h-5 text-white" /> Começar Grátis (14 Dias)
            </Button>
          </Link>
          <Link href="/docs" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 py-4 text-base">
              <Code className="w-5 h-5 text-cyan-400" /> Ver Documentação & API
            </Button>
          </Link>
        </div>

        {/* Live Interactive Control Center Showcase */}
        <div className="pt-12 text-left max-w-5xl mx-auto">
          <PrintForgeControlCenter />
        </div>

        {/* 6 Feature Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left pt-16 border-t border-slate-800/80 max-w-5xl mx-auto">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <Calculator className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="font-bold text-lg text-white">Custos Inteligentes FDM & Resina</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Consumo exato em Watts por impressora, depreciação de bico e máquina, peso de insumos, tintas e embalagens.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <Printer className="w-8 h-8 text-indigo-400 mb-3" />
            <h3 className="font-bold text-lg text-white">Gestão de Produção & Telemetria</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Conexão nativa com Klipper e OctoPrint. Acompanhamento de progresso %, temperaturas e filas de impressão.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <Cpu className="w-8 h-8 text-emerald-400 mb-3" />
            <h3 className="font-bold text-lg text-white">IA para STL & Precificação</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Análise preditiva de geometria tridimensional, cálculo de densidade de suportes e orientação ideal na mesa.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <Zap className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="font-bold text-lg text-white">Plugin SDK & Extensões</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Manifesto Zod e Event Bus desacoplado para integração rápida de conectores de e-commerce e fatiamento.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <ShoppingBag className="w-8 h-8 text-pink-400 mb-3" />
            <h3 className="font-bold text-lg text-white">Loja Pública & E-commerce</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Catálogo sob demanda em <code>/loja/[slug]</code> com pagamento PIX e rastreio transparente para clientes.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <Layers className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="font-bold text-lg text-white">PrintForge Rewards</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Sistema gamificado de indicações em nível único, transações imutáveis em Ledger e resgate de recompensas.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto px-6 w-full gap-4">
        <span>© {new Date().getFullYear()} PrintForge Platform — A Plataforma Operacional para Manufatura Aditiva.</span>
        <div className="flex items-center gap-4 text-slate-400">
          <Link href="/docs" className="hover:text-cyan-400 transition-colors">Docs API</Link>
          <Link href="/roadmap" className="hover:text-cyan-400 transition-colors">Roadmap</Link>
          <Link href="/privacidade" className="hover:text-cyan-400 transition-colors">Privacidade</Link>
          <Link href="/termos" className="hover:text-cyan-400 transition-colors">Termos</Link>
        </div>
      </footer>
    </main>
  );
}
