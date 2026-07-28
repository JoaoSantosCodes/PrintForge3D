"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Gift,
  Trophy,
  Award,
  Crown,
  Zap,
  Star,
  Shield,
  Gem,
  Copy,
  Check,
  Share2,
  Send,
  Mail,
  QrCode,
  Sparkles,
  ShoppingBag,
  History,
  TrendingUp,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { resgatarItemAction } from "@/app/actions/rewards";

interface RewardsClientProps {
  data: {
    codigoIndicacao: string;
    nivelInfo: {
      nivelAtual: { nome: string; pontosMinimos: number; icone: string | null; cor: string | null };
      proximoNivel: { nome: string; pontosMinimos: number; icone: string | null; cor: string | null } | null;
      saldoAtual: number;
      pontosParaProximo: number;
      progressoPercentual: number;
    };
    kpis: {
      saldoPontos: number;
      totalIndicacoes: number;
      assinaturasConvertidas: number;
      resgatesRealizados: number;
    };
    graficoPontos: Array<{ mes: string; pontos: number }>;
    timeline: Array<{
      id: string;
      tipo: string;
      evento: string;
      pontos: number;
      descricao: string | null;
      data: string;
    }>;
    catalogo: Array<{
      id: string;
      nome: string;
      descricao: string | null;
      imagemUrl: string | null;
      categoria: string;
      pontosNecessarios: number;
      estoque: number | null;
      ativo: boolean;
    }>;
    resgates: Array<{
      id: string;
      itemNome: string;
      categoria: string;
      pontosGastos: number;
      status: string;
      data: string;
    }>;
    conquistas: Array<{
      id: string;
      nome: string;
      descricao: string;
      icone: string | null;
      raridade: string;
      criterioTipo: string;
      criterioValor: number;
      desbloqueado: boolean;
      progressoAtual: number;
    }>;
    missoes: Array<{
      id: string;
      nome: string;
      descricao: string;
      tipo: string;
      criterioTipo: string;
      criterioValor: number;
      recompensaPontos: number;
      progressoAtual: number;
      concluida: boolean;
    }>;
  };
}

const renderIconeNivel = (nome: string, className = "w-6 h-6") => {
  switch (nome.toLowerCase()) {
    case "bronze":
      return <Shield className={className} />;
    case "prata":
      return <Award className={className} />;
    case "ouro":
      return <Crown className={className} />;
    case "diamante":
      return <Gem className={className} />;
    case "platinum":
      return <Zap className={className} />;
    case "elite":
      return <Star className={className} />;
    default:
      return <Trophy className={className} />;
  }
};

