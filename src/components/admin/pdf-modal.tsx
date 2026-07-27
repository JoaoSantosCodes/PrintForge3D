"use client";

import { useState } from "react";
import { toast } from "sonner";
import { gerarPDFOrcamento } from "@/lib/pdf";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { FileText, Printer, Calendar, Clock, Building } from "lucide-react";

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
      toast.success("Orçamento em PDF gerado com sucesso!");
      onClose();
    } catch (err) {
      toast.error("Erro ao gerar arquivo PDF. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gerar Orçamento em PDF">
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
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
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
              placeholder="Ex: João Santos"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Contato do Cliente
            </label>
            <input
              type="text"
              value={custoEstudioContato}
              onChange={(e) => setCustoEstudioContato(e.target.value)}
              placeholder="Ex: (11) 99999-8888"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Prazo Estimado de Entrega
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={prazoEstimado}
                onChange={(e) => setPrazoEstimado(e.target.value)}
                placeholder="Ex: 5 dias úteis"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Validade da Proposta (Dias)
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                value={validadeDias}
                onChange={(e) => setValidadeDias(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Preço Total Proposto (R$)
          </label>
          <input
            type="number"
            step="any"
            value={precoFinal}
            onChange={(e) => setPrecoFinal(Number(e.target.value))}
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-bold text-teal-600 dark:text-teal-400 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} size="sm">
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={loading}>
            <Printer className="w-4 h-4" />
            {loading ? "Gerando PDF..." : "Gerar e Baixar PDF"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
