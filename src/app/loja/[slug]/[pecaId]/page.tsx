import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/auth-server";
import { notFound } from "next/navigation";
import { CatalogoDetalheClient } from "@/app/catalogo/[id]/catalogo-detalhe-client";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string; pecaId: string } }) {
  const peca = await prisma.peca.findFirst({
    where: { id: params.pecaId, publicada: true },
    select: { nome: true, descricao: true, fotoUrl: true, empresa: { select: { nome: true } } },
  });

  if (!peca) {
    return { title: "Peça Não Encontrada — PrintForge 3D" };
  }

  return {
    title: `${peca.nome} — ${peca.empresa?.nome || "Loja 3D"}`,
    description: peca.descricao || `Confira os detalhes de ${peca.nome}.`,
    openGraph: {
      title: `${peca.nome} — ${peca.empresa?.nome || "Loja 3D"}`,
      description: peca.descricao || `Confira os detalhes de ${peca.nome}.`,
      images: peca.fotoUrl ? [{ url: peca.fotoUrl }] : [],
    },
  };
}

export default async function LojaPecaDetalhePage({ params }: { params: { slug: string; pecaId: string } }) {
  const empresa = await prisma.empresa.findUnique({
    where: { slug: params.slug },
    select: { id: true, nome: true, slug: true, status: true },
  });

  if (!empresa || empresa.status === "bloqueado" || empresa.status === "cancelado") {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Loja Indisponível</h1>
        <p className="text-slate-400 text-sm max-w-md mb-8">
          Esta peça pertence a uma loja que não está disponível no momento.
        </p>
        <Link href="/">
          <button className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center gap-2 transition-all">
            <ArrowLeft className="w-4 h-4" /> Voltar para o Início
          </button>
        </Link>
      </div>
    );
  }

  const peca = await prisma.peca.findFirst({
    where: {
      id: params.pecaId,
      empresaId: empresa.id,
      publicada: true,
    },
    select: {
      id: true,
      nome: true,
      descricao: true,
      categoria: true,
      fotoUrl: true,
      status: true,
      createdAt: true,
    },
  });

  if (!peca) {
    notFound();
  }

  const avaliacoes = await prisma.avaliacao.findMany({
    where: {
      pedido: {
        pecaId: peca.id,
      },
    },
    select: {
      id: true,
      nota: true,
      comentario: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const formattedAvaliacoes = avaliacoes.map((a) => ({
    id: a.id,
    nota: a.nota,
    comentario: a.comentario,
    createdAt: a.createdAt.toISOString(),
  }));

  let userProfile: { nome: string | null; email: string } | null = null;
  let isLoggedIn = false;

  try {
    const profile = await getCurrentProfile();
    if (profile && profile.status === "aprovado") {
      isLoggedIn = true;
      userProfile = {
        nome: profile.nome,
        email: profile.email,
      };
    }
  } catch {}

  return (
    <CatalogoDetalheClient
      peca={peca}
      isLoggedIn={isLoggedIn}
      userProfile={userProfile}
      avaliacoes={formattedAvaliacoes}
      empresaSlug={empresa.slug}
      empresaNome={empresa.nome}
    />
  );
}
