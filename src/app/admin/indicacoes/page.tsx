import { getCurrentProfile } from "@/lib/auth-server";
import { getAffiliateCenterData } from "@/modules/referrals/services/affiliateService";
import IndicacoesClientPage from "./indicacoes-client";

export const dynamic = "force-dynamic";

export default async function AdminIndicacoesPage() {
  let affiliateData: any = null;

  try {
    const profile = await getCurrentProfile();
    if (profile) {
      affiliateData = await getAffiliateCenterData(profile.id);
    }
  } catch (err) {
    console.warn("Aviso ao carregar centro de afiliados:", err);
  }

  if (!affiliateData) {
    affiliateData = {
      codigoIndicacao: "PRINT-DEMO",
      posicaoPreferencial: "auto",
      kpis: { totalIndicados: 0, ativosCount: 0, totalPontos: 0, comissaoEstimada: 0 },
      funil: { convitesEnviados: 0, linksAcessados: 0, cadastrosIniciados: 0, lojasCriadas: 0, trialsAtivos: 0, assinaturasPagas: 0, taxaConversaoFinal: 0 },
      recompensa: { nivelAtual: "Iniciante", pontosAtuais: 0, proximoNivel: "Bronze", pontosProximoNivel: 500, pontosFaltantes: 500, progressoPercentual: 0 },
      equilibrio: { membrosEsquerda: 0, membrosDireita: 0, percentualEquilibrio: 100 },
      nosEsquerda: [],
      nosDireita: [],
      timeline: [],
      alertas: [],
      ranking: [],
      historicoGrafico: [],
    };
  }

  return <IndicacoesClientPage data={affiliateData} />;
}
