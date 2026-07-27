"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  FileText,
  UserCheck,
  UserX,
  RefreshCw,
  Search,
  Calendar,
  Shield,
  Clock,
  User,
  Filter,
} from "lucide-react";

interface AuditItem {
  id: string;
  adminId: string;
  acao: string;
  alvoId: string | null;
  detalhes: string | null;
  createdAt: string;
  adminNome: string;
  adminEmail: string;
  alvoNome: string | null;
  alvoEmail: string | null;
}

const ACAO_CONFIG: Record<
  string,
  { label: string; badgeVariant: any; icon: any }
> = {
  aprovou_usuario: {
    label: "Aprovou Usuário",
    badgeVariant: "success",
    icon: UserCheck,
  },
  bloqueou_usuario: {
    label: "Bloqueou Usuário",
    badgeVariant: "danger",
    icon: UserX,
  },
  reativou_usuario: {
    label: "Reativou Usuário",
    badgeVariant: "info",
    icon: RefreshCw,
  },
};

export function AuditoriaClient({ logs }: { logs: AuditItem[] }) {
  const [filterAcao, setFilterAcao] = useState<string>("todas");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredLogs = logs.filter((log) => {
    const matchesAcao = filterAcao === "todas" || log.acao === filterAcao;
    const matchesSearch =
      log.adminNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.alvoNome || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.alvoEmail || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.detalhes || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAcao && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-teal-500 dark:text-teal-400" /> Log de Auditoria
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Histórico completo de ações administrativas sensíveis realizadas na plataforma.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm transition-colors">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por admin, usuário afetado ou detalhes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "todas", label: "Todas Ações" },
            { id: "aprovou_usuario", label: "Aprovações ✅" },
            { id: "bloqueou_usuario", label: "Bloqueios 🚫" },
            { id: "reativou_usuario", label: "Reativações 🔄" },
          ].map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setFilterAcao(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                filterAcao === tab.id
                  ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20"
                  : "bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table / List */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhum log de auditoria encontrado"
          description="Nenhuma ação administrativa foi registrada com os filtros aplicados."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Data / Hora</th>
                  <th className="px-6 py-4">Administrador</th>
                  <th className="px-6 py-4">Ação Realizada</th>
                  <th className="px-6 py-4">Usuário Afetado</th>
                  <th className="px-6 py-4">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {filteredLogs.map((log) => {
                  const acaoConf = ACAO_CONFIG[log.acao] || {
                    label: log.acao,
                    badgeVariant: "secondary",
                    icon: Shield,
                  };
                  const AcaoIcon = acaoConf.icon;

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {new Date(log.createdAt).toLocaleString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-teal-500 dark:text-teal-400 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-200 text-xs">{log.adminNome}</p>
                            <p className="text-[11px] text-slate-500 truncate">{log.adminEmail}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={acaoConf.badgeVariant} className="flex items-center gap-1 w-fit">
                          <AcaoIcon className="w-3 h-3" />
                          {acaoConf.label}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.alvoEmail ? (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400 shrink-0" />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-slate-200 text-xs">
                                {log.alvoNome || log.alvoEmail.split("@")[0]}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate">{log.alvoEmail}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">N/A</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {log.detalhes || "Sem detalhes adicionais."}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
