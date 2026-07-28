"use client";

import { useState } from "react";
import { resgatarRecompensaAction } from "@/app/actions/rewards";
import {
  Gift,
  Zap,
  Award,
  Sparkles,
  Flame,
  CheckCircle2,
  Lock,
  Box,
  Layers,
  ShoppingBag,
  History,
  TrendingUp,
  Tag,
  Loader2,
  Check,
  Star,
  Trophy,
  ShieldCheck,
  ChevronRight,
  Package,
} from "lucide-react";
import { toast } from "sonner";

interface RewardsData {
  saldoPontos: number;
  nivelAtual: {
    nome: string;
    slug: string;
    pontosMinimos: number;
    icone: string;
    cor: string;
    beneficio: string;
    badge: string;
  };
  proximoNivel: {
    nome: string;
    slug: string;
    pontosMinimos: number;
    icone: string;
    cor: string;
    beneficio: string;
    badge: string;
  };
  pontosFaltantes: number;
  progressoPercentual: number;
  catalogo: {
    id: string;
    nome: string;
    descricao: string;
    imagemUrl?: string | null;
    categoria: string;
    tipo: string;
    pontosNecessarios: number;
    estoque: number;
    ativo: boolean;
  }[];
  transacoes: {
    id: string;
    pontos: number;
    tipo: string;
    evento: string;
    descricao: string;
    createdAt: Date | string;
  }[];
  resgates: {
    id: string;
    reward: {
      nome: string;
      categoria: string;
    };
    pontosGastos: number;
    status: string;
    codigoCupom?: string | null;
    createdAt: Date | string;
  }[];
  missoes: {
    id: string;
    titulo: string;
    descricao: string;
    pontosRecompensa: number;
    categoria: string;
    progressoAtual: number;
    meta: number;
    concluida: boolean;
  }[];
  conquistas: {
    id: string;
    nome: string;
    descricao: string;
    icone: string;
    raridade: string;
    conquistada: boolean;
  }[];
  niveis: {
    nome: string;
    slug: string;
    pontosMinimos: number;
    icone: string;
    cor: string;
    beneficio: string;
    badge: string;
  }[];
}

