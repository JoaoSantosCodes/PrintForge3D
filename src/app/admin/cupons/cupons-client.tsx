"use client";

import { useState } from "react";
import { createCupomAction, toggleCupomAction, deleteCupomAction } from "@/app/actions/cupons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Ticket, Plus, Trash2, Power, CheckCircle2, ShieldAlert, Percent } from "lucide-react";

interface CuponsClientProps {
  cupons: any[];
}

export function CuponsClient({ cupons }: CuponsClientProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmitNew = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const res = await createCupomAction(formData);
    setLoading(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else if (res?.success) {
      setShowModal(false);
    }
  };

  const handleToggle = async (id: string) => {
    const res = await toggleCupomAction(id);
    if (res?.error) alert(res.error);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este cupom de desconto?")) {
      const res = await deleteCupomAction(id);
      if (res?.error) alert(res.error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
            <Ticket className="w-8 h-8 text-teal-400" /> Gestão de Cupons de Desconto
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Cadastre e ative códigos de desconto promocionais para seus clientes no catálogo.
          </p>
        </div>

        <Button variant="primary" onClick={() => setShowModal(true)} className="px-5 py-2.5">
          <Plus className="w-4 h-4" /> Criar Novo Cupom
        </Button>
      </div>

      {/* Coupons Grid */}
      {cupons.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="Nenhum cupom cadastrado"
          description="Clique no botão acima para criar o primeiro cupom promocional da sua loja."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cupons.map((c) => (
            <div
              key={c.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative flex flex-col justify-between space-y-4 shadow-xl hover:border-slate-700 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-lg text-teal-400 tracking-wider bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-xl">
                    {c.codigo}
                  </span>
                  <Badge variant={c.ativo ? "success" : "secondary"}>
                    {c.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                <div className="flex items-baseline gap-1 text-2xl font-black text-slate-100">
                  <span>{c.percentualDesconto}%</span>
                  <span className="text-xs text-slate-400 font-normal">de desconto</span>
                </div>

                {c.validoAte && (
                  <p className="text-xs text-slate-400">
                    Válido até: <span className="text-slate-200 font-semibold">{new Date(c.validoAte).toLocaleDateString("pt-BR")}</span>
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggle(c.id)}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border ${
                    c.ativo
                      ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20"
                      : "bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border-teal-500/20"
                  }`}
                >
                  <Power className="w-3.5 h-3.5" /> {c.ativo ? "Desativar" : "Ativar"}
                </button>

                <button
                  onClick={() => handleDelete(c.id)}
                  className="py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-rose-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-teal-400" /> Cadastrar Novo Cupom
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-100 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitNew} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Código do Cupom *
                </label>
                <input
                  type="text"
                  name="codigo"
                  required
                  placeholder="Ex: PROMO10, DESCONTO20"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 uppercase placeholder-slate-600 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Percentual de Desconto (%) *
                </label>
                <input
                  type="number"
                  name="percentualDesconto"
                  required
                  min={1}
                  max={100}
                  step={0.1}
                  placeholder="Ex: 10, 15, 20"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Válido Até (Opcional)
                </label>
                <input
                  type="date"
                  name="validoAte"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? "Criando..." : "Salvar Cupom"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
