"use client";

import { useState } from "react";
import {
  marcarMensalidadePagaAction,
  alterarStatusEmpresaAction,
  alterarPlanoEmpresaAction,
} from "@/app/actions/superadmin";
import {
  Search,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Ban,
  DollarSign,
  Loader2,
  ExternalLink,
  Layers,
  User,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface EmpresaItem {
  id: string;
  nome: string;
  slug: string;
  status: string;
  trialExpiraEm?: string | null;
  proximaCobranca?: string | null;
  createdAt: string;
  planoId: string;
  plano: { id: string; nome: string; precoMensal: number };
  profiles: { nome?: string | null; email: string }[];
  _count: { printers: number; pecas: number; pedidos: number };
}

interface Plano {
  id: string;
  nome: string;
  precoMensal: number;
}

export default function EmpresasSuperAdminClient({
  empresas,
  planos,
}: {
  empresas: EmpresaItem[];
  planos: Plano[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [planoFilter, setPlanoFilter] = useState("todos");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = empresas.filter((emp) => {
    const matchesSearch =
      emp.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.profiles.some((p) => p.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "todos" || emp.status === statusFilter;
    const matchesPlano = planoFilter === "todos" || emp.planoId === planoFilter;

    return matchesSearch && matchesStatus && matchesPlano;
  });

  const handleMarcarPaga = async (empresaId: string) => {
    setLoadingId(`paga_${empresaId}`);
    const res = await marcarMensalidadePagaAction(empresaId);
    setLoadingId(null);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message);
    }
  };

  const handleAlterarStatus = async (empresaId: string, novoStatus: string) => {
    setLoadingId(`status_${empresaId}`);
    const res = await alterarStatusEmpresaAction(empresaId, novoStatus);
    setLoadingId(null);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message);
    }
  };

  const handleAlterarPlano = async (empresaId: string, planoId: string) => {
    setLoadingId(`plano_${empresaId}`);
    const res = await alterarPlanoEmpresaAction(empresaId, planoId);
    setLoadingId(null);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ativo
          </span>
        );
      case "trial":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Clock className="w-3.5 h-3.5" /> Trial
          </span>
        );
      case "inadimplente":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> Inadimplente
          </span>
        );
      case "trial_expirado":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <Clock className="w-3.5 h-3.5" /> Trial Expirado
          </span>
        );
      case "bloqueado":
      case "cancelado":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            <Ban className="w-3.5 h-3.5" /> {status.toUpperCase()}
          </span>
        );
      default:
        return (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Building2 className="w-7 h-7 text-purple-400" /> Gestão de Empresas Vendedoras
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Gerencie assinaturas, status de acesso e confirmação de cobrança manual de mensalidades.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-lg">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Buscar por nome da empresa, slug ou e-mail do admin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="todos">Todos os Status</option>
            <option value="ativo">Ativos</option>
            <option value="trial">Em Trial</option>
            <option value="inadimplente">Inadimplentes</option>
            <option value="trial_expirado">Trial Expirado</option>
            <option value="bloqueado">Bloqueados</option>
            <option value="cancelado">Cancelados</option>
          </select>

          {/* Plano Filter */}
          <select
            value={planoFilter}
            onChange={(e) => setPlanoFilter(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="todos">Todos os Planos</option>
            {planos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} (R${p.precoMensal})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                <th className="p-4">Empresa / Slug</th>
                <th className="p-4">Responsável Admin</th>
                <th className="p-4">Plano</th>
                <th className="p-4">Status</th>
                <th className="p-4">Vencimento / Trial</th>
                <th className="p-4 text-center">Recursos</th>
                <th className="p-4 text-right">Ações de Cobrança & Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Nenhuma empresa encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => {
                  const admin = emp.profiles[0];
                  const isPagaLoading = loadingId === `paga_${emp.id}`;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Empresa / Slug */}
                      <td className="p-4">
                        <div className="font-bold text-white text-base">{emp.nome}</div>
                        <div className="flex items-center gap-1.5 text-xs text-purple-400 font-mono mt-0.5">
                          /loja/{emp.slug}
                          <Link href={`/loja/${emp.slug}`} target="_blank" className="hover:underline">
                            <ExternalLink className="w-3 h-3 inline ml-0.5" />
                          </Link>
                        </div>
                      </td>

                      {/* Admin */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-500 shrink-0" />
                          <div>
                            <div className="font-medium text-slate-200">{admin?.nome || "Admin"}</div>
                            <div className="text-xs text-slate-400">{admin?.email || "N/A"}</div>
                          </div>
                        </div>
                      </td>

                      {/* Plano selector */}
                      <td className="p-4">
                        <select
                          value={emp.planoId}
                          onChange={(e) => handleAlterarPlano(emp.id, e.target.value)}
                          disabled={loadingId === `plano_${emp.id}`}
                          className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-semibold focus:outline-none focus:border-purple-500"
                        >
                          {planos.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nome} (R${p.precoMensal}/mês)
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Status badge */}
                      <td className="p-4">{getStatusBadge(emp.status)}</td>

                      {/* Vencimento / Trial */}
                      <td className="p-4 text-xs text-slate-300">
                        {emp.status === "trial" && emp.trialExpiraEm ? (
                          <div>
                            <span className="text-cyan-400 font-medium">Trial expira em:</span>
                            <br />
                            {new Date(emp.trialExpiraEm).toLocaleDateString("pt-BR")}
                          </div>
                        ) : emp.proximaCobranca ? (
                          <div>
                            <span className="text-slate-400">Próx. Cobrança:</span>
                            <br />
                            <span className="font-semibold text-slate-100">
                              {new Date(emp.proximaCobranca).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500">Sem cobrança gravada</span>
                        )}
                      </td>

                      {/* Recursos Count */}
                      <td className="p-4 text-center text-xs text-slate-400">
                        <div className="font-mono">
                          🖨️ {emp._count.printers} | 🧩 {emp._count.pecas} | 📦 {emp._count.pedidos}
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="p-4 text-right space-y-2">
                        {/* Botão Marcar como paga */}
                        <button
                          onClick={() => handleMarcarPaga(emp.id)}
                          disabled={isPagaLoading}
                          className="w-full px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                        >
                          {isPagaLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <DollarSign className="w-3.5 h-3.5" /> Marcar mensalidade paga
                            </>
                          )}
                        </button>

                        {/* Alterar Status */}
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-[10px] text-slate-500">Mudar status:</span>
                          <select
                            value={emp.status}
                            onChange={(e) => handleAlterarStatus(emp.id, e.target.value)}
                            disabled={loadingId === `status_${emp.id}`}
                            className="bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
                          >
                            <option value="ativo">Ativo</option>
                            <option value="trial">Trial</option>
                            <option value="inadimplente">Inadimplente</option>
                            <option value="trial_expirado">Trial Expirado</option>
                            <option value="bloqueado">Bloqueado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
