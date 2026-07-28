"use client";

import { useState } from "react";
import {
  Gift,
  Settings,
  Package,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  Filter,
  Sparkles,
  Save,
  AlertTriangle,
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
  Cell,
} from "recharts";
import {
  salvarItemCatalogoSuperAdminAction,
  deletarItemCatalogoSuperAdminAction,
  salvarPontosConfigSuperAdminAction,
  alterarStatusResgateSuperAdminAction,
} from "@/app/actions/rewards";

interface SuperAdminRewardsUIProps {
  data: {
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
    configs: Array<{
      id: string;
      evento: string;
      pontos: number;
      ativo: boolean;
      descricao: string | null;
    }>;
    resgates: Array<{
      id: string;
      empresaNome: string;
      empresaSlug: string;
      itemNome: string;
      categoria: string;
      pontosGastos: number;
      status: string;
      data: string;
    }>;
    funil: Array<{
      etapa: string;
      count: number;
      cor: string;
    }>;
    totalReferrals: number;
  };
}

export default function SuperAdminRewardsClient({ data }: SuperAdminRewardsUIProps) {
  const [activeTab, setActiveTab] = useState<"catalogo" | "configs" | "resgates" | "funil">("catalogo");
  const [modalItemOpen, setModalItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State para catálogo
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [categoria, setCategoria] = useState("filamentos");
  const [pontosNecessarios, setPontosNecessarios] = useState("1000");
  const [estoque, setEstoque] = useState("");
  const [ativo, setAtivo] = useState(true);

  // Status filtro de resgates
  const [statusResgateFiltro, setStatusResgateFiltro] = useState("todos");

  const openNewItemModal = () => {
    setEditingItem(null);
    setNome("");
    setDescricao("");
    setImagemUrl("");
    setCategoria("filamentos");
    setPontosNecessarios("1000");
    setEstoque("");
    setAtivo(true);
    setModalItemOpen(true);
  };

  const openEditItemModal = (item: any) => {
    setEditingItem(item);
    setNome(item.nome);
    setDescricao(item.descricao || "");
    setImagemUrl(item.imagemUrl || "");
    setCategoria(item.categoria);
    setPontosNecessarios(String(item.pontosNecessarios));
    setEstoque(item.estoque !== null ? String(item.estoque) : "");
    setAtivo(item.ativo);
    setModalItemOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    setFeedbackMsg(null);

    const formData = new FormData();
    if (editingItem?.id) formData.append("id", editingItem.id);
    formData.append("nome", nome);
    formData.append("descricao", descricao);
    formData.append("imagemUrl", imagemUrl);
    formData.append("categoria", categoria);
    formData.append("pontosNecessarios", pontosNecessarios);
    formData.append("estoque", estoque);
    formData.append("ativo", String(ativo));

    const res = await salvarItemCatalogoSuperAdminAction(formData);
    setLoadingAction(false);

    if (res?.error) {
      setFeedbackMsg({ type: "error", text: res.error });
    } else {
      setFeedbackMsg({ type: "success", text: res.message || "Item salvo com sucesso!" });
      setModalItemOpen(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta recompensa?")) return;
    setLoadingAction(true);
    const res = await deletarItemCatalogoSuperAdminAction(id);
    setLoadingAction(false);
    if (res?.error) {
      setFeedbackMsg({ type: "error", text: res.error });
    } else {
      setFeedbackMsg({ type: "success", text: "Item excluído com sucesso!" });
    }
  };

  const handleSaveConfig = async (evento: string, pontosStr: string, ativoState: boolean, desc?: string) => {
    const pts = parseInt(pontosStr, 10);
    if (isNaN(pts)) return;
    setLoadingAction(true);
    const res = await salvarPontosConfigSuperAdminAction(evento, pts, ativoState, desc);
    setLoadingAction(false);
    if (res?.error) {
      setFeedbackMsg({ type: "error", text: res.error });
    } else {
      setFeedbackMsg({ type: "success", text: `Regra '${evento}' salva com sucesso!` });
    }
  };

  const handleStatusResgate = async (resgateId: string, novoStatus: string) => {
    setLoadingAction(true);
    const res = await alterarStatusResgateSuperAdminAction(resgateId, novoStatus);
    setLoadingAction(false);
    if (res?.error) {
      setFeedbackMsg({ type: "error", text: res.error });
    } else {
      setFeedbackMsg({ type: "success", text: `Status alterado para '${novoStatus}'!` });
    }
  };

  const resgatesFiltrados = data.resgates.filter(
    (r) => statusResgateFiltro === "todos" || r.status === statusResgateFiltro
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header Banner SuperAdmin */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-teal-400">
            Painel Super-Admin
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3 mt-1">
            <Gift className="w-8 h-8 text-teal-400" /> Gestão do PrintForge Rewards
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Gerencie o catálogo de recompensas, regras dinâmicas de pontuação, entregas e funil de indicações.
          </p>
        </div>

        <Button variant="primary" onClick={openNewItemModal} className="font-extrabold text-xs shrink-0">
          <Plus className="w-4 h-4 mr-1.5" /> Nova Recompensa
        </Button>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 ${
            feedbackMsg.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
              : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setFeedbackMsg(null)}>
            OK
          </Button>
        </div>
      )}

      {/* Abas */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab("catalogo")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 flex items-center gap-2 ${
            activeTab === "catalogo"
              ? "bg-teal-500 text-slate-950 shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Package className="w-4 h-4" /> Catálogo de Recompensas ({data.catalogo.length})
        </button>

        <button
          onClick={() => setActiveTab("configs")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 flex items-center gap-2 ${
            activeTab === "configs"
              ? "bg-teal-500 text-slate-950 shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Settings className="w-4 h-4" /> Regras de Pontuação ({data.configs.length})
        </button>

        <button
          onClick={() => setActiveTab("resgates")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 flex items-center gap-2 ${
            activeTab === "resgates"
              ? "bg-teal-500 text-slate-950 shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Truck className="w-4 h-4" /> Gestão de Resgates ({data.resgates.length})
        </button>

        <button
          onClick={() => setActiveTab("funil")}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shrink-0 flex items-center gap-2 ${
            activeTab === "funil"
              ? "bg-teal-500 text-slate-950 shadow-md"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Funil de Conversão ({data.totalReferrals})
        </button>
      </div>

      {/* ABA 1: CATÁLOGO DE RECOMPENSAS */}
      {activeTab === "catalogo" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {data.catalogo.map((item) => (
            <div
              key={item.id}
              className={`p-6 rounded-3xl border transition-all space-y-4 flex flex-col justify-between ${
                item.ativo
                  ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-md"
                  : "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-60"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="capitalize text-[10px]">
                    {item.categoria}
                  </Badge>
                  <Badge variant={item.ativo ? "success" : "secondary"} className="text-[10px]">
                    {item.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{item.nome}</h4>
                {item.descricao && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {item.descricao}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Pontos</span>
                  <p className="text-lg font-black text-teal-400">{item.pontosNecessarios} pts</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => openEditItemModal(item)}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-rose-500 hover:bg-rose-500/10 border-rose-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ABA 2: REGRAS DE PONTUAÇÃO (RewardPointsConfig) */}
      {activeTab === "configs" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-500" /> Tabela de Pontos por Evento do Sistema
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.configs.map((c) => (
              <ConfigRow key={c.id} config={c} onSave={handleSaveConfig} disabled={loadingAction} />
            ))}
          </div>
        </div>
      )}

      {/* ABA 3: GESTÃO DE RESGATES (RewardRedemption) */}
      {activeTab === "resgates" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Truck className="w-5 h-5 text-teal-500" /> Solicitações de Resgate
            </h3>

            <div className="flex items-center gap-1.5">
              {["todos", "solicitado", "em_processamento", "enviado", "entregue", "cancelado"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusResgateFiltro(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-all ${
                    statusResgateFiltro === st
                      ? "bg-teal-500 text-slate-950"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {resgatesFiltrados.map((r) => (
              <div key={r.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">{r.empresaNome}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {r.itemNome}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Solicitado em: {new Date(r.data).toLocaleDateString("pt-BR")} às {new Date(r.data).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="font-black text-teal-400 font-mono">
                    -{r.pontosGastos} pts
                  </span>

                  <select
                    value={r.status}
                    onChange={(e) => handleStatusResgate(r.id, e.target.value)}
                    disabled={loadingAction}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none"
                  >
                    <option value="solicitado">Solicitado 🟡</option>
                    <option value="em_processamento">Em Processamento ⚙️</option>
                    <option value="enviado">Enviado 📦</option>
                    <option value="entregue">Entregue ✅</option>
                    <option value="cancelado">Cancelado / Estornado ❌</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 4: FUNIL DE CONVERSÃO */}
      {activeTab === "funil" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-500" /> Funil de Conversão de Indicações
            </h3>
            <span className="text-xs text-slate-500 font-semibold">Total de Eventos: {data.totalReferrals}</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.funil} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.2} />
                <XAxis dataKey="etapa" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc", fontSize: "12px" }}
                  formatter={(val: any) => [`${val || 0} cadastros`, "Quantidade"]}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {data.funil.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* MODAL NOVO / EDITAR ITEM DO CATÁLOGO */}
      {modalItemOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {editingItem ? "Editar Recompensa" : "Nova Recompensa"}
              </h3>
              <button
                onClick={() => setModalItemOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Nome da Recompensa</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={2}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Categoria</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
                  >
                    <option value="filamentos">Filamentos</option>
                    <option value="resinas">Resinas</option>
                    <option value="pecas">Peças</option>
                    <option value="acessorios">Acessórios</option>
                    <option value="cupons">Cupons</option>
                    <option value="creditos">Créditos</option>
                    <option value="brindes">Brindes</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Pontos Necessários</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={pontosNecessarios}
                    onChange={(e) => setPontosNecessarios(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Estoque (Vazio = Ilimitado)</label>
                  <input
                    type="number"
                    placeholder="Ilimitado"
                    value={estoque}
                    onChange={(e) => setEstoque(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                  <select
                    value={String(ativo)}
                    onChange={(e) => setAtivo(e.target.value === "true")}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
                  >
                    <option value="true">Ativo ✅</option>
                    <option value="false">Inativo ❌</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="secondary" onClick={() => setModalItemOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={loadingAction}>
                  {loadingAction ? "Salvando..." : "Salvar Recompensa"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfigRow({ config, onSave, disabled }: { config: any; onSave: Function; disabled: boolean }) {
  const [pontos, setPontos] = useState(String(config.pontos));
  const [ativo, setAtivo] = useState(config.ativo);
  const [descricao, setDescricao] = useState(config.descricao || "");

  return (
    <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="space-y-0.5 max-w-md">
        <span className="font-bold text-slate-900 dark:text-slate-100 font-mono uppercase text-[11px] text-teal-400">
          {config.evento}
        </span>
        <p className="text-slate-500 dark:text-slate-400">{config.descricao || "Sem descrição"}</p>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto">
        <input
          type="number"
          value={pontos}
          onChange={(e) => setPontos(e.target.value)}
          className="w-24 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold font-mono text-center"
        />

        <button
          onClick={() => setAtivo(!ativo)}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all text-[11px] ${
            ativo ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
          }`}
        >
          {ativo ? "Ativo" : "Inativo"}
        </button>

        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => onSave(config.evento, pontos, ativo, descricao)}
          className="text-xs"
        >
          <Save className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
