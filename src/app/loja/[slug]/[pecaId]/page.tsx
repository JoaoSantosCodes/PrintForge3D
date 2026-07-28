import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PecaLojaClient from "./peca-loja-client";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PecaLojaPage({
  params,
}: {
  params: { slug: string; pecaId: string };
}) {
  const empresa = await prisma.empresa.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      nome: true,
      slug: true,
      status: true,
      configuracao: {
        select: {
          chavePix: true,
        },
      },
    },
  });

  if (!empresa || empresa.status === "bloqueado" || empresa.status === "cancelado") {
    notFound();
  }

  const peca = await prisma.peca.findFirst({
    where: {
      id: params.pecaId,
      empresaId: empresa.id,
      publicada: true,
    },
    include: {
      custoImpressao: true,
      custoPintura: true,
      custoEmbalagem: true,
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
    // Guest
  }

  return (
    <PecaLojaClient
      empresa={empresa}
      peca={peca}
      avaliacoes={formattedAvaliacoes}
      userProfile={userProfile}
    />
  );
}
