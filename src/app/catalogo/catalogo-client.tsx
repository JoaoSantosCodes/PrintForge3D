"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Box, Sparkles, Filter, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export default function CatalogoClientPage({ pecas }: { pecas: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string>("todas");
  const [sortBy, setSortBy] = useState<"recente" | "nome" | "categoria">("recente");

  const categoriasDisponiveis = useMemo(() => {
    const set = new Set<string>();
    pecas.forEach((p) => {
      if (p.categoria) set.add(p.categoria);
    });
    return Array.from(set);
  }, [pecas]);

  const filteredPecas = useMemo(() => {
    const list = pecas.filter((peca) => {
      const matchSearch =
        peca.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (peca.descricao && peca.descricao.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategoria =
        selectedCategoria === "todas" || peca.categoria === selectedCategoria;

      return matchSearch && matchCategoria;
    });

    return [...list].sort((a, b) => {
      if (sortBy === "nome") {
        return a.nome.localeCompare(b.nome);
      }
      if (sortBy === "categoria") {
        return (a.categoria || "").localeCompare(b.categoria || "");
      }
      // "recente" default
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [pecas, searchTerm, selectedCategoria, sortBy]);

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <Badge variant="info" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" /> Vitrine de Impressões 3D
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight leading-tight">
            Galeria de Peças <span className="text-teal-400">&</span> Colecionáveis
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
            Explore nossos modelos 3D produzidos em alta resolução com filamentos e resinas de máxima qualidade.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou descrição..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-semibold focus:outline-none focus:border-teal-500 cursor-pointer"
          >
            <option value="recente">Ordenar: Mais Recentes</option>
            <option value="nome">Ordenar: Nome (A-Z)</option>
            <option value="categoria">Ordenar: Categoria</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategoria("todas")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategoria === "todas"
                ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20"
                : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            Todas ({pecas.length})
          </button>
          {categoriasDisponiveis.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoria(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategoria === cat
                  ? "bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Public Cards */}
      {filteredPecas.length === 0 ? (
        <EmptyState
          icon={Box}
          title="Nenhuma peça encontrada"
          description={
            searchTerm || selectedCategoria !== "todas"
              ? "Tente alterar a busca ou selecionar outra categoria no catálogo."
              : "Nenhuma peça foi publicada no catálogo público ainda."
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPecas.map((peca) => (
            <Link
              key={peca.id}
              href={`/catalogo/${peca.id}`}
              className="group block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-teal-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-teal-500/10 flex flex-col justify-between"
            >
              <div>
                {/* Photo container */}
                <div className="relative h-56 bg-slate-950 overflow-hidden flex items-center justify-center">
                  {peca.fotoUrl ? (
                    <img
                      src={peca.fotoUrl}
                      alt={peca.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Box className="w-12 h-12 text-slate-700 mx-auto mb-2" />
                      <span className="text-xs text-slate-500">Impressão 3D</span>
                    </div>
                  )}

                  {peca.categoria && (
                    <span className="absolute top-3 left-3 bg-slate-950/80 border border-slate-800 text-slate-300 text-[10px] font-semibold px-2.5 py-1 rounded-md backdrop-blur-md">
                      {peca.categoria}
                    </span>
                  )}
                </div>

                {/* Info Content */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-slate-100 group-hover:text-teal-400 transition-colors line-clamp-1">
                    {peca.nome}
                  </h3>
                  {peca.descricao ? (
                    <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                      {peca.descricao}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-600 italic mt-2">
                      Sem descrição detalhada.
                    </p>
                  )}
                </div>
              </div>

              {/* Action link footer */}
              <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs font-semibold text-teal-400 group-hover:text-teal-300">
                <span>Ver detalhes da peça</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
