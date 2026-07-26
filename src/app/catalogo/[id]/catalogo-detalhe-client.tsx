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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { criarPedidoClienteAction } from "@/app/actions/pedidos";

interface CatalogoDetalheClientProps {
  peca: {
    id: string;
    nome: string;
    descricao: string | null;
    categoria: string | null;
    fotoUrl: string | null;
    status: string;
  };
  isLoggedIn: boolean;
  userProfile: {
    nome: string | null;
    email: string;
  } | null;
}

export function CatalogoDetalheClient({
  peca,
  isLoggedIn,
  userProfile,
}: CatalogoDetalheClientProps) {
  const router = useRouter();
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [quantidade, setQuantidade] = useState(1);
  const [observacoes, setObservacoes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOrderButtonClick = () => {
    if (!isLoggedIn) {
      router.push(`/login?redirectTo=/catalogo/${peca.id}`);
      return;
    }
    setIsOrderModalOpen(true);
  };

  const handleConfirmOrder = async () => {
    setSubmitting(true);
    setErrorMsg(null);

    const res = await criarPedidoClienteAction(peca.id, quantidade, observacoes);

    setSubmitting(false);
    if (res?.error) {
      setErrorMsg(res.error);
    } else if (res?.success && res.pedidoId) {
      setOrderSuccessId(res.pedidoId);
      setIsOrderModalOpen(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Navigation */}
      <div>
        <Link href="/catalogo">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Catálogo
          </Button>
        </Link>
      </div>

      {/* Main Detail Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2">
        {/* Left: Large Photo */}
        <div className="relative min-h-[350px] sm:min-h-[450px] bg-slate-950 flex items-center justify-center p-4 border-b md:border-b-0 md:border-r border-slate-800">
          {peca.fotoUrl ? (
            <img
              src={peca.fotoUrl}
              alt={peca.nome}
              className="w-full h-full object-contain max-h-[550px] rounded-2xl"
            />
          ) : (
            <div className="text-center p-8">
              <Box className="w-20 h-20 text-slate-700 mx-auto mb-4" />
              <span className="text-sm text-slate-500 font-medium">Foto não disponível</span>
            </div>
          )}
        </div>

        {/* Right: Content details */}
        <div className="p-8 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {peca.categoria && <Badge variant="info">{peca.categoria}</Badge>}
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Modelo Verificado 3D
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
              {peca.nome}
            </h1>

            <div className="pt-4 border-t border-slate-800/80">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Descrição do Modelo:
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {peca.descricao || "Esta peça não possui descrição adicional detalhada."}
              </p>
            </div>
          </div>

          {/* Action Order Section */}
          <div className="pt-6 border-t border-slate-800/80 space-y-4">
            {orderSuccessId ? (
              <div className="p-5 bg-teal-500/10 border border-teal-500/30 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-teal-400" /> Pedido Solicitado com Sucesso!
                </div>
                <p className="text-xs text-slate-300">
                  Sua encomenda foi enviada para a fila de produção da PrintForge 3D.
                </p>
                <Link href="/pedidos" className="block pt-1">
                  <Button variant="primary" className="w-full">
                    Acompanhar em Meus Pedidos &rarr;
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Button
                  variant="primary"
                  className="w-full py-3.5 text-base shadow-xl shadow-teal-500/10"
                  onClick={handleOrderButtonClick}
                >
                  <ShoppingBag className="w-5 h-5" /> Fazer Pedido desta Peça
                </Button>

                {!isLoggedIn && (
                  <p className="text-[11px] text-slate-500 text-center">
                    Você será redirecionado para a página de login para confirmar seu pedido.
                  </p>
                )}
              </>
            )}

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-teal-400 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-slate-200">Garantia de Qualidade PrintForge 3D</p>
                <p className="text-slate-400 mt-0.5">
                  Produzido sob demanda com inspeção de acabamento e suporte direto ao cliente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Modal for Logged In Client */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        title={`Solicitar Pedido — ${peca.nome}`}
      >
        <div className="space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Solicitante do Pedido:
            </span>
            <p className="text-sm font-bold text-slate-200">
              {userProfile?.nome || userProfile?.email}
            </p>
            <p className="text-xs text-slate-400">{userProfile?.email}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Quantidade de Unidades *
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 flex items-center justify-center hover:bg-slate-800 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>

              <input
                type="number"
                min={1}
                value={quantidade}
                onChange={(e) => setQuantidade(Math.max(1, Number(e.target.value)))}
                className="w-20 text-center py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-slate-100 focus:outline-none focus:border-teal-500"
              />

              <button
                type="button"
                onClick={() => setQuantidade((q) => q + 1)}
                className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 flex items-center justify-center hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-teal-400" /> Observações ou Preferências de Cor
            </label>
            <textarea
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Gostaria na cor preta com preenchimento reforçado..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsOrderModalOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirmOrder}
              disabled={submitting}
            >
              {submitting ? "Enviando..." : "Confirmar Solicitação de Pedido"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
