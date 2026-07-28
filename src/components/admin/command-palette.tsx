"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Printer,
  Package,
  DollarSign,
  Layers,
  Sparkles,
  Command,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface CommandItem {
  id: string;
  title: string;
  category: "Ações Rápidas" | "Navegação" | "Impressoras" | "IA & Ferramentas";
  shortcut?: string;
  icon: React.ElementType;
  action: () => void;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const commands: CommandItem[] = [
    {
      id: "c1",
      title: "Cadastrar Nova Peça no Catálogo",
      category: "Ações Rápidas",
      shortcut: "N",
      icon: Plus,
      action: () => {
        router.push("/admin/pecas/nova");
        setOpen(false);
      },
    },
    {
      id: "c2",
      title: "Abrir Modo Operador (Touch-First)",
      category: "Ações Rápidas",
      shortcut: "O",
      icon: Printer,
      action: () => {
        router.push("/admin/operador");
        setOpen(false);
      },
    },
    {
      id: "c3",
      title: "Ir para Gestão de Pedidos (Kanban)",
      category: "Navegação",
      icon: Layers,
      action: () => {
        router.push("/admin/pedidos");
        setOpen(false);
      },
    },
    {
      id: "c4",
      title: "Ir para DRE & Financeiro",
      category: "Navegação",
      icon: DollarSign,
      action: () => {
        router.push("/admin/financeiro");
        setOpen(false);
      },
    },
    {
      id: "c5",
      title: "Ir para Estoque de Insumos & Filamentos",
      category: "Navegação",
      icon: Package,
      action: () => {
        router.push("/admin/filamentos");
        setOpen(false);
      },
    },
    {
      id: "c6",
      title: "Analisar STL com Inteligência Artificial",
      category: "IA & Ferramentas",
      shortcut: "AI",
      icon: Sparkles,
      action: () => {
        router.push("/admin/pecas/nova");
        setOpen(false);
      },
    },
  ];

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(search.toLowerCase()) ||
      cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-start justify-center pt-24 px-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col space-y-0">
        {/* Search Header */}
        <div className="flex items-center px-4 py-4 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            placeholder="Digite um comando ou busque (ex: Nova Peça, Operador, DRE)..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <Badge variant="outline" className="bg-slate-950 text-slate-400 border-slate-800 text-[10px] uppercase">
            ESC para fechar
          </Badge>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-3 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Nenhum comando encontrado para "{search}".
            </div>
          ) : (
            filteredCommands.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-cyan-500/10 hover:border-cyan-500/30 border border-transparent text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/40">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-white group-hover:text-cyan-300">
                        {cmd.title}
                      </span>
                      <span className="text-[11px] text-slate-400 block">{cmd.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {cmd.shortcut && (
                      <span className="text-[10px] font-mono font-bold bg-slate-950 px-2 py-0.5 rounded-md text-slate-400 border border-slate-800">
                        {cmd.shortcut}
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Command className="w-3.5 h-3.5 text-cyan-400" /> PrintForge Command Palette 2.0
          </span>
          <span>Pressione <strong className="text-slate-300">Ctrl + K</strong> a qualquer momento</span>
        </div>
      </div>
    </div>
  );
}
