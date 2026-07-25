"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string; error?: string };
}) {
  const [errorMsg, setErrorMsg] = useState(searchParams.error || "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setErrorMsg("");
    const res = await loginAction(formData);
    if (res?.error) {
      setErrorMsg(res.error);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-teal-500 to-cyan-400 rounded-2xl flex items-center justify-center text-slate-950 font-black text-2xl mx-auto shadow-lg shadow-teal-500/20 mb-4">
            3D
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            PrintForge <span className="text-teal-400">3D</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Painel Administrativo & Calculadora de Custos
          </p>
        </div>

        <div className="mb-6 p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl text-left">
          <p className="text-xs font-semibold text-teal-400 mb-1">Credenciais de Acesso (Modo Demo):</p>
          <p className="text-xs text-slate-300 font-mono">E-mail: <span className="text-slate-100 font-bold">admin@printforge3d.com</span></p>
          <p className="text-xs text-slate-300 font-mono">Senha: <span className="text-slate-100 font-bold">admin123</span></p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium text-center">
            {errorMsg}
          </div>
        )}


        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="redirectTo" value={searchParams.redirectTo || "/admin"} />

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              E-mail Administrativo
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                required
                placeholder="admin@printforge3d.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full py-2.5 text-sm mt-2" disabled={loading}>
            {loading ? "Autenticando..." : "Entrar no Painel"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Protegido por Supabase Auth</span>
          </div>

          <div>
            <Link href="/catalogo" className="text-xs text-cyan-400 hover:underline">
              Ir para o Catálogo Público &rarr;
            </Link>
          </div>
        </div>
      </div>
Main    </main>
  );
}
