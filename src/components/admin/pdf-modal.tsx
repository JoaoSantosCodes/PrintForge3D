"use client";

import { useState } from "react";
import { gerarPDFOrcamento } from "@/lib/pdf";
import { Button } from "@/components/ui/button";
import { FileText, X, Printer, Calendar, Clock, Building } from "lucide-react";

interface PDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  pecaNome: string;
  pecaDescricao?: string | null;
  pecaCategoria?: string | null;
  fotoUrl?: string | null;
  precoPadrao: number;
  clienteNome?: string;
  clienteContato?: string;
  quantidade?: number;
  observacoes?: string | null;
}

export function PDFModal({
  isOpen,
  onClose,
  pecaNome,
  pecaDescricao,
  pecaCategoria,
  fotoUrl,
  precoPadrao,
  clienteNome,
  clienteContato,
  quantidade = 1,
  observacoes,
}: PDFModalProps) {
  const [estudioNome, setEstudioNome] = useState("PrintForge 3D");
  const [prazoEstimado, setPrazoEstimado] = useState("5 a 7 dias úteis");
  const [validadeDias, setValidadeDias] = useState(7);
  const [precoFinal, setPrecoFinal] = useState<number>(precoPadrao * quantidade);
  const [custoEstudioNome, setCustoEstudioNome] = useState(clienteNome || "");
  const [custoEstudioContato, setCustoEstudioContato] = useState(clienteContato || "");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleGerarPDF(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await gerarPDFOrcamento({
        estudioNome,
        clienteNome: custoEstudioNome || undefined,
        clienteContato: custoEstudioContato || undefined,
        pecaNome,
        pecaDescricao,
        pecaCategoria,
        fotoUrl,
        quantidade,
        precoFinal: precoFinal || precoPadrao,
        prazoEstimado,
        validadeDias,
        observacoes,
      });
      setLoading(false);
      onClose();
    } catch (err) {
      alert("Erro ao gerar arquivo PDF. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200 text-left transition-colors">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Gerar Orçamento PDF</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Proposta comercial limpa sem custos internos.
            </p>
          </div>
        </div>

        <form onSubmit={handleGerarPDF} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nome do Estúdio / Empresa
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={estudioNome}
                onChange={(e) => setEstudioNome(e.target.value)}
                placeholder="PrintForge 3D"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome do Cliente
              </label>
              <input
                type="text"
                value={custoEstudioNome}
                onChange={(e) => setCustoEstudioNome(e.target.value)}
                placeholder="Nome do cliente"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contato (Tel/E-mail)
              </label>
              <input
                type="text"
                value={custoEstudioContato}
                onChange={(e) => setCustoEstudioContato(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Prazo Estimado
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={prazoEstimado}
                  onChange={(e) => setPrazoEstimado(e.target.value)}
                  placeholder="5 a 7 dias úteis"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Validade (dias)
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={validadeDias}
                  onChange={(e) => setValidadeDias(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Preço Final Sugerido ao Cliente (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={precoFinal}
              onChange={(e) => setPrecoFinal(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-teal-600 dark:text-teal-400 font-bold focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <span className="text-teal-600 dark:text-teal-400 font-semibold block">Garantia de Privacidade:</span>
            <p>O documento gerado não exibirá consumo de filamento, energia, mão de obra ou margens internas de custo.</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              <Printer className="w-4 h-4" />
              {loading ? "Gerando PDF..." : "Gerar & Abrir PDF"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
