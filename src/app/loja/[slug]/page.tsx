import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CatalogoClientPage from "@/app/catalogo/catalogo-client";
import { Store, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const empresa = await prisma.empresa.findUnique({
    where: { slug: params.slug },
    select: { nome: true },
  });

  if (!empresa) {
    return { title: "Loja Não Encontrada — PrintForge 3D" };
  }

  return {
    title: `${empresa.nome} — Catálogo 3D`,
    description: `Confira os modelos e peças de impressão 3D disponíveis na loja ${empresa.nome}.`,
  };
}

export default async function LojaPage({ params }: { params: { slug: string } }) {
  let empresa: any = null;

  try {
    empresa = await prisma.empresa.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        nome: true,
        slug: true,
        status: true,
      },
    });
  } catch (err) {
    console.warn("Erro ao buscar loja:", err);
  }

  if (!empresa || empresa.status === "bloqueado" || empresa.status === "cancelado") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Loja Indisponível</h1>
        <p className="text-slate-400 text-sm max-w-md mb-8">
          A loja <span className="font-mono text-cyan-400">/loja/{params.slug}</span> não foi encontrada ou está temporariamente desativada.
        </p>
        <Link href="/">
          <button className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center gap-2 transition-all">
            <ArrowLeft className="w-4 h-4" /> Voltar para o Início
          </button>
        </Link>
      </div>
    );
  }

  let pecas: any[] = [];
  try {
    pecas = await prisma.peca.findMany({
      where: { empresaId: empresa.id, publicada: true },
      select: {
        id: true,
        nome: true,
        descricao: true,
        categoria: true,
        fotoUrl: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.warn("Erro ao carregar catálogo da loja:", err);
  }

  return <CatalogoClientPage pecas={pecas} empresa={empresa} />;
}
