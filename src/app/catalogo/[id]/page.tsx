import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/auth-server";
import { notFound } from "next/navigation";
import { CatalogoDetalheClient } from "./catalogo-detalhe-client";

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
      // CRITICAL SECURITY RULE: Absolutely NO internal cost, printer or filament data fetched!
    },
  });

  if (!peca) {
    notFound();
  }

  // Fetch public reviews for this piece (Strictly NO sensitive user data)
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
    />
  );
}
