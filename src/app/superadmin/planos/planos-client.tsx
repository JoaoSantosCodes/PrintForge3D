"use client";

import { useState } from "react";
import { savePlanoAction, deletePlanoAction } from "@/app/actions/superadmin";
import { Layers, Plus, Edit2, Trash2, Check, X, Loader2, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface PlanoItem {
  id: string;
  nome: string;
  slug: string;
  precoMensal: number;
  limiteImpressoras: number;
  limitePecas: number;
  limitePedidosMes: number;
  limiteUsuarios: number;
  ativo: boolean;
  _count: { empresas: number };
}

export default function PlanosSuperAdminClient({ planos }: { planos: PlanoItem[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlano, setEditingPlano] = useState<PlanoItem | null>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [precoMensal, setPrecoMensal] = useState<number | "">(0);
  const [limiteImpressoras, setLimiteImpressoras] = useState<number | "">(5);
  const [limitePecas, setLimitePecas] = useState<number | "">(20);
  const [limitePedidosMes, setLimitePedidosMes] = useState<number | "">(50);
  const [limiteUsuarios, setLimiteUsuarios] = useState<number | "">(5);
  const [ativo, setAtivo] = useState(true);

  const openCreateModal = () => {
    setEditingPlano(null);
    setNome("");
    setSlug("");
    setPrecoMensal(49.9);
    setLimiteImpressoras(5);
    setLimitePecas(20);
    setLimitePedidosMes(50);
    setLimiteUsuarios(5);
    setAtivo(true);
    setModalOpen(true);
  };

  const openEditModal = (plano: PlanoItem) => {
    setEditingPlano(plano);
    setNome(plano.nome);
    setSlug(plano.slug);
    setPrecoMensal(plano.precoMensal);
    setLimiteImpressoras(plano.limiteImpressoras);
    setLimitePecas(plano.limitePecas);
    setLimitePedidosMes(plano.limitePedidosMes);
    setLimiteUsuarios(plano.limiteUsuarios);
    setAtivo(plano.ativo);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    if (editingPlano) formData.append("id", editingPlano.id);
    formData.append("nome", nome);
    formData.append("slug", slug);
    formData.append("precoMensal", String(precoMensal || 0));
    formData.append("limiteImpressoras", String(limiteImpressoras || 1));
    formData.append("limitePecas", String(limitePecas || 1));
    formData.append("limitePedidosMes", String(limitePedidosMes || 1));
    formData.append("limiteUsuarios", String(limiteUsuarios || 1));
    formData.append("ativo", String(ativo));

    const res = await savePlanoAction(formData);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message);
      setModalOpen(false);
    }
  };

  const handleDelete = async (id: string, nomePlano: string) => {
    if (!confirm(`Tem certeza que deseja excluir o plano "${nomePlano}"?`)) return;

    setLoading(true);
    const res = await deletePlanoAction(id);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Plano excluído com sucesso.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Layers className="w-7 h-7 text-indigo-400" /> Gestão de Planos & Limites
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Configure os planos de assinatura disponíveis para os vendedores da sua plataforma.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Criar Novo Plano
        </button>
      </div>

      {/* Grid of Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planos.map((p) => (
          <div
            key={p.id}
            className={`bg-slate-900/80 border rounded-2xl p-6 flex flex-col justify-between relative shadow-xl transition-all ${
              p.ativo ? "border-slate-800" : "border-slate-800/50 opacity-60"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-black text-white">{p.nome}</h2>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    p.ativo
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-slate-800 text-slate-500 border-slate-700"
                  }`}
                >
                  {p.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>

              <div className="text-xs text-indigo-400 font-mono mb-4">slug: {p.slug}</div>

              <div className="text-3xl font-black text-white mb-4">
                R$ {p.precoMensal.toFixed(2)}
                <span className="text-xs text-slate-400 font-normal"> /mês</span>
              </div>

              {/* Limits */}
              <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800/80 pt-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Impressoras:</span>
                  <span className="font-bold text-white">
                    {p.limiteImpressoras >= 999 ? "Ilimitadas" : p.limiteImpressoras}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Peças no Catálogo:</span>
                  <span className="font-bold text-white">
                    {p.limitePecas >= 999 ? "Ilimitadas" : p.limitePecas}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Pedidos / Mês:</span>
                  <span className="font-bold text-white">
                    {p.limitePedidosMes >= 999 ? "Ilimitados" : p.limitePedidosMes}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800/40 pt-2">
                  <span className="text-slate-400">Empresas Usando:</span>
                  <span className="font-bold text-purple-400">{p._count.empresas} loja(s)</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-slate-800">
              <button
                onClick={() => openEditModal(p)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" /> Editar
              </button>
              <button
                onClick={() => handleDelete(p.id, p.nome)}
                disabled={p._count.empresas > 0}
                className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-center gap-1.5 border border-rose-500/20 disabled:opacity-30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingPlano ? "Editar Plano" : "Criar Novo Plano"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nome do Plano *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pro"
                    value={nome}
                    onChange={(e) => {
                      setNome(e.target.value);
                      if (!editingPlano) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""));
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    placeholder="pro"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Preço Mensal (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={precoMensal}
                  onChange={(e) => setPrecoMensal(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Limite Impressoras *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={limiteImpressoras}
                    onChange={(e) => setLimiteImpressoras(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Limite Peças *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={limitePecas}
                    onChange={(e) => setLimitePecas(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pedidos / Mês *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={limitePedidosMes}
                    onChange={(e) => setLimitePedidosMes(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={ativo}
                  onChange={(e) => setAtivo(e.target.checked)}
                  className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="ativo" className="text-slate-300 font-semibold cursor-pointer">
                  Plano Ativo para novos cadastros
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Salvar Plano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