export default function RewardsClientPage({ data }: { data: RewardsData }) {
  const [activeTab, setActiveTab] = useState<"marketplace" | "conquistas" | "missoes" | "historico">("marketplace");
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [resgatandoId, setResgatandoId] = useState<string | null>(null);

  const categorias = [
    { id: "todas", label: "Todas as Recompensas" },
    { id: "filamentos", label: "🧵 Filamentos & Resinas" },
    { id: "pecas", label: "🔩 Peças & Bicos" },
    { id: "acessorios", label: "🧲 Placas & Acessórios" },
    { id: "brindes", label: "👕 Camisetas & Brindes" },
    { id: "creditos", label: "🚀 Planos & Créditos" },
    { id: "premium", label: "🤖 Inteligência Artificial" },
    { id: "cupons", label: "🎟️ Cupons & Frete" },
  ];

  const filteredItems = selectedCategory === "todas"
    ? data.catalogo
    : data.catalogo.filter((i) => i.categoria === selectedCategory);

  const handleResgatar = async (rewardId: string) => {
    setResgatandoId(rewardId);
    const res = await resgatarRecompensaAction(rewardId);
    setResgatandoId(null);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message || "Recompensa resgatada com sucesso!");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Duolingo / Xbox Rewards Header */}
      <div className="bg-gradient-to-r from-purple-900/40 via-slate-900 to-cyan-950/40 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Gift className="w-3.5 h-3.5" /> PrintForge Rewards • Programa de Fidelidade Maker
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              Seu Saldo: <span className="text-purple-400 font-mono">{data.saldoPontos}</span> <span className="text-sm font-semibold text-slate-400">pts</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Acumule pontos em suas vendas e indicações e resgate filamentos, peças, camisetas e benefícios exclusivos.
            </p>
          </div>

          {/* Level Badge Card */}
          <div className="bg-slate-950/80 border border-purple-500/30 rounded-2xl p-5 shrink-0 flex items-center gap-4 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-3xl flex items-center justify-center border border-purple-500/40 shadow-inner">
              {data.nivelAtual.icone}
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-purple-400 tracking-widest block">
                Nível Atual
              </span>
              <h2 className="text-xl font-black text-white">{data.nivelAtual.nome}</h2>
              <p className="text-[11px] text-slate-400">{data.nivelAtual.badge}</p>
            </div>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" /> Progresso para Nível {data.proximoNivel.nome}
            </span>
            <span className="text-purple-400 font-mono">
              {data.saldoPontos} / {data.proximoNivel.pontosMinimos} pts {data.pontosFaltantes > 0 && `(Faltam ${data.pontosFaltantes} pts)`}
            </span>
          </div>

          <div className="w-full bg-slate-950 h-4 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${data.progressoPercentual}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("marketplace")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "marketplace"
              ? "bg-purple-600 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Marketplace de Recompensas
        </button>

        <button
          onClick={() => setActiveTab("conquistas")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "conquistas"
              ? "bg-purple-600 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
        >
          <Trophy className="w-4 h-4" /> Conquistas (Achievements)
        </button>

        <button
          onClick={() => setActiveTab("missoes")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "missoes"
              ? "bg-purple-600 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
        >
          <Zap className="w-4 h-4" /> Missões & Quests
        </button>

        <button
          onClick={() => setActiveTab("historico")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "historico"
              ? "bg-purple-600 text-white shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
        >
          <History className="w-4 h-4" /> Ledger & Histórico ({data.resgates.length})
        </button>
      </div>

      {/* TAB 1: MARKETPLACE DE RECOMPENSAS */}
      {activeTab === "marketplace" && (
        <div className="space-y-6">
          {/* Categories Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  selectedCategory === cat.id
                    ? "bg-purple-500/20 border border-purple-500/40 text-purple-300"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const temPontos = data.saldoPontos >= item.pontosNecessarios;
              const emEstoque = item.estoque > 0;
              const isResgatando = resgatandoId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-purple-500/50 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {item.categoria}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Estoque: {item.estoque} un</span>
                    </div>

                    <div className="font-extrabold text-lg text-slate-900 dark:text-slate-100 group-hover:text-purple-400 transition-colors">
                      {item.nome}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {item.descricao}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Preço de Resgate:</span>
                      <span className="font-mono font-black text-xl text-purple-600 dark:text-purple-400">
                        {item.pontosNecessarios} pts
                      </span>
                    </div>

                    <button
                      onClick={() => handleResgatar(item.id)}
                      disabled={!temPontos || !emEstoque || isResgatando}
                      className={`w-full py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                        temPontos && emEstoque
                          ? "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20"
                          : "bg-slate-100 dark:bg-slate-950 text-slate-400 border border-slate-200 dark:border-slate-800 cursor-not-allowed"
                      }`}
                    >
                      {isResgatando ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Efetuando Resgate...
                        </>
                      ) : !temPontos ? (
                        <>
                          <Lock className="w-4 h-4 text-slate-500" /> Pontos Insuficientes
                        </>
                      ) : !emEstoque ? (
                        "Estoque Esgotado"
                      ) : (
                        <>
                          <Gift className="w-4 h-4" /> Resgatar Recompensa
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CONQUISTAS (ACHIEVEMENTS) */}
      {activeTab === "conquistas" && (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" /> Galeria de Conquistas Maker (Steam/GitHub Badges)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Desbloqueie conquistas exclusivas ao utilizar a plataforma e convidar novos vendedores.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.conquistas.map((ach) => (
              <div
                key={ach.id}
                className={`p-6 rounded-3xl border transition-all flex items-center gap-4 ${
                  ach.conquistada
                    ? "bg-purple-500/10 border-purple-500/40 text-slate-100 shadow-lg shadow-purple-500/10"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 grayscale"
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 text-3xl flex items-center justify-center shrink-0 shadow-inner">
                  {ach.icone}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{ach.nome}</h3>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">
                      {ach.raridade}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{ach.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MISSÕES & QUESTS */}
      {activeTab === "missoes" && (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
              <Zap className="w-6 h-6 text-purple-400" /> Missões Diárias & Semanais
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete missões para acumular pontos extras no seu Ledger de Recompensas.
            </p>
          </div>

          <div className="space-y-4">
            {data.missoes.map((m) => (
              <div
                key={m.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {m.categoria}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{m.titulo}</h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{m.descricao}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-slate-400 font-mono">Progresso: {m.progressoAtual}/{m.meta}</div>
                    <div className="text-sm font-black text-purple-400 font-mono">+{m.pontosRecompensa} pts</div>
                  </div>

                  <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${m.concluida ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-slate-100 dark:bg-slate-950 text-slate-400 border-slate-800"}`}>
                    {m.concluida ? "Concluída" : "Em Andamento"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: HISTÓRICO & LEDGER */}
      {activeTab === "historico" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <History className="w-5 h-5 text-purple-400" /> Meus Resgates de Recompensas
            </h2>

            {data.resgates.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs italic">Nenhum resgate efetuado ainda.</div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {data.resgates.map((r) => (
                  <div key={r.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{r.reward.nome}</div>
                      <div className="text-xs text-slate-400 font-mono">Cupom: {r.codigoCupom || "N/A"}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-purple-400 font-bold">-{r.pontosGastos} pts</div>
                      <span className="text-[10px] uppercase font-bold text-emerald-400">{r.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
