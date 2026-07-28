"use client";

import { useState } from "react";
import { salvarPosicaoPreferencialAction } from "@/app/actions/indicacoes";
import { AffiliateCenterData, MemberNode } from "@/modules/referrals/services/affiliateService";
import { formatarMoeda } from "@/lib/custos";
import {
  Network,
  Copy,
  Check,
  ArrowLeftRight,
  ArrowLeft,
  ArrowRight,
  Award,
  Sparkles,
  Store,
  Clock,
  UserCheck,
  Share2,
  QrCode,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Layers,
  ChevronRight,
  X,
  ExternalLink,
  MessageSquare,
  Send,
  Linkedin,
  Facebook,
  Mail,
  Zap,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

export default function IndicacoesClientPage({ data }: { data: AffiliateCenterData }) {
  const [pref, setPref] = useState(data.posicaoPreferencial || "auto");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [loadingPref, setLoadingPref] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrModalUrl, setQrModalUrl] = useState("");
  const [selectedMember, setSelectedMember] = useState<MemberNode | null>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://printforge3d.com";
  const linkAuto = `${baseUrl}/criar-loja?ref=${data.codigoIndicacao}`;
  const linkEsquerda = `${baseUrl}/criar-loja?ref=${data.codigoIndicacao}&perna=esquerda`;
  const linkDireita = `${baseUrl}/criar-loja?ref=${data.codigoIndicacao}&perna=direita`;

  const linkAtual = pref === "esquerda" ? linkEsquerda : pref === "direita" ? linkDireita : linkAuto;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    toast.success(`Link (${label}) copiado!`);
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

  const openQrCodeModal = (url: string) => {
    setQrModalUrl(url);
    setShowQrModal(true);
  };

  const shareOnWhatsapp = (url: string) => {
    const text = encodeURIComponent(`Crie sua loja de Impressão 3D no PrintForge 3D com teste grátis: ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareOnTelegram = (url: string) => {
    const text = encodeURIComponent(`Conheça o PrintForge 3D — O Sistema Operacional para Impressão 3D`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`, "_blank");
  };

  const shareOnLinkedin = (url: string) => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
  };

  const shareOnEmail = (url: string) => {
    const subject = encodeURIComponent("Convite para o PrintForge 3D");
    const body = encodeURIComponent(`Olá! Estou te convidando para conhecer o PrintForge 3D: ${url}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> Nível: {data.recompensa.nivelAtual}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-2 flex items-center gap-3">
            <Network className="w-7 h-7 text-purple-600 dark:text-purple-400" /> Centro de Afiliados & Indicação Binária
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Transforme suas indicações em renda recorrente e construa sua rede binária de impressores 3D.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openQrCodeModal(linkAuto)}
            className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md hover:scale-105"
          >
            <QrCode className="w-4 h-4" /> Gerar Meu QR Code
          </button>
        </div>
      </div>

      {/* 1. Dashboard no Topo (4 KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total de Indicados
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20 shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {data.kpis.totalIndicados} <span className="text-xs text-slate-400 font-normal">vendedores</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Membros vinculados à sua rede</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Usuários Ativos
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {data.kpis.ativosCount} <span className="text-xs text-slate-400 font-normal">ativos</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Lojas operando ativamente</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pontos de Rede
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center border border-cyan-500/20 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-cyan-600 dark:text-cyan-400 tracking-tight">
            {data.kpis.totalPontos} <span className="text-xs text-slate-400 font-normal">pts</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Acumulados para subir de nível</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Comissão Recorrente
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
            {formatarMoeda(data.kpis.comissaoEstimada)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Estimada por assinaturas pagas</p>
        </div>
      </div>

      {/* 2. Barra de Progresso & Níveis de Gamificação */}
      <div className="bg-white dark:bg-slate-900 border border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" /> Próxima Recompensa: {data.recompensa.proximoNivel}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Acumule pontos na sua rede binária para desbloquear prêmios e bônus exclusivos.
            </p>
          </div>

          <div className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono">
            {data.recompensa.pontosAtuais} / {data.recompensa.pontosProximoNivel} pts{" "}
            {data.recompensa.pontosFaltantes > 0 && `(Faltam ${data.recompensa.pontosFaltantes} pts)`}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-purple-600 via-cyan-500 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${data.recompensa.progressoPercentual}%` }}
          />
        </div>

        {/* Reward Levels Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className={`p-3 rounded-2xl border text-center ${data.recompensa.pontosAtuais >= 500 ? "bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold" : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400"}`}>
            <div className="text-xs uppercase font-extrabold">🥉 Bronze</div>
            <div className="text-[11px] font-mono mt-0.5">500 pts</div>
          </div>

          <div className={`p-3 rounded-2xl border text-center ${data.recompensa.pontosAtuais >= 2000 ? "bg-slate-300/10 border-slate-300/40 text-slate-200 font-bold" : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400"}`}>
            <div className="text-xs uppercase font-extrabold">🥈 Prata</div>
            <div className="text-[11px] font-mono mt-0.5">2.000 pts</div>
          </div>

          <div className={`p-3 rounded-2xl border text-center ${data.recompensa.pontosAtuais >= 5000 ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-400 font-bold" : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400"}`}>
            <div className="text-xs uppercase font-extrabold">🥇 Ouro</div>
            <div className="text-[11px] font-mono mt-0.5">5.000 pts</div>
          </div>

          <div className={`p-3 rounded-2xl border text-center ${data.recompensa.pontosAtuais >= 15000 ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 font-bold" : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400"}`}>
            <div className="text-xs uppercase font-extrabold">💎 Diamante</div>
            <div className="text-[11px] font-mono mt-0.5">15.000 pts</div>
          </div>
        </div>
      </div>

      {/* ⭐ 3. Funil de Conversão de Marketing (Recurso Essencial) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" /> Funil de Conversão de Indicações
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rastreamento em tempo real do caminho percorrido pelos seus indicados desde o primeiro acesso até a assinatura paga.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold">
            Taxa Final: {data.funil.taxaConversaoFinal}%
          </span>
        </div>

        {/* Funnel Steps Visual Stack */}
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>1. Convites Enviados</span>
              <span className="font-mono">{data.funil.convitesEnviados} convites</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-950 h-6 rounded-xl overflow-hidden p-0.5">
              <div className="h-full bg-purple-600 rounded-lg flex items-center justify-end px-3 text-[10px] font-bold text-white shadow-sm" style={{ width: "100%" }}>
                100%
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>2. Links Acessados</span>
              <span className="font-mono">{data.funil.linksAcessados} acessos</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-950 h-6 rounded-xl overflow-hidden p-0.5">
              <div className="h-full bg-cyan-500 rounded-lg flex items-center justify-end px-3 text-[10px] font-bold text-white shadow-sm" style={{ width: "75%" }}>
                75%
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>3. Cadastros Iniciados</span>
              <span className="font-mono">{data.funil.cadastrosIniciados} cadastros</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-950 h-6 rounded-xl overflow-hidden p-0.5">
              <div className="h-full bg-indigo-500 rounded-lg flex items-center justify-end px-3 text-[10px] font-bold text-white shadow-sm" style={{ width: "55%" }}>
                55%
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>4. Lojas Criadas</span>
              <span className="font-mono">{data.funil.lojasCriadas} lojas</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-950 h-6 rounded-xl overflow-hidden p-0.5">
              <div className="h-full bg-blue-500 rounded-lg flex items-center justify-end px-3 text-[10px] font-bold text-white shadow-sm" style={{ width: "40%" }}>
                40%
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>5. Assinaturas Pagas (Conversão Final)</span>
              <span className="font-mono text-emerald-400">{data.funil.assinaturasPagas} pagantes</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-950 h-6 rounded-xl overflow-hidden p-0.5">
              <div className="h-full bg-emerald-500 rounded-lg flex items-center justify-end px-3 text-[10px] font-bold text-white shadow-sm" style={{ width: `${Math.max(15, data.funil.taxaConversaoFinal)}%` }}>
                {data.funil.taxaConversaoFinal}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Código de Indicação & Seletor de Pernas com Compartilhamento Direto */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card Grande de Código & Link */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-purple-500" /> Seu Código & Link Único de Divulgação
            </h2>
            <span className="text-xs text-slate-400 font-mono">1-Clique para Compartilhar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Box Código */}
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Seu Código Promocional:
              </span>
              <div className="font-mono font-black text-2xl text-purple-600 dark:text-purple-400 tracking-widest">
                {data.codigoIndicacao}
              </div>
              <button
                onClick={() => copyToClipboard(data.codigoIndicacao, "Código")}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                {copiedLink === "Código" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                Copiar Código
              </button>
            </div>

            {/* Box Link Ativo */}
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Link com Alocação Atual:
              </span>
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                {linkAtual}
              </div>
              <button
                onClick={() => copyToClipboard(linkAtual, "Link")}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                {copiedLink === "Link" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                Copiar Link
              </button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Compartilhar Direto sem Passos Intermediários:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => shareOnWhatsapp(linkAtual)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
              </button>

              <button
                onClick={() => shareOnTelegram(linkAtual)}
                className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Send className="w-3.5 h-3.5" /> Telegram
              </button>

              <button
                onClick={() => shareOnLinkedin(linkAtual)}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Linkedin className="w-3.5 h-3.5" /> LinkedIn
              </button>

              <button
                onClick={() => shareOnEmail(linkAtual)}
                className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" /> E-mail
              </button>
            </div>
          </div>
        </div>

        {/* Control Box: Seletor Visual de Pernas */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-cyan-400" /> Perna de Derramamento
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Escolha onde posicionar os novos vendedores que entrarem pelo seu link principal.
          </p>

          <div className="space-y-2">
            <button
              onClick={() => handlePrefChange("auto")}
              disabled={loadingPref}
              className={`w-full py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                pref === "auto"
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              }`}
            >
              <span className="flex items-center gap-2"><ArrowLeftRight className="w-4 h-4" /> ○ Automático (Equilibrado)</span>
              {pref === "auto" && <Check className="w-4 h-4" />}
            </button>

            <button
              onClick={() => handlePrefChange("esquerda")}
              disabled={loadingPref}
              className={`w-full py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                pref === "esquerda"
                  ? "bg-cyan-600 text-white shadow-md"
                  : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              }`}
            >
              <span className="flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> ← Perna Esquerda</span>
              {pref === "esquerda" && <Check className="w-4 h-4" />}
            </button>

            <button
              onClick={() => handlePrefChange("direita")}
              disabled={loadingPref}
              className={`w-full py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-between ${
                pref === "direita"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              }`}
            >
              <span className="flex items-center gap-2">→ Perna Direita <ArrowRight className="w-4 h-4" /></span>
              {pref === "direita" && <Check className="w-4 h-4" />}
            </button>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            Equilíbrio Atual: <strong className="text-slate-900 dark:text-slate-100">{data.equilibrio.percentualEquilibrio}%</strong> ({data.equilibrio.membrosEsquerda} ⬅️ vs {data.equilibrio.membrosDireita} ➡️)
          </div>
        </div>
      </div>

      {/* 5. Árvore Binária Visual Estilo GitKraken / GitHub */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" /> Sua Árvore Binária de Vendedores
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Clique em qualquer card de vendedor para abrir o Drawer Lateral com detalhes completos.
          </p>
        </div>

        {/* Binary Grid Branches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Branch Esquerdo */}
          <div className="bg-white dark:bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-extrabold text-base">
                <ArrowLeft className="w-5 h-5" /> Ramo Esquerdo ({data.nosEsquerda.length})
              </div>
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Perna Esquerda
              </span>
            </div>

            {data.nosEsquerda.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs italic">
                Nenhum vendedor cadastrado na perna esquerda ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {data.nosEsquerda.map((node) => (
                  <div
                    key={node.id}
                    onClick={() => setSelectedMember(node)}
                    className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 shadow-sm hover:border-cyan-500 cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center border border-cyan-500/30">
                        {node.nome.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{node.nome}</div>
                        <div className="text-xs text-slate-400">{node.email}</div>
                        {node.empresaNome && (
                          <div className="text-[11px] text-cyan-400 font-semibold mt-0.5 flex items-center gap-1">
                            <Store className="w-3 h-3" /> {node.empresaNome}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {node.planoNome}
                      </span>
                      <div className="text-[11px] font-mono text-cyan-400">{node.pontosGerados} pts</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Branch Direito */}
          <div className="bg-white dark:bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-500/20 pb-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-base">
                Ramo Direito ({data.nosDireita.length}) <ArrowRight className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                Perna Direita
              </span>
            </div>

            {data.nosDireita.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs italic">
                Nenhum vendedor cadastrado na perna direita ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {data.nosDireita.map((node) => (
                  <div
                    key={node.id}
                    onClick={() => setSelectedMember(node)}
                    className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 shadow-sm hover:border-indigo-500 cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center border border-indigo-500/30">
                        {node.nome.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{node.nome}</div>
                        <div className="text-xs text-slate-400">{node.email}</div>
                        {node.empresaNome && (
                          <div className="text-[11px] text-indigo-400 font-semibold mt-0.5 flex items-center gap-1">
                            <Store className="w-3 h-3" /> {node.empresaNome}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {node.planoNome}
                      </span>
                      <div className="text-[11px] font-mono text-indigo-400">{node.pontosGerados} pts</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. Timeline de Atividades & Alertas Estratégicos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Recente */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" /> Timeline de Atividades Recentes
          </h2>

          {data.timeline.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs italic">Nenhuma atividade recente.</div>
          ) : (
            <div className="space-y-3">
              {data.timeline.map((evt) => (
                <div key={evt.id} className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{evt.titulo}</div>
                    <div className="text-slate-400">{evt.descricao}</div>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">{evt.data}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Central de Alertas Estratégicos */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" /> Central de Alertas Operacionais
          </h2>

          {data.alertas.length === 0 ? (
            <div className="py-8 text-center text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Todos os indicados da sua rede estão com contas ativas e em dia!
            </div>
          ) : (
            <div className="space-y-3">
              {data.alertas.map((alt) => (
                <div key={alt.id} className="p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-2xl flex items-center gap-3 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{alt.mensagem}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drawer Lateral de Detalhes do Membro */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedMember(null)} />
          <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 p-6 shadow-2xl z-10 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" /> Detalhes do Indicado
                </h3>
                <button onClick={() => setSelectedMember(null)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 font-extrabold text-xl flex items-center justify-center border border-purple-500/30">
                    {selectedMember.nome.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">{selectedMember.nome}</h4>
                    <p className="text-xs text-slate-400">{selectedMember.email}</p>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 mt-1">
                      Perna {selectedMember.perna === "direita" ? "Direita ➡️" : "Esquerda ⬅️"}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Plano Atual:</span>
                    <span className="font-bold text-white">{selectedMember.planoNome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Loja Vinculada:</span>
                    <span className="font-bold text-cyan-400">{selectedMember.empresaNome || "Sem Loja"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pontos Gerados:</span>
                    <span className="font-bold text-purple-400 font-mono">{selectedMember.pontosGerados} pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Data de Entrada:</span>
                    <span className="font-bold text-slate-300">{new Date(selectedMember.createdAt).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedMember(null)}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Fechar Detalhes
            </button>
          </div>
        </div>
      )}

      {/* QR Code Modal Overlay */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setShowQrModal(false)} />
          <div className="relative max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-5 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowQrModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-lg text-white flex items-center justify-center gap-2">
              <QrCode className="w-5 h-5 text-purple-400" /> Seu QR Code de Indicação
            </h3>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrModalUrl)}`}
                alt="QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <p className="text-xs text-slate-400">
              Escaneie este QR Code para abrir o formulário de criação de loja vinculado à sua conta.
            </p>

            <button
              onClick={() => copyToClipboard(qrModalUrl, "URL QR Code")}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" /> Copiar Link do QR Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
