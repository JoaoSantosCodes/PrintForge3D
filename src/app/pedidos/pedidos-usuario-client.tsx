"use client";

import { useState } from "react";
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
  XCircle,
  Star,
  MessageSquare,
  AlertTriangle,
  Store,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import {
  cancelarPedidoClienteAction,
  avaliarPedidoAction,
} from "@/app/actions/pedidos";

interface AvaliacaoData {
  id: string;
  nota: number;
  comentario: string | null;
}

interface PedidoUsuario {
  id: string;
  quantidade: number;
  precoAcordado: number | null;
  pago?: boolean;
  cupomCodigo?: string | null;
  status: string;
  observacoes: string | null;
  createdAt: string;
  empresa?: {
    nome: string;
    slug: string;
  } | null;
  peca: {
    id: string;
    nome: string;
    fotoUrl: string | null;
    categoria: string | null;
  };
  avaliacao: AvaliacaoData | null;
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
    label: "Enviado 🚚",
    color: "bg-blue-500/10 border-blue-500/30 text-blue-300",
    icon: Package,
    badge: "info",
  },
  entregue: {
    label: "Entregue ao Cliente 🎉",
    color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    icon: CheckCircle2,
    badge: "success",
  },
  cancelado: {
    label: "Pedido Cancelado ❌",
    color: "bg-rose-500/10 border-rose-500/30 text-rose-300",
    icon: XCircle,
    badge: "danger",
  },
};

