"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro inesperado capturado pelo Error Boundary Global:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center shadow-2xl space-y-6">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-100">Ops! Algo deu errado</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ocorreu uma falha inesperada na aplicação. Não se preocupe, seus dados estão seguros.
          </p>
        </div>

        {error?.message && (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-left text-xs font-mono text-rose-300/80 truncate">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button variant="primary" onClick={() => reset()} className="w-full sm:w-auto">
            <RefreshCw className="w-4 h-4" /> Tentar Novamente
          </Button>
          <Link href="/admin" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full">
              <Home className="w-4 h-4" /> Voltar ao Início
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
