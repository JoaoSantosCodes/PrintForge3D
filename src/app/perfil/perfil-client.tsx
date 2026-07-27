"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, ShieldCheck, CheckCircle2, ShieldAlert, KeyRound, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { atualizarPerfilAction } from "@/app/actions/auth";

interface PerfilClientProps {
  profile: {
    id: string;
    email: string;
    nome: string | null;
    role: string;
    status: string;
    createdAt: string;
  };
}

export function PerfilClient({ profile }: PerfilClientProps) {
  const [nome, setNome] = useState(profile.nome || "");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (novaSenha && novaSenha !== confirmarSenha) {
      setErrorMsg("A nova senha e a confirmação não coincidem.");
      return;
    }

    setLoading(true);
    const res = await atualizarPerfilAction(nome, novaSenha || undefined);
    setLoading(false);

    if (res?.error) {
      setErrorMsg(res.error);
    } else if (res?.success) {
      setSuccessMsg(res.message || "Perfil atualizado com sucesso!");
      setNovaSenha("");
      setConfirmarSenha("");
    }
  };

  const isAdmin = profile.role === "admin";

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300 py-6">
      {/* Top Header */}
      <div className="border-b border-slate-800 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
            <User className="w-8 h-8 text-teal-400" /> Meu Perfil
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie seus dados pessoais, informações da conta e senha de acesso.
          </p>
        </div>

        <Badge variant={isAdmin ? "success" : "secondary"}>
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          {isAdmin ? "Perfil Administrador" : "Perfil Usuário"}
        </Badge>
      </div>

      {/* Main Profile Form Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
        {successMsg && (
          <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl text-teal-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Readonly E-mail info */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Endereço de E-mail (Identificador):
            </span>
            <p className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Mail className="w-4 h-4 text-teal-400" /> {profile.email}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Seu Nome Completo *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu Nome"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>
          </div>

          {/* Change Password Section */}
          <div className="pt-6 border-t border-slate-800/80 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
              <KeyRound className="w-4 h-4 text-teal-400" /> Alterar Senha de Acesso (Opcional)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    minLength={6}
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Confirme a Nova Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    minLength={6}
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end">
            <Button variant="primary" type="submit" disabled={loading} className="px-6 py-2.5">
              <Save className="w-4 h-4" /> {loading ? "Salvando Alterações..." : "Salvar Perfil"}
            </Button>
          </div>
        </form>

        {/* Section LGPD - Meus Dados */}
        <div className="pt-8 border-t border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-400" /> Meus Dados & Privacidade (LGPD)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Exerça seus direitos de titular de dados pessoais segundo a Lei Geral de Proteção de Dados.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-200">Exportar Meus Dados</h3>
                <p className="text-[11px] text-slate-400">
                  Baixe uma cópia completa dos seus dados cadastrais e histórico de pedidos em formato JSON.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs"
                onClick={async () => {
                  const { exportUserDataAction } = await import("@/app/actions/lgpd");
                  const res = await exportUserDataAction();
                  if (res?.error) {
                    alert(res.error);
                  } else if (res?.data) {
                    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `meus-dados-printforge3d-${Date.now()}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }
                }}
              >
                📥 Exportar Meus Dados (JSON)
              </Button>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-rose-400">Solicitar Exclusão da Conta</h3>
                <p className="text-[11px] text-slate-400">
                  Envie uma solicitação para exclusão do seu cadastro e dados após a finalização de pedidos.
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                className="w-full text-xs"
                onClick={async () => {
                  const motivo = prompt("Por favor, digite o motivo da solicitação de exclusão (opcional):");
                  if (motivo !== null) {
                    const { requestAccountDeletionAction } = await import("@/app/actions/lgpd");
                    const res = await requestAccountDeletionAction(motivo);
                    if (res?.error) {
                      alert(res.error);
                    } else if (res?.message) {
                      alert(res.message);
                    }
                  }
                }}
              >
                ⚠️ Solicitar Exclusão da Conta
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
