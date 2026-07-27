import Link from "next/link";
import { Box, Lock, ShoppingBag, LogOut, User, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";

export async function PublicNavbar() {
  let user = null;
  let profile = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;

    if (user) {
      profile = await prisma.profile.findFirst({
        where: {
          OR: [
            { id: user.id },
            { email: user.email ? user.email.toLowerCase() : "" },
          ],
        },
      });
    }
  } catch {}

  const isLoggedIn = !!user && profile?.status === "aprovado";
  const isAdmin = profile?.role === "admin";

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        <Link href="/catalogo" className="flex items-center gap-3 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20 text-slate-950 font-black text-lg group-hover:scale-105 transition-transform">
            3D
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 dark:text-slate-100 tracking-tight">
              PrintForge <span className="text-teal-500 dark:text-teal-400">3D</span>
            </span>
            <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold hidden sm:block">
              Catálogo de Peças 3D
            </span>
          </div>
        </Link>

        {/* Navigation Menu */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-1">
          <Link
            href="/catalogo"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors shrink-0"
          >
            Catálogo
          </Link>

          {isLoggedIn && (
            <>
              <Link
                href="/pedidos"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors flex items-center gap-1.5 shrink-0"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
                <span className="hidden sm:inline">Meus </span>Pedidos
              </Link>

              <Link
                href="/perfil"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors flex items-center gap-1.5 shrink-0"
              >
                <User className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
                Perfil
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 transition-all shrink-0"
            >
              <Shield className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
              Admin
            </Link>
          )}

          <ThemeToggle />

          {isLoggedIn ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 shrink-0">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden md:inline-block">
                Olá, <strong className="text-slate-800 dark:text-slate-200">{profile?.nome || profile?.email?.split("@")[0]}</strong>
              </span>

              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 shrink-0">
              <Link
                href="/login"
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 transition-all shadow-md shadow-teal-400/10"
              >
                Cadastrar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
