"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, CheckCircle2, ShieldAlert, KeyRound, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { redefinirSenhaAction } from "@/app/actions/auth";

export default function RedefinirSenhaPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg("As senhas informadas não coincidem.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await redefinirSenhaAction(newPassword);
    setLoading(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else if (res?.success) {
      setSuccessMsg(res.message || "Sua senha foi redefinida com sucesso!");
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
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center justify-center gap-2">
          <KeyRound className="w-7 h-7 text-teal-400" /> Nova Senha
        </h2>
        <p className="text-xs text-slate-400">
          Crie uma nova senha de acesso para sua conta no PrintForge 3D.
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
                <h3 className="text-lg font-bold text-slate-100">Senha Alterada!</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  {successMsg}
                </p>
              </div>
              <div className="pt-2">
                <Link href="/login">
                  <Button variant="primary" className="w-full">
                    Fazer Login Agora <ArrowRight className="w-4 h-4 ml-1" />
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
                  Nova Senha (Mínimo 6 caracteres) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirme a Nova Senha *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button variant="primary" type="submit" disabled={loading} className="w-full py-2.5">
                  {loading ? "Salva nova senha..." : "Salvar Nova Senha"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