export default function VendedorRewardsClient({ data }: RewardsClientProps) {
  const [activeTab, setActiveTab] = useState<"loja" | "resgates" | "conquistas" | "missoes" | "extrato">("loja");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [resgatandoId, setResgatandoId] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://printforge3d.com";
  const linkRefCompleto = `${baseUrl}/criar-loja?ref=${data.codigoIndicacao}`;

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(linkRefCompleto);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsapp = () => {
    const texto = encodeURIComponent(`Venha conhecer o PrintForge 3D — O Sistema Operacional para Impressão 3D! Crie sua loja com meu convite: ${linkRefCompleto}`);
    window.open(`https://api.whatsapp.com/send?text=${texto}`, "_blank");
  };

  const shareTelegram = () => {
    const texto = encodeURIComponent(`Crie sua loja no PrintForge 3D com meu link de indicação: ${linkRefCompleto}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(linkRefCompleto)}&text=${texto}`, "_blank");
  };

  const shareEmail = () => {
    const assunto = encodeURIComponent("Convite especial — PrintForge 3D");
    const corpo = encodeURIComponent(`Olá!\n\nEstou te convidando para conhecer o PrintForge 3D. Cadastre-se pelo link abaixo para ter acesso à plataforma:\n\n${linkRefCompleto}\n\nAbraços!`);
    window.open(`mailto:?subject=${assunto}&body=${corpo}`, "_blank");
  };

  const handleResgateSubmit = async (itemId: string) => {
    setResgatandoId(itemId);
    setMensagemSucesso(null);
    setMensagemErro(null);

    const res = await resgatarItemAction(itemId);
    setResgatandoId(null);

    if (res?.error) {
      setMensagemErro(res.error);
    } else if (res?.success) {
      setMensagemSucesso(res.message || "Recompensa resgatada com sucesso!");
    }
  };

  // Filtragem do catálogo
  const catalogoFiltrado = data.catalogo.filter((item) => {
    const matchCat = categoriaFiltro === "todos" || item.categoria === categoriaFiltro;
    const matchQuery = item.nome.toLowerCase().includes(searchQuery.toLowerCase()) || (item.descricao || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header Banner do Nível e Progresso */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border border-white/10"
                style={{ backgroundColor: data.nivelInfo.nivelAtual.cor || "#14b8a6" }}
              >
                {renderIconeNivel(data.nivelInfo.nivelAtual.nome, "w-7 h-7 text-slate-950")}
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-teal-400">
                  PrintForge Rewards
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                  Nível {data.nivelInfo.nivelAtual.nome}
                </h1>
              </div>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Ganhe pontos por indicações e atividades do seu negócio. Troque por filamentos, cupons e prêmios sem custo!
            </p>
          </div>

          {/* Saldo de Pontos & Progresso */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 min-w-[280px] sm:min-w-[340px] space-y-4 backdrop-blur-md shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Saldo Disponível
              </span>
              <Badge variant="secondary" className="border-teal-500/30 text-teal-400 bg-teal-500/10">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                {data.nivelInfo.saldoAtual.toLocaleString("pt-BR")} PTS
              </Badge>
            </div>

            {/* Barra de Progresso do Nível */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">
                  {data.nivelInfo.saldoAtual.toLocaleString("pt-BR")} /{" "}
                  {data.nivelInfo.proximoNivel
                    ? data.nivelInfo.proximoNivel.pontosMinimos.toLocaleString("pt-BR")
                    : "MAX"}{" "}
                  pts
                </span>
                <span className="text-teal-400 font-bold">
                  {data.nivelInfo.proximoNivel
                    ? `Faltam ${data.nivelInfo.pontosParaProximo.toLocaleString("pt-BR")} pts`
                    : "Nível Máximo!"}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${data.nivelInfo.progressoPercentual}%` }}
                />
              </div>
              {data.nivelInfo.proximoNivel && (
                <p className="text-[11px] text-slate-400 text-right">
                  Próximo Nível: <strong className="text-white">{data.nivelInfo.proximoNivel.nome}</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards de Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1 transition-colors">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-500" /> Pontos Atuais
          </span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            {data.kpis.saldoPontos.toLocaleString("pt-BR")}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1 transition-colors">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-cyan-500" /> Indicações
          </span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            {data.kpis.totalIndicacoes}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1 transition-colors">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Convertidas
          </span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            {data.kpis.assinaturasConvertidas}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1 transition-colors">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Gift className="w-4 h-4 text-amber-500" /> Resgates
          </span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            {data.kpis.resgatesRealizados}
          </p>
        </div>
      </div>

      {/* Seção de Compartilhamento & QR Code */}
      <div className="bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-indigo-500/10 border border-teal-500/20 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-teal-500" /> Seu Link Único de Indicação
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Compartilhe seu link exclusivo. Cada nova empresa cadastrada gera pontos automáticos para você!
            </p>
          </div>

          <Badge variant="success" className="text-xs self-start sm:self-auto font-mono py-1 px-3">
            Código: {data.codigoIndicacao}
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full">
            <input
              type="text"
              readOnly
              value={linkRefCompleto}
              className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-mono focus:outline-none select-all pr-12 shadow-inner"
            />
            <button
              onClick={copyLinkToClipboard}
              className="absolute right-2 top-2 p-2 rounded-xl bg-teal-500 text-slate-950 font-bold hover:bg-teal-400 transition-all shadow-sm"
              title="Copiar Link"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Button
              variant="outline"
              onClick={shareWhatsapp}
              className="flex-1 sm:flex-none border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs"
            >
              <Send className="w-4 h-4 mr-1.5" /> WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={shareTelegram}
              className="flex-1 sm:flex-none border-sky-500/30 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 text-xs"
            >
              <Send className="w-4 h-4 mr-1.5" /> Telegram
            </Button>
            <Button
              variant="outline"
              onClick={shareEmail}
              className="flex-1 sm:flex-none border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 text-xs"
            >
              <Mail className="w-4 h-4 mr-1.5" /> E-mail
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowQrModal(!showQrModal)}
              className="px-3 text-xs"
              title="QR Code"
            >
              <QrCode className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Modal/Exibição de QR Code Simples */}
        {showQrModal && (
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-3 max-w-xs mx-auto animate-in zoom-in-95 duration-200 shadow-xl">
            <div className="p-3 bg-white rounded-xl shadow-md border border-slate-200">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(linkRefCompleto)}`}
                alt="QR Code de Indicação"
                className="w-40 h-40 object-contain"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center font-mono">
              Escaneie com a câmera do celular para abrir o formulário com seu convite.
            </p>
          </div>
        )}
      </div>

      {/* Gráfico de Evolução de Pontos (Recharts) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-500" /> Pontos Ganhos nos Últimos 6 Meses
          </h3>
          <span className="text-xs text-slate-500 font-semibold">Histórico Acumulado</span>
        </div>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.graficoPontos} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.2} />
              <XAxis dataKey="mes" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc", fontSize: "12px" }}
                formatter={(val: any) => [`${val || 0} pts`, "Pontos Ganhos"]}
              />
              <Bar dataKey="pontos" fill="#14b8a6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mensagens de Sucesso / Erro */}
      {mensagemSucesso && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setMensagemSucesso(null)}>OK</Button>
        </div>
      )}

      {mensagemErro && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{mensagemErro}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setMensagemErro(null)}>OK</Button>
        </div>
      )}

      {/* Navegação por Abas */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab("loja")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 flex items-center gap-2 ${
            activeTab === "loja"
              ? "bg-teal-500 text-slate-950 shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Loja de Recompensas
        </button>

        <button
          onClick={() => setActiveTab("resgates")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 flex items-center gap-2 ${
            activeTab === "resgates"
              ? "bg-teal-500 text-slate-950 shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <History className="w-4 h-4" /> Meus Resgates ({data.resgates.length})
        </button>

        <button
          onClick={() => setActiveTab("conquistas")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 flex items-center gap-2 ${
            activeTab === "conquistas"
              ? "bg-teal-500 text-slate-950 shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Trophy className="w-4 h-4" /> Conquistas ({data.conquistas.filter((c) => c.desbloqueado).length}/{data.conquistas.length})
        </button>

        <button
          onClick={() => setActiveTab("missoes")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 flex items-center gap-2 ${
            activeTab === "missoes"
              ? "bg-teal-500 text-slate-950 shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Target className="w-4 h-4" /> Missões Ativas
        </button>

        <button
          onClick={() => setActiveTab("extrato")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 flex items-center gap-2 ${
            activeTab === "extrato"
              ? "bg-teal-500 text-slate-950 shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Sparkles className="w-4 h-4" /> Extrato de Pontos
        </button>
      </div>

      {/* ABA 1: LOJA DE RECOMPENSAS */}
      {activeTab === "loja" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Filtros e Busca */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar recompensa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
              {["todos", "filamentos", "resinas", "acessorios", "cupons", "brindes"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoriaFiltro(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    categoriaFiltro === cat
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Recompensas */}
          {catalogoFiltrado.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-500 dark:text-slate-400 space-y-2">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-400 opacity-50" />
              <p className="text-sm font-semibold">Nenhuma recompensa encontrada nesta categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {catalogoFiltrado.map((item) => {
                const podeResgatar = data.nivelInfo.saldoAtual >= item.pontosNecessarios && (item.estoque === null || item.estoque > 0);
                const isResgatando = resgatandoId === item.id;

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-4 group relative overflow-hidden"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="secondary" className="capitalize text-[10px] font-bold">
                          {item.categoria}
                        </Badge>

                        {item.estoque !== null && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              item.estoque > 0
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-rose-500/10 text-rose-500"
                            }`}
                          >
                            {item.estoque > 0 ? `${item.estoque} em estoque` : "Esgotado"}
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-400 transition-colors">
                        {item.nome}
                      </h4>

                      {item.descricao && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                          {item.descricao}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Preço em Pontos</span>
                        <p className="text-lg font-black text-teal-500 dark:text-teal-400 flex items-center gap-1">
                          <Sparkles className="w-4 h-4" /> {item.pontosNecessarios.toLocaleString("pt-BR")}
                        </p>
                      </div>

                      <Button
                        variant={podeResgatar ? "primary" : "secondary"}
                        disabled={!podeResgatar || isResgatando}
                        onClick={() => handleResgateSubmit(item.id)}
                        className="text-xs font-extrabold px-4 py-2 shadow-sm"
                      >
                        {isResgatando ? (
                          "Resgatando..."
                        ) : data.nivelInfo.saldoAtual < item.pontosNecessarios ? (
                          "Pontos Insuficientes"
                        ) : item.estoque === 0 ? (
                          "Esgotado"
                        ) : (
                          "Resgatar Agora"
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: MEUS RESGATES */}
      {activeTab === "resgates" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-teal-500" /> Histórico de Resgates Solicitados
          </h3>

          {data.resgates.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">Você ainda não realizou nenhum resgate de recompensa.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.resgates.map((r) => (
                <div key={r.id} className="py-3.5 flex items-center justify-between gap-4 text-xs sm:text-sm">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900 dark:text-slate-200">{r.itemNome}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {new Date(r.data).toLocaleDateString("pt-BR")} às {new Date(r.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-teal-500 dark:text-teal-400 font-mono">
                      -{r.pontosGastos} pts
                    </span>

                    <Badge
                      variant={
                        r.status === "entregue"
                          ? "success"
                          : r.status === "cancelado"
                          ? "danger"
                          : "warning"
                      }
                      className="capitalize text-[10px]"
                    >
                      {r.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 3: CONQUISTAS */}
      {activeTab === "conquistas" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-200">
          {data.conquistas.map((ach) => (
            <div
              key={ach.id}
              className={`p-5 rounded-3xl border transition-all flex items-start gap-4 ${
                ach.desbloqueado
                  ? "bg-gradient-to-br from-amber-500/10 to-teal-500/10 border-amber-500/30 shadow-md"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 grayscale"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  ach.desbloqueado ? "bg-amber-500 text-slate-950 shadow-md" : "bg-slate-800 text-slate-400"
                }`}
              >
                <Trophy className="w-6 h-6" />
              </div>

              <div className="space-y-1 w-full">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{ach.nome}</h4>
                  <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                    {ach.raridade}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{ach.descricao}</p>

                <div className="pt-2 flex items-center justify-between text-[11px] font-bold">
                  <span className={ach.desbloqueado ? "text-amber-500" : "text-slate-500"}>
                    {ach.desbloqueado ? "Desbloqueado! 🎉" : `${ach.progressoAtual} / ${ach.criterioValor}`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ABA 4: MISSÕES */}
      {activeTab === "missoes" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {data.missoes.map((m) => {
            const pct = Math.min(100, Math.round((m.progressoAtual / m.criterioValor) * 100));

            return (
              <div
                key={m.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{m.nome}</h4>
                      <Badge variant="secondary" className="capitalize text-[10px]">
                        {m.tipo}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{m.descricao}</p>
                  </div>

                  <Badge variant="success" className="self-start sm:self-auto font-mono text-xs">
                    +{m.recompensaPontos} PTS
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>Progresso</span>
                    <span>
                      {m.progressoAtual} / {m.criterioValor} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ABA 5: EXTRATO COMPLETO */}
      {activeTab === "extrato" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-500" /> Extrato Detalhado de Transações
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.timeline.map((t) => {
              const isCredito = t.tipo === "credito";

              return (
                <div key={t.id} className="py-3 flex items-center justify-between gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredito ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      }`}
                    >
                      {isCredito ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-200">{t.descricao || t.evento}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {new Date(t.data).toLocaleDateString("pt-BR")} às {new Date(t.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>

                  <span className={`font-black font-mono text-sm ${isCredito ? "text-emerald-500" : "text-rose-500"}`}>
                    {isCredito ? `+${t.pontos}` : `-${t.pontos}`} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
