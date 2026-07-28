import { getCurrentProfile } from "@/lib/auth-server";
import { getRewardsDashboardData } from "@/modules/referrals/services/rewardsService";
import RewardsClientPage from "./rewards-client";

export const dynamic = "force-dynamic";

export default async function AdminRewardsPage() {
  let rewardsData: any = null;

  try {
    const profile = await getCurrentProfile();
    if (profile) {
      rewardsData = await getRewardsDashboardData(profile.id);
    }
  } catch (err) {
    console.warn("Aviso ao carregar PrintForge Rewards:", err);
  }

  if (!rewardsData) {
    rewardsData = {
      saldoPontos: 0,
      nivelAtual: { nome: "Bronze", slug: "bronze", pontosMinimos: 0, icone: "🥉", cor: "amber", beneficio: "Acesso ao catálogo base", badge: "Iniciante Maker" },
      proximoNivel: { nome: "Prata", slug: "prata", pontosMinimos: 500, icone: "🥈", cor: "slate", beneficio: "Desconto de 5%", badge: "Maker Prata" },
      pontosFaltantes: 500,
      progressoPercentual: 0,
      catalogo: [],
      transacoes: [],
      resgates: [],
      missoes: [],
      conquistas: [],
      niveis: [],
    };
  }

  return <RewardsClientPage data={rewardsData} />;
}
