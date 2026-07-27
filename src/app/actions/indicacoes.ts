"use server";

import { getCurrentProfile } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { garantirCodigoIndicacao } from "@/lib/indicacoes";
import { revalidatePath } from "next/cache";

export async function getPerfilIndicacoesAction() {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return { error: "Usuário não autenticado." };
    }

    const codigoIndicacao = await garantirCodigoIndicacao(profile.id);

    const [indicadosEsquerda, indicadosDireita, registros] = await Promise.all([
      prisma.profile.findMany({
        where: { indicadorId: profile.id, pernaIndicacao: "esquerda" },
        select: {
          id: true,
          nome: true,
          email: true,
          status: true,
          role: true,
          createdAt: true,
          empresa: { select: { nome: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.profile.findMany({
        where: { indicadorId: profile.id, pernaIndicacao: "direita" },
        select: {
          id: true,
          nome: true,
          email: true,
          status: true,
          role: true,
          createdAt: true,
          empresa: { select: { nome: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.indicacaoRegistro.aggregate({
        where: { indicadorId: profile.id },
        _sum: { pontos: true },
      }),
    ]);

    const totalPontos = registros._sum.pontos || 0;

    return {
      success: true,
      profileId: profile.id,
      codigoIndicacao,
      posicaoPreferencial: profile.posicaoPreferencial || "auto",
      indicadosEsquerda,
      indicadosDireita,
      totalPontos,
    };
  } catch (err: any) {
    return { error: err?.message || "Erro ao carregar dados de indicação." };
  }
}

export async function salvarPosicaoPreferencialAction(posicao: "auto" | "esquerda" | "direita") {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return { error: "Usuário não autenticado." };
    }

    if (!["auto", "esquerda", "direita"].includes(posicao)) {
      return { error: "Posição inválida." };
    }

    await prisma.profile.update({
      where: { id: profile.id },
      data: { posicaoPreferencial: posicao },
    });

    revalidatePath("/admin/indicacoes");
    return { success: true, message: `Preferência de perna alterada para: ${posicao.toUpperCase()}` };
  } catch (err: any) {
    return { error: err?.message || "Erro ao salvar preferência de perna." };
  }
}
