"use client";

import Link from "next/link";
import {
  ShoppingBag,
  Clock,
  Printer,
  Palette,
  CheckCircle2,
  Package,
  Box,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

interface PedidoUsuario {
  id: string;
  quantidade: number;
  status: string;
  observacoes: string | null;
  createdAt: string;
  peca: {
    id: string;
    nome: string;
    fotoUrl: string | null;
    categoria: string | null;
  };
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: any; badge: any }
> = {
  pendente: {
    label: "Aguardando Início",
    color: "bg-amber-500/10 border-amber-500/30 text-amber-300",
    icon: Clock,
    badge: "warning",
  },
  em_impressao: {
    label: "Em Impressão 3D",
    color: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
    icon: Printer,
    badge: "info",
  },
  pintando: {
    label: "Em Pintura / Acabamento",
    color: "bg-pink-500/10 border-pink-500/30 text-pink-300",
    icon: Palette,
    badge: "info",
  },
  pronto: {
    label: "Pronto para Retirada / Envio",
    color: "bg-teal-500/10 border-teal-500/30 text-teal-300",
    icon: CheckCircle2,
    badge: "success",
  },
  enviado: {
    label: "Enviado",
    color: "bg-blue-500/10 border-blue-500/30 text-blue-300",
    icon: Package,
    badge: "info",
  },
  entregue: {
    label: "Entregue ao Cliente",
    color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    icon: CheckCircle2,
    badge: "success",
  },
};

export function PedidosUsuarioClient({
  pedidos,
}: {
  pedidos: PedidoUsuario[];
}) {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 py-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-teal-400" /> Meus Pedidos & Encomendas
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Acompanhe o status em tempo real das suas peças na fila de produção da PrintForge 3D.
          </p>
        </div>

        <Link href="/catalogo">
          <Button variant="primary">
            <Sparkles className="w-4 h-4" /> Solicitar Novo Pedido
          </Button>
        </Link>
      </div>

      {/* Orders List */}
      {pedidos.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Você ainda não possui pedidos"
          description="Navegue pelo nosso catálogo de modelos 3D e faça sua primeira solicitação de impressão!"
          actionLabel="Ver Catálogo de Peças"
          actionHref="/catalogo"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pedidos.map((pedido) => {
            const conf = STATUS_CONFIG[pedido.status] || STATUS_CONFIG.pendente;
            const StatusIcon = conf.icon;

            return (
              <div
                key={pedido.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${conf.color}`}>
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <StatusIcon className="w-4 h-4 shrink-0" />
                      <span>{conf.label}</span>
                    </div>
                    <span className="text-[10px] font-mono opacity-70">
                      ID: #{pedido.id.slice(-6)}
                    </span>
                  </div>

                  {/* Piece Info */}
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center shrink-0">
                      {pedido.peca.fotoUrl ? (
                        <img
                          src={pedido.peca.fotoUrl}
                          alt={pedido.peca.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Box className="w-8 h-8 text-slate-700" />
                      )}
                    </div>

                    <div className="space-y-1">
                      {pedido.peca.categoria && (
                        <span className="text-[10px] font-semibold text-teal-400 uppercase tracking-wider">
                          {pedido.peca.categoria}
                        </span>
                      )}
                      <h3 className="text-lg font-bold text-slate-100 line-clamp-1">
                        {pedido.peca.nome}
                      </h3>
                      <p className="text-xs text-slate-400 font-semibold">
                        Quantidade: <strong className="text-slate-200">{pedido.quantidade}x unidades</strong>
                      </p>
                    </div>
                  </div>

                  {pedido.observacoes && (
                    <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl text-xs text-slate-400 italic">
                      &ldquo;{pedido.observacoes}&rdquo;
                    </div>
                  )}
                </div>

                {/* Footer Date */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-600" /> Solicitado em:
                  </span>
                  <span className="font-semibold text-slate-400">
                    {new Date(pedido.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
