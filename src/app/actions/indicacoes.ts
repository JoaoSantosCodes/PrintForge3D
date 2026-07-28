"use server";

import { getCurrentProfile } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { getAffiliateCenterData } from "@/modules/referrals/services/affiliateService";
import { revalidatePath } from "next/cache";

export async function getPerfilIndicacoesAction() {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return { error: "Usuário não autenticado." };
    }

    const affiliateData = await getAffiliateCenterData(profile.id);

    return {
      success: true,
      profileId: profile.id,
      affiliateData,
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
