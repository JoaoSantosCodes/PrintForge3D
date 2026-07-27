"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Zap, Clock, DollarSign, Printer, Wrench, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";
import { formatarMoeda } from "@/lib/custos";
import { createPrinterAction, updatePrinterAction, deletePrinterAction, registrarManutencaoAction } from "@/app/actions/printers";

export default function PrintersClientPage({ initialPrinters }: { initialPrinters: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<any | null>(null);
  const [deletingPrinter, setDeletingPrinter] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleOpenCreate = () => {
    setEditingPrinter(null);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (printer: any) => {
    setEditingPrinter(printer);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    let res;

    if (editingPrinter) {
      res = await updatePrinterAction(editingPrinter.id, formData);
    } else {
      res = await createPrinterAction(formData);
    }

    setLoading(false);
    if (res?.error) {
      setErrorMsg(res.error);
      toast.error(res.error);
    } else {
      toast.success(editingPrinter ? "Impressora atualizada com sucesso!" : "Impressora cadastrada com sucesso!");
      setIsModalOpen(false);
    }
  };

  const confirmDelete = async () => {
    if (deletingPrinter) {
      const res = await deletePrinterAction(deletingPrinter.id);
      setDeletingPrinter(null);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Impressora removida com sucesso!");
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <Printer className="w-7 h-7 sm:w-8 sm:h-8 text-teal-500 dark:text-teal-400" /> Impressoras 3D
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Cadastre os parâmetros da sua máquina para cálculo automático de consumo e depreciação.
          </p>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" size="sm" className="w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Nova Impressora
        </Button>
      </div>

      {initialPrinters.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
          <Printer className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-200">Nenhuma impressora cadastrada</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
            Adicione sua primeira impressora 3D para calcular custos de depreciação e energia.
          </p>
          <Button onClick={handleOpenCreate} variant="primary">
            <Plus className="w-4 h-4" /> Cadastrar Impressora
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialPrinters.map((printer) => {
            const custoHoraDepreciacao = printer.preco / (printer.vidaUtilHoras || 1);
            return (
              <div
                key={printer.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative group hover:border-teal-500/40 transition-all shadow-md dark:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{printer.nome}</h3>
                      {printer.modelo && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{printer.modelo}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEdit(printer)}
                        className="p-1.5 text-slate-400 hover:text-teal-500 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingPrinter(printer)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800/80 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> Consumo Elétrico
                      </span>
                      <span className="font-semibold">{printer.consumoWatts} W</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Preço de Compra
                      </span>
                      <span className="font-semibold">{formatarMoeda(printer.preco)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" /> Vida Útil Estimada
                      </span>
                      <span className="font-semibold">{printer.vidaUtilHoras.toLocaleString("pt-BR")} hs</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/50">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Depreciação por Hora</span>
                      <span className="font-bold text-teal-600 dark:text-teal-400">{formatarMoeda(custoHoraDepreciacao)}/h</span>
                    </div>

                    {/* Maintenance Progress & Warning Section */}
                    {(() => {
                      const horasUso = printer.horasUsoAcumuladas || 0;
                      const intervalo = printer.intervaloManutencaoHoras || 200;
                      const pct = Math.min(100, Math.round((horasUso / intervalo) * 100));
                      const necessitaManutencao = horasUso >= intervalo;

                      return (
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-semibold">
                              <Wrench className="w-3 h-3 text-amber-500 dark:text-amber-400" /> Manutenção Preventiva
                            </span>
                            <span className={necessitaManutencao ? "text-amber-500 font-bold animate-pulse" : "text-slate-500 dark:text-slate-400 font-mono"}>
                              {horasUso.toFixed(1)}h / {intervalo}h ({pct}%)
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-200 dark:border-slate-800">
                            <div
                              className={`h-full transition-all ${
                                necessitaManutencao ? "bg-amber-500" : pct > 75 ? "bg-amber-500/80" : "bg-teal-500"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>

                          {necessitaManutencao && (
                            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-700 dark:text-amber-300 text-[11px] font-bold flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                              Manutenção recomendada!
                            </div>
                          )}

                          <button
                            onClick={async () => {
                              await registrarManutencaoAction(printer.id);
                            }}
                            className="w-full py-1.5 px-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-300 dark:border-slate-700/60"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" /> Registrar manutenção realizada
                          </button>
                        </div>
                      );
                    })()}
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
        title={editingPrinter ? "Editar Impressora" : "Nova Impressora 3D"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nome da Impressora *
            </label>
            <input
              type="text"
              name="nome"
              defaultValue={editingPrinter?.nome || ""}
              required
              placeholder="Ex: Ender 3 V2, Bambu Lab X1C"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Modelo / Fabricante
            </label>
            <input
              type="text"
              name="modelo"
              defaultValue={editingPrinter?.modelo || ""}
              placeholder="Ex: Creality, Bambu Lab, Elegoo"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Consumo (Watts) *
              </label>
              <input
                type="number"
                step="any"
                name="consumoWatts"
                defaultValue={editingPrinter?.consumoWatts ?? 150}
                required
                placeholder="Ex: 150, 350"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Preço da Máquina (R$) *
              </label>
              <input
                type="number"
                step="any"
                name="preco"
                defaultValue={editingPrinter?.preco ?? 2500}
                required
                placeholder="Ex: 2500.00"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Vida Útil (Horas) *
              </label>
              <input
                type="number"
                step="any"
                name="vidaUtilHoras"
                defaultValue={editingPrinter?.vidaUtilHoras ?? 5000}
                required
                placeholder="Ex: 5000"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Manutenção Anual (R$)
              </label>
              <input
                type="number"
                step="any"
                name="custoManutencaoAno"
                defaultValue={editingPrinter?.custoManutencaoAno ?? 0}
                placeholder="Ex: 200.00"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500"
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
              {loading ? "Salvando..." : "Salvar Impressora"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        isOpen={!!deletingPrinter}
        itemName={deletingPrinter?.nome}
        onClose={() => setDeletingPrinter(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
