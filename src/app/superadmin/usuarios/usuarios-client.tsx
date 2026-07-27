"use client";

import { useState } from "react";
import {
  criarUsuarioSuperAdminAction,
  aprovarUsuarioSuperAdminAction,
  alterarStatusUsuarioSuperAdminAction,
  alterarRoleUsuarioSuperAdminAction,
  vincularEmpresaUsuarioSuperAdminAction,
  deleteUsuarioSuperAdminAction,
  concluirSolicitacaoExclusaoSuperAdminAction,
} from "@/app/actions/superadmin";
import { Users, Search, CheckCircle2, XCircle, Clock, Shield, Store, UserCheck, Trash2, Loader2, UserPlus, X, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";

interface UsuarioItem {
  id: string;
  email: string;
  nome: string | null;
  role: string;
  status: string;
  empresaId: string | null;
  createdAt: Date | string;
  aprovadoEm?: Date | string | null;
  empresa?: {
    id: string;
    nome: string;
    slug: string;
  } | null;
}

interface EmpresaItem {
  id: string;
  nome: string;
  slug: string;
}

interface SolicitacaoExclusaoItem {
  id: string;
  usuarioId: string;
  email: string;
  motivo: string | null;
  status: string;
  createdAt: Date | string;
}

export default function UsuariosSuperAdminClient({
  usuarios,
  empresas,
  solicitacoesExclusao,
}: {
  usuarios: UsuarioItem[];
  empresas: EmpresaItem[];
  solicitacoesExclusao: SolicitacaoExclusaoItem[];
}) {
  const [filterTab, setFilterTab] = useState<"todos" | "pendente" | "aprovado" | "bloqueado" | "solicitacoes">("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingCount = usuarios.filter((u) => u.status === "pendente").length;
  const activeCount = usuarios.filter((u) => u.status === "aprovado").length;
  const blockedCount = usuarios.filter((u) => u.status === "bloqueado").length;

  const filteredUsuarios = usuarios.filter((u) => {
    const matchesTab = filterTab === "todos" || u.status === filterTab;

    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (u.nome && u.nome.toLowerCase().includes(query)) ||
      u.email.toLowerCase().includes(query) ||
      (u.empresa && u.empresa.nome.toLowerCase().includes(query));

    return matchesTab && matchesSearch;
  });

  const handleCreateUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const res = await criarUsuarioSuperAdminAction(formData);
    setIsSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message);
      setIsModalOpen(false);
    }
  };

  const handleAprovar = async (id: string) => {
    setLoadingId(id);
    const res = await aprovarUsuarioSuperAdminAction(id);
    setLoadingId(null);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message);
    }
  };

  const handleStatusChange = async (id: string, novoStatus: string) => {
    setLoadingId(id);
    const res = await alterarStatusUsuarioSuperAdminAction(id, novoStatus);
    setLoadingId(null);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message);
    }
  };

  const handleRoleChange = async (id: string, novaRole: string) => {
    setLoadingId(id);
    const res = await alterarRoleUsuarioSuperAdminAction(id, novaRole);
    setLoadingId(null);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message);
    }
  };

  const handleEmpresaChange = async (id: string, empresaId: string) => {
    setLoadingId(id);
    const res = await vincularEmpresaUsuarioSuperAdminAction(id, empresaId === "" ? null : empresaId);
    setLoadingId(null);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message);
    }
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${email}"? Esta ação não pode ser desfeita.`)) return;

    setLoadingId(id);
    const res = await deleteUsuarioSuperAdminAction(id);
    setLoadingId(null);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message);
    }
  };

  const handleSolicitacaoExclusao = async (id: string, acao: "concluir" | "rejeitar") => {
    setLoadingId(id);
    const res = await concluirSolicitacaoExclusaoSuperAdminAction(id, acao);
    setLoadingId(null);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Users className="w-7 h-7 text-purple-400" /> Gestão de Usuários do SaaS
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Visualização global, aprovação de cadastros, gerenciamento de permissões e criação de novas contas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> + Criar Novo Usuário
          </button>
        </div>
      </div>

      {/* Pending Approval Notice Banner */}
      {pendingCount > 0 && filterTab !== "pendente" && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                {pendingCount} {pendingCount === 1 ? "usuário aguarda" : "usuários aguardam"} aprovação de cadastro
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Revise os cadastros pendentes para liberar o acesso das novas contas.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterTab("pendente")}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all shadow-md shrink-0"
          >
            Ver Pendentes ({pendingCount})
          </button>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
          <button
            onClick={() => setFilterTab("todos")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterTab === "todos"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Todos ({usuarios.length})
          </button>

          <button
            onClick={() => setFilterTab("pendente")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterTab === "pendente"
                ? "bg-amber-500 text-slate-950 font-black shadow-md"
                : "text-slate-400 hover:text-amber-400"
            }`}
          >
            Pendentes
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-950 text-amber-300 font-bold border border-amber-500/40">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilterTab("aprovado")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterTab === "aprovado"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-400 hover:text-emerald-400"
            }`}
          >
            Ativos ({activeCount})
          </button>

          <button
            onClick={() => setFilterTab("bloqueado")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterTab === "bloqueado"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                : "text-slate-400 hover:text-rose-400"
            }`}
          >
            Bloqueados ({blockedCount})
          </button>

          <button
            onClick={() => setFilterTab("solicitacoes")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterTab === "solicitacoes"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-indigo-400"
            }`}
          >
            Solicitações LGPD ({solicitacoesExclusao.length})
          </button>
        </div>

        {/* Search */}
        {filterTab !== "solicitacoes" && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou loja..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        )}
      </div>

      {/* LGPD Deletion Requests Tab */}
      {filterTab === "solicitacoes" ? (
        <div className="space-y-4">
          {solicitacoesExclusao.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
              Nenhuma solicitação de exclusão de dados pendente.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {solicitacoesExclusao.map((sol) => (
                <div
                  key={sol.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{sol.email}</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        sol.status === "pendente"
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                          : sol.status === "concluido"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {sol.status}
                    </span>
                  </div>

                  {sol.motivo && (
                    <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 italic">
                      &ldquo;{sol.motivo}&rdquo;
                    </p>
                  )}

                  {sol.status === "pendente" && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleSolicitacaoExclusao(sol.id, "rejeitar")}
                        disabled={loadingId === sol.id}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                      >
                        Rejeitar
                      </button>
                      <button
                        onClick={() => handleSolicitacaoExclusao(sol.id, "concluir")}
                        disabled={loadingId === sol.id}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        Marcar como Concluído
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Users List Table / Cards */
        <div className="space-y-4">
          {filteredUsuarios.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
              Nenhum usuário encontrado para os filtros selecionados.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsuarios.map((u) => {
                const isLoading = loadingId === u.id;
                const isSuperAdmin = u.role === "super_admin";
                const isAdmin = u.role === "admin";
                const isPendente = u.status === "pendente";

                return (
                  <div
                    key={u.id}
                    className={`bg-slate-900 border rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xl transition-all ${
                      isPendente
                        ? "border-amber-500/40 ring-1 ring-amber-500/20"
                        : u.status === "bloqueado"
                        ? "border-rose-500/30 opacity-75"
                        : "border-slate-800"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Header Badges */}
                      <div className="flex items-center justify-between">
                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                            u.status === "aprovado"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : u.status === "pendente"
                              ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          {u.status === "aprovado" && <CheckCircle2 className="w-3 h-3" />}
                          {u.status === "pendente" && <Clock className="w-3 h-3" />}
                          {u.status === "bloqueado" && <XCircle className="w-3 h-3" />}
                          {u.status}
                        </span>

                        {/* Role Selector Badge */}
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={isLoading}
                          className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-lg border focus:outline-none cursor-pointer ${
                            isSuperAdmin
                              ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                              : isAdmin
                              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}
                        >
                          <option value="usuario" className="bg-slate-900 text-white">Usuário</option>
                          <option value="admin" className="bg-slate-900 text-white">Admin (Vendedor)</option>
                          <option value="super_admin" className="bg-slate-900 text-white">Super Admin</option>
                        </select>
                      </div>

                      {/* User Info */}
                      <div>
                        <h3 className="font-bold text-base text-white truncate">
                          {u.nome || u.email.split("@")[0]}
                        </h3>
                        <p className="text-xs text-indigo-300 font-mono truncate">{u.email}</p>
                      </div>

                      {/* Store Assignment Selector */}
                      <div className="pt-2 border-t border-slate-800/80 space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <Store className="w-3 h-3 text-cyan-400" /> Loja / Empresa Vinculada:
                        </label>
                        <select
                          value={u.empresaId || ""}
                          onChange={(e) => handleEmpresaChange(u.id, e.target.value)}
                          disabled={isLoading}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                        >
                          <option value="">Nenhuma (Global)</option>
                          {empresas.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.nome} (/loja/{emp.slug})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                      {isPendente ? (
                        <button
                          onClick={() => handleAprovar(u.id)}
                          disabled={isLoading}
                          className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                        >
                          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                          Aprovar Cadastro
                        </button>
                      ) : (
                        <select
                          value={u.status}
                          onChange={(e) => handleStatusChange(u.id, e.target.value)}
                          disabled={isLoading}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
                        >
                          <option value="aprovado">Status: Aprovado</option>
                          <option value="pendente">Status: Pendente</option>
                          <option value="bloqueado">Status: Bloqueado</option>
                        </select>
                      )}

                      <button
                        onClick={() => handleDeleteUser(u.id, u.email)}
                        disabled={isLoading || isSuperAdmin}
                        title="Excluir Usuário"
                        className="py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/20 disabled:opacity-30 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-400" /> Criar Novo Usuário
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nome Completo</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="nome"
                    placeholder="Ex: João Santos"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">E-mail de Acesso *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="novo.usuario@exemplo.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Senha de Acesso *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Papel / Role</label>
                  <select
                    name="role"
                    defaultValue="admin"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="admin">Admin (Vendedor/Loja)</option>
                    <option value="usuario">Usuário Comum</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Status Inicial</label>
                  <select
                    name="status"
                    defaultValue="aprovado"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="aprovado">Aprovado (Ativo)</option>
                    <option value="pendente">Pendente</option>
                    <option value="bloqueado">Bloqueado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Vincular a uma Loja (Opcional)</label>
                <select
                  name="empresaId"
                  defaultValue=""
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Nenhuma (Global)</option>
                  {empresas.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.nome} (/loja/{emp.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  {isSubmitting ? "Criando..." : "Criar Usuário"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
