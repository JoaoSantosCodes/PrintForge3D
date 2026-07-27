"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, ShieldAlert, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { solicitarRecuperacaoSenhaAction } from "@/app/actions/auth";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await solicitarRecuperacaoSenhaAction(email);
    setLoading(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else if (res?.success) {
      setSuccessMsg(res.message || "Instruções de recuperação enviadas para seu e-mail.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100 relative transition-colors">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-xl shadow-teal-500/20 text-slate-950 font-black text-2xl group-hover:scale-105 transition-transform">
            3D
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
          <KeyRound className="w-7 h-7 text-teal-500 dark:text-teal-400" /> Recuperar Senha
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Informe seu e-mail para receber o link de redefinição de senha.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-8 px-6 shadow-xl dark:shadow-2xl rounded-3xl sm:px-10 space-y-6 transition-colors">
          {successMsg ? (
            <div className="text-center space-y-4 py-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center justify-center mx-auto text-teal-500 dark:text-teal-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">E-mail Enviado!</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                  {successMsg}
                </p>
              </div>
              <div className="pt-2">
                <Link href="/login">
                  <Button variant="primary" className="w-full">
                    Voltar para o Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Seu E-mail Cadastrado *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button variant="primary" type="submit" disabled={loading} className="w-full py-2.5">
                  {loading ? "Enviando e-mail..." : "Enviar Instruções de Recuperação"}
                </Button>
              </div>

              <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800/80">
                <Link href="/login" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 inline-flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
