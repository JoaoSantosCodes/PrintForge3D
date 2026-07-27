import { Sidebar } from "@/components/admin/sidebar";
import { getCurrentProfile } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { Clock, AlertTriangle, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile || (profile.role !== "admin" && profile.role !== "super_admin") || profile.status !== "aprovado") {
    redirect("/login");
  }

  const empresa = profile.empresa;

  // Check company status for block logic
  if (empresa) {
    const isTrialExpirado = empresa.status === "trial_expirado";
    const isBloqueado = empresa.status === "bloqueado" || empresa.status === "cancelado";

    let isInadimplenteBloqueado = false;
    if (empresa.status === "inadimplente" && empresa.proximaCobranca) {
      const now = new Date().getTime();
      const cobrancaTime = new Date(empresa.proximaCobranca).getTime();
      const diffDays = (now - cobrancaTime) / (1000 * 60 * 60 * 24);
      if (diffDays > 7) {
        isInadimplenteBloqueado = true;
      }
    }

    if (isTrialExpirado || isBloqueado || isInadimplenteBloqueado) {
      // Allow access to /admin/bloqueado and /admin/assinatura only
      // Server Component cannot check current pathname easily without headers,
      // so if blocked, redirect logic is handled on render or dedicated page check.
    }
  }

  // Calculate trial days remaining for alert banner
  let trialDaysLeft = 0;
  if (empresa && empresa.status === "trial" && empresa.trialExpiraEm) {
    const exp = new Date(empresa.trialExpiraEm).getTime();
    const now = new Date().getTime();
    trialDaysLeft = Math.max(0, Math.ceil((exp - now) / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Trial Alert Banner */}
        {empresa && empresa.status === "trial" && (
          <div className="bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shrink-0 font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-xs sm:text-sm">
                <span className="font-bold text-slate-900 dark:text-white">
                  Período de Testes Trial em Andamento:
                </span>{" "}
                <span className="text-slate-600 dark:text-slate-300">
                  Restam <strong className="text-cyan-400 font-black">{trialDaysLeft} dias</strong> de uso ilimitado.
                </span>
              </div>
            </div>

            <Link href="/admin/assinatura">
              <button className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs transition-all shadow-md shrink-0 flex items-center gap-1">
                Ver Planos <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        )}

        {/* Inadimplente Warning Banner */}
        {empresa && empresa.status === "inadimplente" && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0 font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-xs sm:text-sm">
                <span className="font-bold text-slate-900 dark:text-white">
                  Mensalidade Vencida:
                </span>{" "}
                <span className="text-slate-600 dark:text-slate-300">
                  Regularize sua assinatura para evitar o bloqueio automático do painel.
                </span>
              </div>
            </div>

            <Link href="/admin/assinatura">
              <button className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all shadow-md shrink-0">
                Regularizar Assinatura
              </button>
            </Link>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
