"use client";

import { useState } from "react";
import Link from "next/link";
import { Box, User, Mail, Lock, CheckCircle2, ArrowRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cadastroAction } from "@/app/actions/auth";

export default function CadastroPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setErrorMsg("Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData(e.currentTarget);
    const res = await cadastroAction(formData);

    setLoading(false);
    if (res?.error) {
      setErrorMsg(res.error);
    } else if (res?.success) {
      setSuccessMsg(res.message || "Seu cadastro foi enviado e aguarda aprovação de um administrador.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100 selection:bg-teal-500 selection:text-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-xl shadow-teal-500/20 text-slate-950 font-black text-2xl group-hover:scale-105 transition-transform">
            3D
          </div>
        </Link>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-100">
          Criar Conta no <span className="text-teal-400">PrintForge 3D</span>
        </h2>
        <p className="text-xs text-slate-400">
          Cadastre-se para solicitar orçamento e acompanhar encomendas 3D.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-3xl sm:px-10 space-y-6">
          {successMsg ? (
            <div className="text-center space-y-4 py-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center justify-center mx-auto text-teal-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-100">Solicitação Enviada!</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  {successMsg}
                </p>
              </div>
              <div className="pt-2">
                <Link href="/login">
                  <Button variant="primary" className="w-full">
                    Ir para Tela de Login <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Seu Nome Completo *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="nome"
                    required
                    placeholder="Ex: João Santos"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Endereço de E-mail *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Senha de Acesso *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="acceptedTerms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-900"
                />
                <label htmlFor="acceptedTerms" className="text-xs text-slate-400 leading-tight select-none">
                  Li e concordo com os{" "}
                  <Link href="/termos" target="_blank" className="text-teal-400 hover:underline font-medium">
                    Termos de Uso
                  </Link>{" "}
                  e a{" "}
                  <Link href="/privacidade" target="_blank" className="text-teal-400 hover:underline font-medium">
                    Política de Privacidade
                  </Link>
                  .
                </label>
              </div>

              <div className="pt-2">
                <Button variant="primary" type="submit" disabled={loading || !acceptedTerms} className="w-full py-2.5">
                  {loading ? "Enviando cadastro..." : "Criar Minha Conta"}
                </Button>
              </div>

              <div className="text-center pt-2 border-t border-slate-800/80">
                <p className="text-xs text-slate-400">
                  Já possui uma conta?{" "}
                  <Link href="/login" className="text-teal-400 hover:underline font-semibold">
                    Fazer Login
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
