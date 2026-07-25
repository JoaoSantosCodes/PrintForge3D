"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Trash2 } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  itemName?: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export function ConfirmDeleteModal({
  isOpen,
  title = "Confirmar Exclusão",
  description = "Esta ação não pode ser desfeita. Deseja realmente excluir este item?",
  itemName,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-200 text-left">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-100 rounded-full hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">{title}</h2>
            <p className="text-xs text-slate-400">Confirmação de remoção do registro</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-2 leading-relaxed">
          {description}
        </p>

        {itemName && (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-semibold text-rose-300 text-xs truncate mb-6">
            "{itemName}"
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={loading}
            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {loading ? "Excluindo..." : "Excluir Registro"}
          </Button>
        </div>
      </div>
    </div>
  );
}
