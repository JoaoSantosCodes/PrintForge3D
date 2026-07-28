"use server";

import { getCurrentProfile } from "@/lib/auth-server";
import { getRewardsDashboardData, resgatarItemRecompensa } from "@/modules/referrals/services/rewardsService";
import { revalidatePath } from "next/cache";

export async function getRewardsDashboardAction() {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return { error: "Usuário não autenticado." };
    }

    const rewardsData = await getRewardsDashboardData(profile.id);
    return { success: true, rewardsData };
  } catch (err: any) {
    return { error: err?.message || "Erro ao carregar dados do PrintForge Rewards." };
  }
}

export async function resgatarRecompensaAction(rewardId: string) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return { error: "Usuário não autenticado." };
    }

    const res = await resgatarItemRecompensa(profile.id, rewardId);

    if (res.success) {
      revalidatePath("/admin/rewards");
    }

    return res;
  } catch (err: any) {
    return { error: err?.message || "Erro ao efetuar o resgate da recompensa." };
  }
}
