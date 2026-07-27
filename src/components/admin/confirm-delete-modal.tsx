"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";

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
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 text-rose-500 dark:text-rose-400 rounded-xl border border-rose-500/20 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Confirmação permanente de remoção de registro
          </p>
        </div>

        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {description}
        </p>

        {itemName && (
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-rose-600 dark:text-rose-300 text-xs truncate">
            "{itemName}"
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button variant="secondary" onClick={onClose} disabled={loading} size="sm">
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={loading}
            size="sm"
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {loading ? "Excluindo..." : "Excluir Registro"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
