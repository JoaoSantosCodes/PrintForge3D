"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Printer,
  Boxes,
  Box,
  Globe,
  LogOut,
  Sparkles,
  Palette,
  ShoppingBag,
  BarChart3,
  Users,
  User,
  FileText,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { getLowStockCountAction } from "@/app/actions/filaments";
import { getPendingUsersCountAction } from "@/app/actions/usuarios";

export function Sidebar() {
  const pathname = usePathname();
  const [lowStockCount, setLowStockCount] = useState(0);
  const [pendingUsersCount, setPendingUsersCount] = useState(0);

  useEffect(() => {
    getLowStockCountAction().then((res) => {
      if (res?.lowStockCount) {
        setLowStockCount(res.lowStockCount);
      } else {
        setLowStockCount(0);
      }
    });

    getPendingUsersCountAction().then((res) => {
      if (res?.count) {
        setPendingUsersCount(res.count);
      } else {
        setPendingUsersCount(0);
      }
    });
  }, [pathname]);

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Pedidos", href: "/admin/pedidos", icon: ShoppingBag },
    { label: "Impressoras", href: "/admin/impressoras", icon: Printer },
    { label: "Filamentos", href: "/admin/filamentos", icon: Boxes, badge: lowStockCount > 0 ? `🔴 ${lowStockCount}` : null },
    { label: "Tintas & Pintura", href: "/admin/tintas", icon: Palette },
    { label: "Peças & Custos", href: "/admin/pecas", icon: Box },
    { label: "Relatórios", href: "/admin/relatorios", icon: BarChart3 },
    { label: "Usuários", href: "/admin/usuarios", icon: Users, badge: pendingUsersCount > 0 ? `🔴 ${pendingUsersCount}` : null },
    { label: "Auditoria", href: "/admin/auditoria", icon: FileText },
    { label: "Meu Perfil", href: "/perfil", icon: User },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between min-h-screen sticky top-0">
      <div>
        {/* Brand */}
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20 text-slate-950 font-black text-lg">
            3D
          </div>
          <div>
            <h1 className="font-bold text-slate-100 tracking-tight text-base leading-tight">
              PrintForge <span className="text-teal-400">3D</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Gestão & Custos</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <div className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Menu Administrativo
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-teal-500/10 text-teal-300 border border-teal-500/20 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-teal-400" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Actions */}
      <div className="p-4 border-t border-slate-800/80 space-y-2">
        <Link
          href="/catalogo"
          target="_blank"
          className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all"
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          Ver Catálogo Público
        </Link>

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-2 w-full px-3.5 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair da Conta
          </button>
        </form>
      </div>
    </aside>
  );
}
