"use client";

import { useState } from "react";
import {
  createTintaAction,
  updateTintaAction,
  deleteTintaAction,
} from "@/app/actions/tintas";
import { formatarMoeda } from "@/lib/custos";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";
import {
  Palette,
  Plus,
  Trash2,
  Edit2,
  Search,
  X,
  Droplet,
  PackageCheck,
  AlertCircle,
  Tag,
} from "lucide-react";

interface Tinta {
  id: string;
  nome: string;
  marca: string | null;
  tipo: string;
  cor: string | null;
  volumeMl: number;
  preco: number;
  createdAt: string | Date;
}

const TIPOS_PADRAO = [
  "Acrílica",
  "Spray",
  "Primer",
  "Verniz",
  "Esmalte",
  "Tinta Óleo",
  "Pincel / Insumo",
  "Outro",
];

export default function TintasClientPage({
  initialTintas,
}: {
  initialTintas: Tinta[];
}) {
  const [tintas, setTintas] = useState<Tinta[]>(initialTintas);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipo, setSelectedTipo] = useState<string>("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTinta, setEditingTinta] = useState<Tinta | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter tintas
  const filteredTintas = tintas.filter((tinta) => {
    const matchesSearch =
      tinta.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tinta.marca && tinta.marca.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tinta.cor && tinta.cor.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTipo = selectedTipo === "todos" || tinta.tipo === selectedTipo;
    return matchesSearch && matchesTipo;
  });

  const totalTintas = tintas.length;
  const precoMedioMl =
    tintas.length > 0
      ? tintas.reduce(
          (acc, t) => acc + (t.volumeMl > 0 ? t.preco / t.volumeMl : 0),
          0
        ) / tintas.length
      : 0;

  function handleOpenModal(tinta?: Tinta) {
    if (tinta) {
      setEditingTinta(tinta);
    } else {
      setEditingTinta(null);
    }
    setErrorMsg("");
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingTinta(null);
    setErrorMsg("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);

    let res;
    if (editingTinta) {
      res = await updateTintaAction(editingTinta.id, formData);
    } else {
      res = await createTintaAction(formData);
    }

    if (res?.error) {
      setErrorMsg(res.error);
      setLoading(false);
    } else {
      setLoading(false);
      handleCloseModal();
      window.location.reload();
    }
  }

  async function handleDelete(id: string) {
    const res = await deleteTintaAction(id);
    if (!res.error) {
      setTintas(tintas.filter((t) => t.id !== id));
      setDeleteConfirmId(null);
    } else {
      alert(res.error);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
            <Palette className="w-8 h-8 text-pink-400" />
            Tintas & Insumos de Pintura
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Cadastre primers, tintas acrílicas, sprays, vernizes e insumos de acabamento.
          </p>
        </div>

        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4" /> Nova Tinta / Insumo
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 text-pink-500/10">
            <Palette className="w-16 h-16" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Total Cadastrado
          </p>
          <div className="text-3xl font-extrabold text-slate-100">{totalTintas}</div>
          <p className="text-xs text-slate-500 mt-2">Tintas, primers e acabamentos</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 text-cyan-500/10">
            <Droplet className="w-16 h-16" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Custo Médio por ml
          </p>
          <div className="text-3xl font-extrabold text-pink-400">
            {formatarMoeda(precoMedioMl)} <span className="text-xs text-slate-400 font-normal">/ ml</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Média de custo dos materiais</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 text-teal-500/10">
            <PackageCheck className="w-16 h-16" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Tipos de Material
          </p>
          <div className="text-3xl font-extrabold text-teal-400">
            {new Set(tintas.map((t) => t.tipo)).size}
          </div>
          <p className="text-xs text-slate-500 mt-2">Variedade no seu estoque</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, marca ou cor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedTipo("todos")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedTipo === "todos"
                ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            Todos ({tintas.length})
          </button>
          {TIPOS_PADRAO.map((tipo) => {
            const count = tintas.filter((t) => t.tipo === tipo).length;
            if (count === 0) return null;
            return (
              <button
                key={tipo}
                onClick={() => setSelectedTipo(tipo)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedTipo === tipo
                    ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                    : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {tipo} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">Nome / Material</th>
                <th className="py-4 px-6">Marca</th>
                <th className="py-4 px-6">Tipo</th>
                <th className="py-4 px-6">Cor</th>
                <th className="py-4 px-6">Embalagem (ml)</th>
                <th className="py-4 px-6">Preço (R$)</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTintas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-sm">
                    Nenhuma tinta ou insumo encontrado.
                  </td>
                </tr>
              ) : (
                filteredTintas.map((tinta) => {
                  const custoPorMl = tinta.volumeMl > 0 ? tinta.preco / tinta.volumeMl : 0;
                  return (
                    <tr key={tinta.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="py-4 px-6 font-semibold text-slate-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
                          <Droplet className="w-4 h-4" />
                        </div>
                        {tinta.nome}
                      </td>
                      <td className="py-4 px-6 text-slate-400">{tinta.marca || "—"}</td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300">
                          {tinta.tipo}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-300 font-medium">
                        {tinta.cor ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-pink-400 inline-block" />
                            {tinta.cor}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-300 font-mono">
                        {tinta.volumeMl} ml
                        <span className="text-[11px] text-slate-500 block">
                          ({formatarMoeda(custoPorMl)} / ml)
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-pink-400">
                        {formatarMoeda(tinta.preco)}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        {deleteConfirmId === tinta.id ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleDelete(tinta.id)}
                              className="px-2.5 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold hover:bg-rose-500/30"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleOpenModal(tinta)}
                              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(tinta.id)}
                              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={handleCloseModal}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-100 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-pink-500/10 text-pink-400 rounded-2xl">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">
                  {editingTinta ? "Editar Tinta / Insumo" : "Nova Tinta / Insumo"}
                </h2>
                <p className="text-xs text-slate-400">
                  Informe o tipo, volume da embalagem e preço pago.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome do Material *
                </label>
                <input
                  type="text"
                  name="nome"
                  required
                  defaultValue={editingTinta?.nome || ""}
                  placeholder="Ex: Primer Spray Cinza Tekbond, Tinta Acrilex Vermelha"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Marca
                  </label>
                  <input
                    type="text"
                    name="marca"
                    defaultValue={editingTinta?.marca || ""}
                    placeholder="Ex: Vallejo, Acrilex, Tekbond"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tipo *
                  </label>
                  <select
                    name="tipo"
                    required
                    defaultValue={editingTinta?.tipo || "Acrílica"}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-pink-500"
                  >
                    {TIPOS_PADRAO.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cor
                  </label>
                  <input
                    type="text"
                    name="cor"
                    defaultValue={editingTinta?.cor || ""}
                    placeholder="Ex: Preto, Fosco"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Volume (ml) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    name="volumeMl"
                    required
                    defaultValue={editingTinta?.volumeMl || 250}
                    placeholder="250"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="preco"
                    required
                    defaultValue={editingTinta?.preco || 25.0}
                    placeholder="25.00"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button type="button" variant="secondary" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading
                    ? "Salvando..."
                    : editingTinta
                    ? "Atualizar Tinta"
                    : "Cadastrar Tinta"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={!!deleteConfirmId}
        itemName={tintas.find((t) => t.id === deleteConfirmId)?.nome}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={async () => {
          if (deleteConfirmId) {
            await handleDelete(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
      />
    </div>
  );
}
