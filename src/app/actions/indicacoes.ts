"use server";

import { getCurrentProfile } from "@/lib/auth-server";
import { getVendedorRewardsData } from "@/modules/referrals/services/rewardsService";

export async function getPerfilIndicacoesAction() {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !profile.empresaId) {
      return { error: "Usuário não autenticado." };
    }

    const rewardsData = await getVendedorRewardsData(profile.empresaId);

    return {
      success: true,
      profileId: profile.id,
      rewardsData,
    };
  } catch (err: any) {
    return { error: err?.message || "Erro ao carregar dados de indicação." };
  }
}
