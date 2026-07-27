import { getCurrentProfile } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, LayoutDashboard, Building2, Layers, LogOut, ArrowLeft } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "super_admin") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Top Header Navigation */}
      <header className="border-b border-purple-900/30 bg-slate-900/60 backdrop-blur-xl px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/superadmin" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-black group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-white">
                PrintForge <span className="text-purple-400">SaaS</span>
              </span>
              <span className="ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Super Admin
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex items-center gap-2 sm:gap-6 text-sm font-semibold">
          <Link
            href="/superadmin"
            className="flex items-center gap-2 text-slate-300 hover:text-purple-400 px-3 py-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-purple-400" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/superadmin/empresas"
            className="flex items-center gap-2 text-slate-300 hover:text-purple-400 px-3 py-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Empresas</span>
          </Link>

          <Link
            href="/superadmin/planos"
            className="flex items-center gap-2 text-slate-300 hover:text-purple-400 px-3 py-1.5 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Planos</span>
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </form>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        PrintForge 3D SaaS Super-Admin Control Panel © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