export function PedidosUsuarioClient({
  pedidos,
  chavePix,
}: {
  pedidos: PedidoUsuario[];
  chavePix?: string | null;
}) {
  const [cancelModalPedidoId, setCancelModalPedidoId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const [reviewModalPedido, setReviewModalPedido] = useState<PedidoUsuario | null>(null);
  const [nota, setNota] = useState<number>(5);
  const [comentario, setComentario] = useState<string>("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleConfirmCancel = async () => {
    if (!cancelModalPedidoId) return;
    setCancelling(true);
    const res = await cancelarPedidoClienteAction(cancelModalPedidoId);
    setCancelling(false);
    setCancelModalPedidoId(null);
    if (res?.error) alert(res.error);
  };

  const handleConfirmReview = async () => {
    if (!reviewModalPedido) return;
    setSubmittingReview(true);
    setErrorMsg(null);

    const res = await avaliarPedidoAction(reviewModalPedido.id, nota, comentario);
    setSubmittingReview(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      setReviewModalPedido(null);
      setComentario("");
      setNota(5);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-teal-500 dark:text-teal-400" /> Meus Pedidos & Encomendas
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Acompanhe o status em tempo real das suas peças na fila de produção das lojas PrintForge 3D.
          </p>
        </div>

        <Link href="/">
          <Button variant="primary" size="sm" className="w-full sm:w-auto">
            <Sparkles className="w-4 h-4" /> Fazer Novo Pedido
          </Button>
        </Link>
      </div>

      {pedidos.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Você ainda não possui pedidos"
          description="Navegue pelas lojas do PrintForge 3D e faça sua primeira solicitação de impressão!"
          actionLabel="Ir para a Página Inicial"
          actionHref="/"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pedidos.map((pedido) => {
            const conf = STATUS_CONFIG[pedido.status] || STATUS_CONFIG.pendente;
            const StatusIcon = conf.icon;
            const isPendente = pedido.status === "pendente";
            const isEntregue = pedido.status === "entregue";

            return (
              <div
                key={pedido.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg dark:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Store Disambiguation Badge */}
                  {pedido.empresa && (
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                      <Link
                        href={`/loja/${pedido.empresa.slug}`}
                        className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                      >
                        <Store className="w-4 h-4 text-cyan-500" />
                        <span>Loja: {pedido.empresa.nome}</span>
                      </Link>
                      <span className="text-[10px] text-slate-400 font-mono">/loja/{pedido.empresa.slug}</span>
                    </div>
                  )}

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
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center shrink-0">
                      {pedido.peca.fotoUrl ? (
                        <img
                          src={pedido.peca.fotoUrl}
                          alt={pedido.peca.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Box className="w-8 h-8 text-slate-400 dark:text-slate-700" />
                      )}
                    </div>

                    <div className="space-y-1 min-w-0">
                      {pedido.peca.categoria && (
                        <span className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                          {pedido.peca.categoria}
                        </span>
                      )}
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                        {pedido.peca.nome}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
                        Quantidade: <strong className="text-slate-800 dark:text-slate-200">{pedido.quantidade}x unidades</strong>
                      </p>
                    </div>
                  </div>

                  {/* PIX Payment Banner */}
                  {(pedido.status === "pronto" || pedido.status === "aguardando_pagamento") && (
                    <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
                          <CheckCircle2 className="w-4 h-4 text-teal-400" />
                          <span>Pagamento via PIX</span>
                        </div>
                        <Badge variant={pedido.pago ? "success" : "warning"}>
                          {pedido.pago ? "Pagamento Confirmado ✅" : "Aguardando Pagamento ⏳"}
                        </Badge>
                      </div>

                      {pedido.precoAcordado && (
                        <p className="text-xs text-slate-300 font-semibold">
                          Valor Total: <strong className="text-teal-300 text-sm">R$ {pedido.precoAcordado.toFixed(2)}</strong>
                          {pedido.cupomCodigo && <span className="ml-2 text-[10px] text-teal-400 font-mono">(Cupom {pedido.cupomCodigo} aplicado)</span>}
                        </p>
                      )}
                    </div>
                  )}

                  {pedido.observacoes && (
                    <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl text-xs text-slate-400 italic">
                      &ldquo;{pedido.observacoes}&rdquo;
                    </div>
                  )}

                  {/* Review Section */}
                  {isEntregue && (
                    <div className="pt-2 border-t border-slate-800/80">
                      {pedido.avaliacao ? (
                        <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-teal-300">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span>Avaliado com {pedido.avaliacao.nota}/5 estrelas</span>
                          </div>
                          <span className="text-[11px] text-slate-400 italic truncate max-w-[150px]">
                            {pedido.avaliacao.comentario || "Sem comentário"}
                          </span>
                        </div>
                      ) : (
                        <Button
                          variant="secondary"
                          className="w-full text-xs py-2 bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20"
                          onClick={() => {
                            setReviewModalPedido(pedido);
                            setNota(5);
                            setComentario("");
                            setErrorMsg(null);
                          }}
                        >
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Avaliar esta Impressão 3D
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-600" /> Solicitado em:{" "}
                    <strong className="text-slate-400 font-semibold">
                      {new Date(pedido.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </strong>
                  </span>

                  {isPendente && (
                    <button
                      onClick={() => setCancelModalPedidoId(pedido.id)}
                      className="text-xs font-semibold text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancelar Pedido
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={!!cancelModalPedidoId}
        onClose={() => setCancelModalPedidoId(null)}
        title="Cancelar Solicitação de Pedido"
      >
        <div className="space-y-4">
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-300 text-xs font-medium">
            <AlertTriangle className="w-6 h-6 shrink-0 text-rose-400" />
            <p>
              Tem certeza que deseja cancelar este pedido? Uma vez cancelado, a solicitação não poderá ser reaberta.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setCancelModalPedidoId(null)} disabled={cancelling}>
              Voltar
            </Button>
            <button
              onClick={handleConfirmCancel}
              disabled={cancelling}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-sm transition-all"
            >
              {cancelling ? "Cancelando..." : "Sim, Cancelar Pedido"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!reviewModalPedido}
        onClose={() => setReviewModalPedido(null)}
        title={`Avaliar Peça — ${reviewModalPedido?.peca.nome}`}
      >
        <div className="space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Sua Nota (1 a 5 Estrelas) *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNota(star)}
                  className="p-2 bg-slate-950 border border-slate-800 rounded-xl hover:border-amber-500/50 transition-colors"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= nota ? "text-amber-400 fill-amber-400" : "text-slate-700"
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-extrabold text-amber-400 ml-2">
                {nota} / 5
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-teal-400" /> Seu Comentário sobre o Produto (Opcional)
            </label>
            <textarea
              rows={3}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="O que achou do acabamento, precisão e qualidade da impressão 3D?"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setReviewModalPedido(null)} disabled={submittingReview}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleConfirmReview} disabled={submittingReview}>
              {submittingReview ? "Enviando..." : "Enviar Avaliação"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
