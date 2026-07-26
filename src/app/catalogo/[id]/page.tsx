import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
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

  let userProfile: { nome: string | null; email: string } | null = null;
  let isLoggedIn = false;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (user) {
      const profile = await prisma.profile.findFirst({
        where: {
          OR: [
            { id: user.id },
            { email: user.email ? user.email.toLowerCase() : "" },
          ],
        },
      });

      if (profile && profile.status === "aprovado") {
        isLoggedIn = true;
        userProfile = {
          nome: profile.nome,
          email: profile.email,
        };
      }
    }
  } catch {}

  return (
    <CatalogoDetalheClient
      peca={peca}
      isLoggedIn={isLoggedIn}
      userProfile={userProfile}
    />
  );
}
