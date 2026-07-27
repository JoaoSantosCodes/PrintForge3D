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
  Palette,
  ShoppingBag,
  BarChart3,
  Users,
  User,
  FileText,
  Ticket,
  CreditCard,
  Settings,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { getLowStockCountAction } from "@/app/actions/filaments";
import { getPendingUsersCountAction } from "@/app/actions/usuarios";
import { ThemeToggle } from "@/components/theme-toggle";

export function Sidebar() {
  const pathname = usePathname();
  const [lowStockCount, setLowStockCount] = useState(0);
  const [pendingUsersCount, setPendingUsersCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

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

    // Restore desktop collapsed state preference from localStorage
    try {
      const stored = localStorage.getItem("admin_sidebar_collapsed");
      if (stored === "true") {
        setCollapsed(true);
      }
    } catch {}
  }, [pathname]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("admin_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  const navGroups = [
    {
      title: "OPERAÇÃO",
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "Pedidos", href: "/admin/pedidos", icon: ShoppingBag },
        { label: "Relatórios", href: "/admin/relatorios", icon: BarChart3 },
        { label: "Cupons", href: "/admin/cupons", icon: Ticket },
      ],
    },
    {
      title: "PRODUÇÃO & CUSTOS",
      items: [
        { label: "Impressoras", href: "/admin/impressoras", icon: Printer },
        { label: "Filamentos", href: "/admin/filamentos", icon: Boxes, badge: lowStockCount > 0 ? `🔴 ${lowStockCount}` : null },
        { label: "Tintas & Pintura", href: "/admin/tintas", icon: Palette },
        { label: "Peças & Custos", href: "/admin/pecas", icon: Box },
      ],
    },
    {
      title: "GESTÃO & SISTEMA",
      items: [
        { label: "Meu Plano / Assinatura", href: "/admin/assinatura", icon: CreditCard },
        { label: "Usuários", href: "/admin/usuarios", icon: Users, badge: pendingUsersCount > 0 ? `🔴 ${pendingUsersCount}` : null },
        { label: "Auditoria", href: "/admin/auditoria", icon: FileText },
        { label: "Configurações", href: "/admin/configuracoes", icon: Settings },
        { label: "Meu Perfil", href: "/admin/perfil", icon: User },
      ],
    },
  ];

  const renderSidebarContent = (isMobile = false) => {
    const isCollapsed = !isMobile && collapsed;

    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors">
        {/* Brand & Desktop Collapse Toggle */}
        <div className={`p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center shrink-0 ${isCollapsed ? "justify-center flex-col gap-3" : "justify-between"}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20 text-slate-950 font-black text-lg shrink-0">
              3D
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-slate-900 dark:text-slate-100 tracking-tight text-base leading-tight">
                  PrintForge <span className="text-teal-500 dark:text-teal-400">3D</span>
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Gestão & Custos</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {!isCollapsed && <ThemeToggle />}
            {!isMobile && (
              <button
                type="button"
                onClick={toggleCollapsed}
                className="hidden md:flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-xs transition-all"
                title={isCollapsed ? "Expandir Sidebar" : "Colapsar Sidebar"}
                aria-label={isCollapsed ? "Expandir Sidebar" : "Colapsar Sidebar"}
              >
                {isCollapsed ? <PanelLeftOpen className="w-4 h-4 text-teal-500" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Sectioned Navigation - flex-1 min-h-0 guarantees smooth internal scrolling */}
        <nav className="flex-1 overflow-y-auto min-h-0 p-3 space-y-4 scrollbar-thin">
          {navGroups.map((group, idx) => (
            <div key={group.title} className="space-y-1">
              {!isCollapsed ? (
                <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center justify-between">
                  <span>{group.title}</span>
                </div>
              ) : (
                idx > 0 && <div className="border-t border-slate-200 dark:border-slate-800/80 my-2" />
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={`flex items-center ${isCollapsed ? "justify-center p-2.5" : "justify-between px-3.5 py-2"} rounded-xl text-xs font-semibold transition-all relative ${
                      isActive
                        ? "bg-teal-500/10 text-teal-600 dark:text-teal-300 border border-teal-500/20 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-teal-500 dark:text-teal-400" : "text-slate-400 dark:text-slate-500"}`} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>
                    {item.badge && (
                      isCollapsed ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-1.5 right-1.5 border border-white dark:border-slate-900" />
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30">
                          {item.badge}
                        </span>
                      )
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer / Fixed Actions */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2 shrink-0">
          {isCollapsed && (
            <div className="flex justify-center pb-1">
              <ThemeToggle />
            </div>
          )}

          <Link
            href="/catalogo"
            target="_blank"
            title="Ver Catálogo Público"
            className={`flex items-center ${isCollapsed ? "justify-center p-2.5" : "justify-center gap-2 px-3 py-2"} text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/60 rounded-xl transition-all`}
          >
            <Globe className="w-4 h-4 text-cyan-500 dark:text-cyan-400 shrink-0" />
            {!isCollapsed && <span>Ver Catálogo Público</span>}
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              title="Sair da Conta"
              className={`flex items-center ${isCollapsed ? "justify-center p-2.5 w-full" : "gap-2 w-full px-3.5 py-2"} text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all`}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Sair da Conta</span>}
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Top Navigation Header (< 768px) */}
      <div className="md:hidden sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
          aria-label="Abrir Menu Administrativo"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-black text-xs">
            3D
          </div>
          <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
            PrintForge <span className="text-teal-500 dark:text-teal-400">3D</span>
          </span>
        </div>

        <ThemeToggle />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex-1 w-full max-w-xs bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 z-10"
            >
              <X className="w-5 h-5" />
            </button>
            {renderSidebarContent(true)}
          </div>
        </div>
      )}

      {/* Desktop Sticky Sidebar (>= 768px) with Expand/Collapse Transition */}
      <aside className={`hidden md:flex ${collapsed ? "w-20" : "w-64"} h-screen sticky top-0 shrink-0 z-30 transition-all duration-200`}>
        {renderSidebarContent(false)}
      </aside>
    </>
  );
}
