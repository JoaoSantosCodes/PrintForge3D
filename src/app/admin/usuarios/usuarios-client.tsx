"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  aprovarUsuarioAction,
  bloquearUsuarioAction,
  reativarUsuarioAction,
} from "@/app/actions/usuarios";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Shield,
  User,
  CheckCircle2,
  AlertOctagon,
  Search,
  Filter,
} from "lucide-react";

interface UsuariosClientPageProps {
  usuarios: any[];
  currentUserId: string | null;
}

export default function UsuariosClientPage({
  usuarios,
  currentUserId,
}: UsuariosClientPageProps) {
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const filteredUsuarios = usuarios.filter((u) => {
    const matchesStatus = filterStatus === "todos" || u.status === filterStatus;
    const matchesSearch =
      (u.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleAprovar = async (id: string) => {
    setActionLoadingId(id);
    const res = await aprovarUsuarioAction(id);
    setActionLoadingId(null);
    if (res?.error) alert(res.error);
  };

  const handleBloquear = async (id: string) => {
    setActionLoadingId(id);
    const res = await bloquearUsuarioAction(id);
    setActionLoadingId(null);
    if (res?.error) alert(res.error);
  };

  const handleReativar = async (id: string) => {
    setActionLoadingId(id);
    const res = await reativarUsuarioAction(id);
    setActionLoadingId(null);
    if (res?.error) alert(res.error);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-teal-400" /> Gestão de Usuários & Perfis
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie novos cadastros, aprove acessos e controle permissões da plataforma.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "todos", label: "Todos" },
            { id: "pendente", label: "Pendentes ⏳" },
            { id: "aprovado", label: "Aprovados ✅" },
            { id: "bloqueado", label: "Bloqueados 🚫" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                filterStatus === tab.id
                  ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users List */}
      {filteredUsuarios.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum usuário encontrado"
          description="Não há usuários cadastrados correspondentes aos filtros selecionados."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsuarios.map((u) => {
            const isSelf = u.id === currentUserId;
            const isPendente = u.status === "pendente";
            const isAprovado = u.status === "aprovado";
            const isBloqueado = u.status === "bloqueado";
            const isAdmin = u.role === "admin";

            return (
              <div
                key={u.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-teal-400 font-extrabold text-base">
                        {u.nome ? u.nome.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-100 text-base line-clamp-1">
                          {u.nome || "Usuário Sem Nome"}
                        </h3>
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    <Badge variant={isAdmin ? "success" : "secondary"}>
                      <Shield className="w-3 h-3 mr-1" />
                      {isAdmin ? "Administrador" : "Usuário Comum"}
                    </Badge>

                    {isPendente && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pendente
                      </span>
                    )}
                    {isAprovado && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Aprovado
                      </span>
                    )}
                    {isBloqueado && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-1">
                        <AlertOctagon className="w-3 h-3" /> Bloqueado
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  {isSelf ? (
                    <span className="text-xs text-slate-500 italic">Sua Conta Atual</span>
                  ) : (
                    <>
                      {isPendente && (
                        <Button
                          variant="primary"
                          className="w-full text-xs py-1.5"
                          disabled={actionLoadingId === u.id}
                          onClick={() => handleAprovar(u.id)}
                        >
                          <UserCheck className="w-3.5 h-3.5" /> Aprovar Acesso
                        </Button>
                      )}

                      {isAprovado && (
                        <button
                          onClick={() => handleBloquear(u.id)}
                          disabled={actionLoadingId === u.id}
                          className="w-full py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-rose-500/20"
                        >
                          <UserX className="w-3.5 h-3.5" /> Bloquear Acesso
                        </button>
                      )}

                      {isBloqueado && (
                        <Button
                          variant="secondary"
                          className="w-full text-xs py-1.5"
                          disabled={actionLoadingId === u.id}
                          onClick={() => handleReativar(u.id)}
                        >
                          <UserCheck className="w-3.5 h-3.5 text-teal-400" /> Reativar Conta
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
