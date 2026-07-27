import Link from "next/link";
import { Store, Lock, Globe, ArrowRight, Sparkles, ShieldCheck, Calculator, Printer, Layers, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RootHomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-white">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Navbar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-xl px-6 py-4 flex items-center justify-between max-w-7xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Store className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            PrintForge <span className="text-cyan-400">3D</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="secondary" size="sm">
              <Lock className="w-4 h-4 text-cyan-400" /> Entrar
            </Button>
          </Link>
          <Link href="/criar-loja">
            <Button variant="primary" size="sm">
              Criar Minha Loja <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24 text-center relative z-10 space-y-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs sm:text-sm font-semibold shadow-lg">
          <Sparkles className="w-4 h-4" /> A Primeira Plataforma SaaS Multi-vendedor para Impressão 3D
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-7xl font-black text-white tracking-tight leading-tight">
            Sua Loja 3D Própria com <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Gestão Total de Custos</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Monte seu catálogo profissional em minutos, calcule custos exatos de material e energia, gerencie pedidos no Kanban e venda sob demanda.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/criar-loja" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto px-8 py-4 text-base shadow-xl shadow-cyan-500/20">
              <Store className="w-5 h-5 text-white" /> Criar Minha Loja Grátis (14 Dias)
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 py-4 text-base">
              <Lock className="w-5 h-5 text-cyan-400" /> Acessar Meu Painel
            </Button>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left pt-16 border-t border-slate-800/80 max-w-5xl mx-auto">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <Calculator className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="font-bold text-lg text-white">Calculadora Inteligente de Custos</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Consumo em Watts por impressora, depreciação por hora, peso de filamento/resina, tintas e embalagem.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <Globe className="w-8 h-8 text-indigo-400 mb-3" />
            <h3 className="font-bold text-lg text-white">Catálogo Exclusivo na URL /loja/[slug]</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Link exclusivo da sua loja pública para compartilhar com clientes. Fotos em alta resolução e solicitação direta de encomendas.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <ShoppingBag className="w-8 h-8 text-emerald-400 mb-3" />
            <h3 className="font-bold text-lg text-white">Kanban de Encomendas & PIX</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Acompanhamento de pedidos por fases (Impressão, Pintura, Envio) e integração para receber pagamento via sua Chave PIX.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} PrintForge 3D — Plataforma SaaS Multiempresa para Impressão 3D.
      </footer>
    </main>
  );
}
