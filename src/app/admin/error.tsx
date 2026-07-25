"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro capturado no módulo Admin:", error);
  }, [error]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl max-w-xl mx-auto my-12 space-y-6 animate-in fade-in duration-300">
      <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-slate-100">Falha ao carregar este módulo admin</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Ocorreu um erro temporário durante o carregamento de dados deste módulo administrativo.
        </p>
      </div>

      {error?.message && (
        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-left text-xs font-mono text-amber-300/80 truncate">
          {error.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Button variant="primary" onClick={() => reset()} className="w-full sm:w-auto">
          <RefreshCw className="w-4 h-4" /> Tentar Novamente
        </Button>
        <Link href="/admin" className="w-full sm:w-auto">
          <Button variant="secondary" className="w-full">
            <LayoutDashboard className="w-4 h-4 text-teal-400" /> Ir para Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
