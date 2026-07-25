import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Box, Sparkles, Tag, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function CatalogoDetalhePage({ params }: { params: { id: string } }) {
  const peca = await prisma.peca.findFirst({
    where: {
      id: params.id,
      publicada: true, // MUST ONLY DISPLAY PUBLIC PIECES
    },
    select: {
      id: true,
      nome: true,
      descricao: true,
      categoria: true,
      fotoUrl: true,
      status: true,
      createdAt: true,
      // CRITICAL SECURITY RULE: Absolutely NO cost, printer, filament or price fields fetched!
    },
  });

  if (!peca) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Navigation */}
      <div>
        <Link href="/catalogo">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Catálogo
          </Button>
        </Link>
      </div>

      {/* Main Detail Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2">
        {/* Left: Large Photo */}
        <div className="relative min-h-[350px] sm:min-h-[450px] bg-slate-950 flex items-center justify-center p-4 border-b md:border-b-0 md:border-r border-slate-800">
          {peca.fotoUrl ? (
            <img
              src={peca.fotoUrl}
              alt={peca.nome}
              className="w-full h-full object-contain max-h-[550px] rounded-2xl"
            />
          ) : (
            <div className="text-center p-8">
              <Box className="w-20 h-20 text-slate-700 mx-auto mb-4" />
              <span className="text-sm text-slate-500 font-medium">Foto não disponível</span>
            </div>
          )}
        </div>

        {/* Right: Content details */}
        <div className="p-8 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {peca.categoria && <Badge variant="info">{peca.categoria}</Badge>}
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Modelo Verificado 3D
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
              {peca.nome}
            </h1>

            <div className="pt-4 border-t border-slate-800/80">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Descrição do Modelo:
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {peca.descricao || "Esta peça não possui descrição adicional detalhada."}
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-teal-400 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-slate-200">Alta Qualidade de Impressão 3D</p>
                <p className="text-slate-400 mt-0.5">
                  Produzido com materiais de alto desempenho e acabamento detalhado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
