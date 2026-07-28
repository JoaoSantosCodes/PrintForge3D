import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CatalogoDetalheClient } from "./catalogo-detalhe-client";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PecaDetalhePage({ params }: { params: { id: string } }) {
  const peca = await prisma.peca.findFirst({
    where: {
      id: params.id,
      publicada: true,
    },
    include: {
      custoImpressao: true,
      custoPintura: true,
      custoEmbalagem: true,
      empresa: {
        select: {
          nome: true,
          slug: true,
        },
      },
    },
  });

  if (!peca) {
    notFound();
  }

  const formattedAvaliacoes: any[] = [];
  let userProfile: { nome: string | null; email: string } | null = null;

  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      const p = await prisma.profile.findUnique({
        where: { id: authData.user.id },
        select: { nome: true, email: true },
      });
      if (p) {
        userProfile = { nome: p.nome, email: p.email };
      }
    }
  } catch {
    // Guest view
  }

  return (
    <CatalogoDetalheClient
      peca={peca}
      isLoggedIn={!!userProfile}
      avaliacoes={formattedAvaliacoes}
      userProfile={userProfile}
    />
  );
}
