"use client";

import { useState } from "react";
import { salvarPosicaoPreferencialAction } from "@/app/actions/indicacoes";
import { Network, Copy, Check, ArrowLeftRight, ArrowLeft, ArrowRight, ShieldCheck, Award, Sparkles, Store, Clock, UserCheck } from "lucide-react";
import { toast } from "sonner";

interface Indicado {
  id: string;
  nome: string | null;
  email: string;
  status: string;
  role: string;
  createdAt: Date | string;
  empresa?: {
    nome: string;
    slug: string;
  } | null;
}

export default function IndicacoesClientPage({
  codigoIndicacao,
  posicaoPreferencial,
  indicadosEsquerda,
  indicadosDireita,
  totalPontos,
}: {
  codigoIndicacao: string;
  posicaoPreferencial: string;
  indicadosEsquerda: Indicado[];
  indicadosDireita: Indicado[];
  totalPontos: number;
}) {
  const [pref, setPref] = useState(posicaoPreferencial);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [loadingPref, setLoadingPref] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://printforge3d.com";
  const linkAuto = `${baseUrl}/criar-loja?ref=${codigoIndicacao}`;
  const linkEsquerda = `${baseUrl}/criar-loja?ref=${codigoIndicacao}&perna=esquerda`;
  const linkDireita = `${baseUrl}/criar-loja?ref=${codigoIndicacao}&perna=direita`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(type);
    toast.success(`Link (${type}) copiado para a área de transferência!`);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handlePrefChange = async (novaPref: "auto" | "esquerda" | "direita") => {
    setLoadingPref(true);
    setPref(novaPref);
    const res = await salvarPosicaoPreferencialAction(novaPref);
    setLoadingPref(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <Network className="w-7 h-7 text-purple-600 dark:text-purple-400" /> Sistema de Indicação Binário
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Indique novos vendedores para a plataforma e construa sua rede binária (Perna Esquerda / Perna Direita).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-300 text-xs font-bold flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-500" /> Total de Pontos: <span className="font-extrabold text-sm text-purple-600 dark:text-purple-400">{totalPontos} pts</span>
          </div>
        </div>
      </div>

      {/* Code & Preference Control Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Your Referral Code */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Seu Código Único de Indicação:
            </span>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono font-black text-xl text-purple-600 dark:text-purple-400 tracking-widest">
                {codigoIndicacao}
              </div>
              <button
                onClick={() => copyToClipboard(linkAuto, "Código")}
                className="px-3.5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md"
              >
                {copiedLink === "Código" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                Copiar Código
              </button>
            </div>
          </div>

          {/* Leg Preference Selector */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Perna Preferencial de Derramamento:
            </span>
            <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => handlePrefChange("esquerda")}
                disabled={loadingPref}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  pref === "esquerda"
                    ? "bg-cyan-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-cyan-500"
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Perna Esquerda
              </button>

              <button
                onClick={() => handlePrefChange("auto")}
                disabled={loadingPref}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  pref === "auto"
                    ? "bg-purple-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-purple-400"
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" /> Automático (Equilibrado)
              </button>

              <button
                onClick={() => handlePrefChange("direita")}
                disabled={loadingPref}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  pref === "direita"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-600 dark:text-slate-400 hover:text-indigo-400"
                }`}
              >
                Perna Direita <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Copyable Links Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          {/* Link Auto */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5"><ArrowLeftRight className="w-3.5 h-3.5 text-purple-400" /> Link Geral (Auto)</span>
              <button
                onClick={() => copyToClipboard(linkAuto, "Auto")}
                className="text-purple-600 dark:text-purple-400 hover:underline font-bold"
              >
                {copiedLink === "Auto" ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <div className="text-[11px] font-mono text-slate-500 truncate bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
              {linkAuto}
            </div>
          </div>

          {/* Link Esquerda */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-600 dark:text-cyan-400">
              <span className="flex items-center gap-1.5"><ArrowLeft className="w-3.5 h-3.5" /> Link Perna Esquerda</span>
              <button
                onClick={() => copyToClipboard(linkEsquerda, "Esquerda")}
                className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold"
              >
                {copiedLink === "Esquerda" ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <div className="text-[11px] font-mono text-slate-500 truncate bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
              {linkEsquerda}
            </div>
          </div>

          {/* Link Direita */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span className="flex items-center gap-1.5"><ArrowRight className="w-3.5 h-3.5" /> Link Perna Direita</span>
              <button
                onClick={() => copyToClipboard(linkDireita, "Direita")}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
              >
                {copiedLink === "Direita" ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <div className="text-[11px] font-mono text-slate-500 truncate bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
              {linkDireita}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Binary Tree Component */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" /> Sua Árvore Binária de Indicações
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hierarquia visual dos vendedores e usuários vinculados à sua perna esquerda e perna direita.
          </p>
        </div>

        {/* Binary Tree Structure Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Branch Box */}
          <div className="bg-white dark:bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-extrabold text-base">
                <ArrowLeft className="w-5 h-5" /> Perna Esquerda ({indicadosEsquerda.length})
              </div>
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Ramo Esquerdo
              </span>
            </div>

            {indicadosEsquerda.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs italic">
                Nenhum indicado cadastrado na perna esquerda ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {indicadosEsquerda.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 shadow-sm hover:border-cyan-500/40 transition-colors"
                  >
                    <div className="space-y-0.5 truncate">
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                        {item.nome || item.email.split("@")[0]}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.email}</div>
                      {item.empresa && (
                        <div className="text-[11px] text-cyan-500 font-semibold flex items-center gap-1 mt-1">
                          <Store className="w-3 h-3" /> {item.empresa.nome} (/loja/{item.empresa.slug})
                        </div>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
                        item.status === "aprovado"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Branch Box */}
          <div className="bg-white dark:bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-base">
                Perna Direita ({indicadosDireita.length}) <ArrowRight className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                Ramo Direito
              </span>
            </div>

            {indicadosDireita.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs italic">
                Nenhum indicado cadastrado na perna direita ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {indicadosDireita.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 shadow-sm hover:border-indigo-500/40 transition-colors"
                  >
                    <div className="space-y-0.5 truncate">
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                        {item.nome || item.email.split("@")[0]}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.email}</div>
                      {item.empresa && (
                        <div className="text-[11px] text-indigo-500 font-semibold flex items-center gap-1 mt-1">
                          <Store className="w-3 h-3" /> {item.empresa.nome} (/loja/{item.empresa.slug})
                        </div>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
                        item.status === "aprovado"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
