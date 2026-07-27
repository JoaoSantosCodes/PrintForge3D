"use client";

import { useState } from "react";
import { saveChavePixAction } from "@/app/actions/configuracoes";
import { Button } from "@/components/ui/button";
import { Settings, QrCode, Save, CheckCircle2, ShieldAlert } from "lucide-react";

interface ConfiguracoesClientProps {
  initialChavePix: string;
}

export function ConfiguracoesClient({ initialChavePix }: ConfiguracoesClientProps) {
  const [chavePix, setChavePix] = useState(initialChavePix);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await saveChavePixAction(chavePix);
    setLoading(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else if (res?.success) {
      setSuccessMsg("Chave PIX salva com sucesso!");
    }
  };

  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
          <Settings className="w-7 h-7 sm:w-8 sm:h-8 text-teal-500 dark:text-teal-400" /> Configurações Gerais da Loja
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
          Gerencie a chave PIX para pagamentos manuais e preferências do sistema.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-2xl space-y-6 transition-colors">
        {successMsg && (
          <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl text-teal-700 dark:text-teal-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-500 dark:text-teal-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-teal-500 dark:text-teal-400" /> Chave PIX da Loja (Para Pagamento Manual)
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Esta chave será exibida no painel do cliente quando o pedido estiver com status "Pronto" ou "Aguardando Pagamento", acompanhada do botão de cópia.
            </p>
            <input
              type="text"
              required
              value={chavePix}
              onChange={(e) => setChavePix(e.target.value)}
              placeholder="CNPJ, E-mail, Telefone ou Chave Aleatória PIX..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors font-mono"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-end">
            <Button variant="primary" type="submit" disabled={loading} className="px-6 py-2.5 w-full sm:w-auto">
              <Save className="w-4 h-4" /> {loading ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
