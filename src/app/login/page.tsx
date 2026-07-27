"use client";

import { useState } from "react";
import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Lock, Mail, ArrowRight, ShieldCheck, UserPlus } from "lucide-react";
import Link from "next/link";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string; error?: string };
}) {
  const [errorMsg, setErrorMsg] = useState(searchParams.error || "");
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  const fillCredentials = (email: string, pass: string) => {
    setEmailInput(email);
    setPasswordInput(pass);
  };

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await loginAction(formData);
      if (res?.error) {
        setErrorMsg(res.error);
        setLoading(false);
      } else if (res?.redirectUrl) {
        window.location.href = res.redirectUrl;
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Erro inesperado ao realizar login.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden text-slate-100 selection:bg-teal-500 selection:text-slate-950">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-teal-500 to-cyan-400 rounded-2xl flex items-center justify-center text-slate-950 font-black text-2xl mx-auto shadow-lg shadow-teal-500/20 mb-4">
            3D
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            PrintForge <span className="text-teal-400">3D</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Acesse sua conta para gerenciar orçamentos e pedidos.
          </p>
        </div>

        {/* Quick Access Presets Badge */}
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
            Contas para Teste Rápido
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials("admin@printforge3d.com", "admin123")}
              className="px-2.5 py-1.5 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 rounded-xl text-left transition-all group"
            >
              <div className="text-[11px] font-bold text-teal-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Administrador
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">admin@printforge3d.com</div>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials("cliente@printforge3d.com", "user123")}
              className="px-2.5 py-1.5 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 rounded-xl text-left transition-all group"
            >
              <div className="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                <UserPlus className="w-3 h-3" /> Cliente / Usuário
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">cliente@printforge3d.com</div>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-medium text-center">
            {errorMsg}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="redirectTo" value={searchParams.redirectTo || ""} />

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Endereço de E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Senha de Acesso
              </label>
              <Link href="/esqueci-senha" className="text-[11px] text-teal-400 hover:underline">
                Esqueci minha senha
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full py-2.5 text-sm mt-2" disabled={loading}>
            {loading ? "Entrando..." : "Entrar na Conta"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center space-y-3">
          <p className="text-xs text-slate-400">
            Ainda não possui uma conta?{" "}
            <Link href="/cadastro" className="text-teal-400 hover:underline font-semibold">
              Criar Conta
            </Link>
          </p>

          <div>
            <Link href="/catalogo" className="text-xs text-cyan-400 hover:underline inline-flex items-center gap-1">
              Ver Catálogo Público &rarr;
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
