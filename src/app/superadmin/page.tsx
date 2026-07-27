import { prisma } from "@/lib/prisma";
import { Building2, CheckCircle2, Clock, AlertTriangle, XCircle, DollarSign, Layers, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SuperAdminDashboardPage() {
  let empresas: any[] = [];
  let planos: any[] = [];

  try {
    const res = await Promise.all([
      prisma.empresa.findMany({
        include: { plano: true },
      }),
      prisma.plano.findMany(),
    ]);
    empresas = res[0];
    planos = res[1];
  } catch (err) {
    console.warn("Erro ao buscar métricas de empresas:", err);
  }

  const totalEmpresas = empresas.length;
  const ativas = empresas.filter((e) => e.status === "ativo").length;
  const trial = empresas.filter((e) => e.status === "trial").length;
  const inadimplentes = empresas.filter((e) => e.status === "inadimplente" || e.status === "trial_expirado").length;
  const canceladas = empresas.filter((e) => e.status === "cancelado" || e.status === "bloqueado").length;

  // MRR: Soma do precoMensal de todas as empresas com status="ativo"
  const mrrEstimado = empresas
    .filter((e) => e.status === "ativo" && e.plano)
    .reduce((acc, e) => acc + (e.plano.precoMensal || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Visão Geral da Plataforma SaaS
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Métricas consolidadas de vendedores, assinaturas e receita recorrente (MRR).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/superadmin/empresas">
            <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2">
              Gerenciar Empresas ({totalEmpresas}) <ArrowUpRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Metric 1: Total Empresas */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total de Lojas
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">{totalEmpresas}</div>
          <p className="text-xs text-slate-400 mt-2 font-medium">Vendedores cadastrados</p>
        </div>

        {/* Metric 2: Ativas */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Ativas & Pagantes
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 tracking-tight">{ativas}</div>
          <p className="text-xs text-slate-400 mt-2 font-medium">Assinaturas regulares</p>
        </div>

        {/* Metric 3: Em Trial */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Em Período Trial
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-cyan-400 tracking-tight">{trial}</div>
          <p className="text-xs text-slate-400 mt-2 font-medium">Testando 14 dias grátis</p>
        </div>

        {/* Metric 4: Inadimplentes */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Inadimplentes
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400 tracking-tight">{inadimplentes}</div>
          <p className="text-xs text-slate-400 mt-2 font-medium">Aguardando renovação</p>
        </div>

        {/* Metric 5: MRR Estimado */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              MRR Estimado
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-400 tracking-tight">
            R$ {mrrEstimado.toFixed(2)}
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">Receita mensal das ativas</p>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/superadmin/empresas" className="block group">
          <div className="bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-6 transition-all shadow-md hover:shadow-purple-500/5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Building2 className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
              Gestão de Empresas & Cobrança Manual
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Visualize detalhes de cada loja, altere o status (ativar, bloquear, cancelar) e confirme pagamentos com o botão "Marcar mensalidade como paga".
            </p>
          </div>
        </Link>

        <Link href="/superadmin/planos" className="block group">
          <div className="bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 transition-all shadow-md hover:shadow-cyan-500/5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <Layers className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
              Gerenciar Planos & Limites ({planos.length})
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Crie e edite os planos de assinatura (Starter, Pro, Business), definindo preços e limites de impressoras, peças e pedidos mensais.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
