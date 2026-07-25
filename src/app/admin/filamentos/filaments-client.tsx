"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Boxes, Palette, Tag, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";
import { EmptyState } from "@/components/ui/empty-state";
import { formatarMoeda } from "@/lib/custos";
import { createFilamentAction, updateFilamentAction, deleteFilamentAction } from "@/app/actions/filaments";

export default function FilamentsClientPage({ initialFilaments }: { initialFilaments: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFilament, setEditingFilament] = useState<any | null>(null);
  const [deletingFilament, setDeletingFilament] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleOpenCreate = () => {
    setEditingFilament(null);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (filament: any) => {
    setEditingFilament(filament);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    let res;

    if (editingFilament) {
      res = await updateFilamentAction(editingFilament.id, formData);
    } else {
      res = await createFilamentAction(formData);
    }

    setLoading(false);
    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      setIsModalOpen(false);
    }
  };

  const confirmDelete = async () => {
    if (deletingFilament) {
      await deleteFilamentAction(deletingFilament.id);
      setDeletingFilament(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
            <Boxes className="w-8 h-8 text-cyan-400" /> Filamentos & Resinas
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Cadastre os insumos de impressão com preços por Kg para calcular custos de material.
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary">
          <Plus className="w-4 h-4" /> Novo Filamento
        </Button>
      </div>

      {initialFilaments.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="Nenhum filamento cadastrado"
          description="Cadastre seus insumos (PLA, PETG, ABS, Resinas) com preço por Kg para calcular automaticamente os custos de material das suas impressões."
          actionLabel="Cadastrar Novo Filamento"
          onActionClick={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialFilaments.map((filament) => {
            const precoPorGrama = filament.precoPorKg / 1000;
            return (
              <div
                key={filament.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative group hover:border-cyan-500/40 transition-all shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200">
                      {filament.tipo.slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="info">{filament.tipo}</Badge>
                        {filament.marca && (
                          <span className="text-xs text-slate-400 font-medium">{filament.marca}</span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-100 mt-1 flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-cyan-400" /> {filament.cor}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(filament)}
                      className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingFilament(filament)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
                  {/* Stock Progress Bar */}
                  {(() => {
                    const restante = filament.pesoRestanteGramas ?? 1000;
                    const percentual = Math.min(100, Math.max(0, Math.round((restante / 1000) * 100)));
                    const isLowStock = percentual < 15;
                    return (
                      <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-400 font-semibold flex items-center gap-1">
                            Estoque Restante:
                          </span>
                          <span className={`font-bold font-mono ${isLowStock ? "text-rose-400" : "text-emerald-400"}`}>
                            {restante}g ({percentual}%)
                          </span>
                        </div>

                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isLowStock ? "bg-rose-500 animate-pulse" : percentual < 40 ? "bg-amber-500" : "bg-teal-500"
                            }`}
                            style={{ width: `${percentual}%` }}
                          />
                        </div>

                        {isLowStock && (
                          <div className="text-[10px] font-bold text-rose-400 pt-0.5 flex items-center justify-between">
                            <span>⚠️ Estoque Baixo (&lt; 15%)</span>
                            <span>Comprar Novo Rolo</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Preço do Carretel / Kg</span>
                    <span className="font-bold text-slate-100">{formatarMoeda(filament.precoPorKg)} / kg</span>
                  </div>

                  {/* Price History Timeline */}
                  {filament.priceHistory && filament.priceHistory.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/50 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                        Histórico de Preços Anteriores:
                      </span>
                      <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                        {filament.priceHistory.map((h: any) => (
                          <div key={h.id} className="flex justify-between text-[11px] text-slate-400">
                            <span>{new Date(h.data).toLocaleDateString("pt-BR")}</span>
                            <span className="font-mono line-through text-rose-400/80">{formatarMoeda(h.precoPorKg)}/kg</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
                    <span className="text-slate-400 font-medium">Custo por Grama</span>
                    <span className="font-bold text-cyan-400">{formatarMoeda(precoPorGrama)} / g</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFilament ? "Editar Filamento" : "Novo Filamento / Resina"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tipo do Material *
            </label>
            <select
              name="tipo"
              defaultValue={editingFilament?.tipo || "PLA"}
              required
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="PLA">PLA</option>
              <option value="PETG">PETG</option>
              <option value="ABS">ABS</option>
              <option value="ASA">ASA</option>
              <option value="TPU">TPU</option>
              <option value="Resina">Resina (SLA/DLP)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Marca / Fabricante
              </label>
              <input
                type="text"
                name="marca"
                defaultValue={editingFilament?.marca || ""}
                placeholder="Ex: Voolt3D, Creality, Esun"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cor *
              </label>
              <input
                type="text"
                name="cor"
                defaultValue={editingFilament?.cor || ""}
                required
                placeholder="Ex: Preto Matte, Azul Seda, Transparente"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Preço por Kg (R$) *
              </label>
              <input
                type="number"
                step="any"
                name="precoPorKg"
                defaultValue={editingFilament?.precoPorKg ?? 100}
                required
                placeholder="Ex: 110.00"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estoque Restante (Gramas) *
              </label>
              <input
                type="number"
                step="any"
                name="pesoRestanteGramas"
                defaultValue={editingFilament?.pesoRestanteGramas ?? 1000}
                required
                placeholder="Ex: 1000 (Rolo Cheio)"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Filamento"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={!!deletingFilament}
        itemName={deletingFilament ? `${deletingFilament.tipo} (${deletingFilament.cor})` : ""}
        onClose={() => setDeletingFilament(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
