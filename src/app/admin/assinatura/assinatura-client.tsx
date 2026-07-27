"use client";

import { CreditCard, CheckCircle2, Clock, AlertTriangle, Printer, Layers, ShoppingBag, Sparkles, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface AssinaturaClientProps {
  empresa: {
    id: string;
    nome: string;
    slug: string;
    status: string;
    trialExpiraEm?: string | null;
    proximaCobranca?: string | null;
    plano: {
      id: string;
      nome: string;
      precoMensal: number;
      limiteImpressoras: number;
      limitePecas: number;
      limitePedidosMes: number;
    };
  };
  planos: {
    id: string;
    nome: string;
    precoMensal: number;
    limiteImpressoras: number;
    limitePecas: number;
    limitePedidosMes: number;
  }[];
  usage: {
    printers: number;
    pecas: number;
    pedidosMes: number;
  };
}

export default function AssinaturaClientPage({
  empresa,
  planos,
  usage,
}: AssinaturaClientProps) {
  if (!empresa) return null;

  const { plano } = empresa;

  // Calculate days remaining if trial
  let trialDaysLeft = 0;
  if (empresa.status === "trial" && empresa.trialExpiraEm) {
    const exp = new Date(empresa.trialExpiraEm).getTime();
    const now = new Date().getTime();
    trialDaysLeft = Math.max(0, Math.ceil((exp - now) / (1000 * 60 * 60 * 24)));
  }

  // Progress Bar Helper
  const renderProgressBar = (current: number, max: number) => {
    const percentage = Math.min(100, Math.round((current / (max || 1)) * 100));
    const isFull = current >= max;

    return (
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-slate-400">
            {current} / {max >= 999 ? "Ilimitado" : max}
          </span>
          <span className={isFull ? "text-rose-400 font-bold" : "text-slate-400"}>
            {max >= 999 ? "Disponível" : `${percentage}%`}
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isFull
                ? "bg-rose-500"
                : percentage > 80
                ? "bg-amber-500"
                : "bg-cyan-500"
            }`}
            style={{ width: `${max >= 999 ? 100 : percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const whatsappMessage = encodeURIComponent(
    `Olá! Sou da empresa "${empresa.nome}" (slug: ${empresa.slug}) e gostaria de alterar/renovar o meu plano no PrintForge 3D.`
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-cyan-500" /> Assinatura & Limites do Plano
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Consulte seu plano atual, consumo de recursos e regularize sua mensalidade.
          </p>
        </div>

        <a
          href={`https://wa.me/5511999999999?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all">
            <MessageCircle className="w-4 h-4" /> Suporte & Renovação WhatsApp
          </button>
        </a>
      </div>

      {/* Current Plan Status Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Plano Atual
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {plano?.nome || "Starter"}
            </h2>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-2xl font-black text-cyan-500">
              R$ {plano?.precoMensal?.toFixed(2) || "0.00"}
              <span className="text-xs text-slate-400 font-normal"> /mês</span>
            </div>

            <div className="mt-2">
              {empresa.status === "ativo" && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4" /> Assinatura Ativa
                </span>
              )}

              {empresa.status === "trial" && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                  <Clock className="w-4 h-4" /> Trial Grátis ({trialDaysLeft} dias restantes)
                </span>
              )}

              {(empresa.status === "inadimplente" || empresa.status === "trial_expirado") && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                  <AlertTriangle className="w-4 h-4" /> Pendente de Pagamento
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Usage Progress Bars */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Consumo de Recursos do Plano
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Printers */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center border border-cyan-500/20">
                  <Printer className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Impressoras</span>
              </div>
              {renderProgressBar(usage.printers, plano.limiteImpressoras)}
            </div>

            {/* Pieces */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Peças no Catálogo</span>
              </div>
              {renderProgressBar(usage.pecas, plano.limitePecas)}
            </div>

            {/* Orders per month */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">Pedidos no Mês</span>
              </div>
              {renderProgressBar(usage.pedidosMes, plano.limitePedidosMes)}
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans for Upgrade */}
      <div className="space-y-6">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" /> Planos Disponíveis para Upgrade
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {planos.map((p) => {
            const isCurrent = p.id === plano.id;

            return (
              <div
                key={p.id}
                className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 flex flex-col justify-between shadow-xl relative transition-all ${
                  isCurrent
                    ? "border-cyan-500 ring-2 ring-cyan-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{p.nome}</h3>
                    {isCurrent && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/30">
                        Plano Atual
                      </span>
                    )}
                  </div>

                  <div className="text-3xl font-black text-slate-900 dark:text-white mb-4">
                    R$ {p.precoMensal.toFixed(2)}
                    <span className="text-xs text-slate-400 font-normal"> /mês</span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4 mb-6">
                    <div>🖨️ {p.limiteImpressoras >= 999 ? "Ilimitadas" : `Até ${p.limiteImpressoras}`} impressoras</div>
                    <div>🧩 {p.limitePecas >= 999 ? "Ilimitadas" : `Até ${p.limitePecas}`} peças no catálogo</div>
                    <div>📦 {p.limitePedidosMes >= 999 ? "Ilimitados" : `Até ${p.limitePedidosMes}`} pedidos/mês</div>
                  </div>
                </div>

                {!isCurrent && (
                  <a
                    href={`https://wa.me/5511999999999?text=${encodeURIComponent(
                      `Olá! Gostaria de fazer o upgrade da minha loja "${empresa.nome}" para o plano "${p.nome}".`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button className="w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs transition-colors">
                      Solicitar Upgrade
                    </button>
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
