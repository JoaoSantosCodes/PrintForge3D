"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Box,
  CheckCircle2,
  ShieldCheck,
  ShoppingBag,
  Plus,
  Minus,
  MessageSquare,
  Sparkles,
  Store,
} from "lucide-react";
import { criarPedidoClienteAction } from "@/app/actions/pedidos";

export default function PecaLojaClient({
  empresa,
  peca,
  avaliacoes = [],
  userProfile,
}: {
  empresa: { id: string; nome: string; slug: string; configuracao?: { chavePix?: string | null } | null };
  peca: any;
  avaliacoes?: any[];
  userProfile?: { nome: string | null; email: string } | null;
}) {
  const router = useRouter();
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFazerPedido = async () => {
    setLoading(true);
    setError(null);
    const res = await criarPedidoClienteAction(peca.id, quantidade);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else if (res.success) {
      setOrderSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href={`/loja/${empresa.slug}`} className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Voltar para {empresa.nome}
        </Link>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
            {peca.fotoUrl ? (
              <img src={peca.fotoUrl} alt={peca.nome} className="w-full h-full object-cover" />
            ) : (
              <Box className="w-16 h-16 text-slate-700" />
            )}
          </div>

          <div className="space-y-6 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase">
                {peca.categoria || "Geral"}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{peca.nome}</h1>
              <p className="text-xs text-slate-400">{peca.descricao || "Sem descrição cadastrada."}</p>
            </div>

            {orderSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs space-y-2">
                <div className="font-extrabold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Pedido Realizado com Sucesso!
                </div>
                <p>O vendedor receberá sua solicitação em breve.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">{error}</div>}

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Quantidade:</span>
                  <div className="flex items-center border border-slate-800 rounded-xl bg-slate-950 p-1">
                    <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))} className="p-1 text-slate-400 hover:text-white">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3 text-sm font-bold">{quantidade}</span>
                    <button onClick={() => setQuantidade(quantidade + 1)} className="p-1 text-slate-400 hover:text-white">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleFazerPedido}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" /> Encomendar Esta Peça
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
