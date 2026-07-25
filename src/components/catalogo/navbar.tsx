import Link from "next/link";
import { Box, Lock } from "lucide-react";

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/catalogo" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/20 text-slate-950 font-black text-lg group-hover:scale-105 transition-transform">
            3D
          </div>
          <div>
            <span className="font-bold text-lg text-slate-100 tracking-tight">
              PrintForge <span className="text-teal-400">3D</span>
            </span>
            <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              Catálogo de Peças 3D
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
          >
            <Lock className="w-3.5 h-3.5 text-teal-400" />
            Área do Administrador
          </Link>
        </div>
      </div>
    </header>
  );
}
