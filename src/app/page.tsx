import Link from "next/link";
import { Box, Lock, Globe, ArrowRight, Sparkles, Shield, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RootHomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 py-20 text-center relative z-10 space-y-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-teal-400 text-xs font-semibold shadow-lg">
          <Sparkles className="w-4 h-4" /> Plataforma Completa de Gestão & Catálogo 3D
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="w-20 h-20 bg-gradient-to-tr from-teal-500 to-cyan-400 rounded-3xl flex items-center justify-center text-slate-950 font-black text-4xl mx-auto shadow-2xl shadow-teal-500/20 mb-6">
            3D
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-100 tracking-tight leading-tight">
            PrintForge <span className="text-teal-400">3D</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Controle preciso de custos de impressão 3D, energia, depreciação, pintura e embalagem — aliado a uma vitrine pública elegante para seus clientes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/catalogo" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto px-8 py-3 text-base">
              <Globe className="w-5 h-5" /> Acessar Catálogo Público
            </Button>
          </Link>
          <Link href="/admin" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8 py-3 text-base">
              <Lock className="w-5 h-5 text-teal-400" /> Área do Administrador
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left pt-16 border-t border-slate-800/80 max-w-4xl mx-auto">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
            <Calculator className="w-8 h-8 text-teal-400 mb-3" />
            <h3 className="font-bold text-slate-200">Cálculo de Custos</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Material, consumo em Watts, depreciação por hora de máquina, mão de obra e embalagem.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
            <Globe className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="font-bold text-slate-200">Catálogo Público</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Exiba suas peças com fotos em alta resolução ocultando 100% dos seus custos internos.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
            <Shield className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="font-bold text-slate-200">Supabase & Prisma</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Autenticação segura via Supabase Auth e ORM de alto desempenho sobre o Postgres.
            </p>
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} PrintForge 3D — Todos os direitos reservados.
      </footer>
    </main>
  );
}
