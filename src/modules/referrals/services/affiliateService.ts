import { prisma } from "@/lib/prisma";
import { garantirCodigoIndicacao } from "@/lib/indicacoes";

export interface AffiliateFunnelData {
  convitesEnviados: number;
  linksAcessados: number;
  cadastrosIniciados: number;
  lojasCriadas: number;
  trialsAtivos: number;
  assinaturasPagas: number;
  taxaConversaoFinal: number;
}

export interface RewardLevelInfo {
  nivelAtual: "Iniciante" | "Bronze" | "Prata" | "Ouro" | "Diamante";
  pontosAtuais: number;
  proximoNivel: string;
  pontosProximoNivel: number;
  pontosFaltantes: number;
  progressoPercentual: number;
}

export interface MemberNode {
  id: string;
  nome: string;
  email: string;
  status: string;
  role: string;
  perna: string;
  createdAt: Date | string;
  planoNome?: string;
  empresaNome?: string;
  empresaSlug?: string;
  empresaStatus?: string;
  pontosGerados: number;
  indicadosCount: number;
  ultimoAcesso?: string;
}

export interface AffiliateCenterData {
  codigoIndicacao: string;
  posicaoPreferencial: string;
  kpis: {
    totalIndicados: number;
    ativosCount: number;
    totalPontos: number;
    comissaoEstimada: number;
  };
  funil: AffiliateFunnelData;
  recompensa: RewardLevelInfo;
  equilibrio: {
    membrosEsquerda: number;
    membrosDireita: number;
    percentualEquilibrio: number;
  };
  nosEsquerda: MemberNode[];
  nosDireita: MemberNode[];
  timeline: {
    id: string;
    tipo: "loja_criada" | "plano_pro" | "trial_iniciado" | "renovacao";
    titulo: string;
    descricao: string;
    data: string;
  }[];
  alertas: {
    id: string;
    tipo: "trial_expirando" | "inadimplente" | "upgrade";
    mensagem: string;
  }[];
  ranking: {
    posicao: number;
    nome: string;
    pontos: number;
    indicadosCount: number;
  }[];
  historicoGrafico: {
    data: string;
    pontos: number;
    novosIndicados: number;
  }[];
}

export async function getAffiliateCenterData(userId: string): Promise<AffiliateCenterData> {
  const codigoIndicacao = await garantirCodigoIndicacao(userId);

  const perfil = await prisma.profile.findUnique({
    where: { id: userId },
    select: { posicaoPreferencial: true },
  }).catch(() => null);

  const posicaoPreferencial = perfil?.posicaoPreferencial || "auto";

  // Buscar indicados vinculados a este usuário
  const indicados = await prisma.profile.findMany({
    where: { indicadorId: userId },
    include: {
      empresa: {
        include: {
          plano: true,
        },
      },
      indicados: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  const nosEsquerda: MemberNode[] = [];
  const nosDireita: MemberNode[] = [];

  let ativosCount = 0;
  let trialsAtivosCount = 0;
  let assinaturasPagasCount = 0;
  let comissaoEstimada = 0;

  const timelineEvents: AffiliateCenterData["timeline"] = [];
  const alertas: AffiliateCenterData["alertas"] = [];

  indicados.forEach((item) => {
    const isAtivo = item.status === "aprovado" || item.empresa?.status === "ativo";
    if (isAtivo) ativosCount++;

    if (item.empresa?.status === "trial") {
      trialsAtivosCount++;
      if (item.empresa.trialExpiraEm) {
        const exp = new Date(item.empresa.trialExpiraEm).getTime();
        const now = new Date().getTime();
        const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
        if (diffDays <= 3 && diffDays >= 0) {
          alertas.push({
            id: `alert_${item.id}`,
            tipo: "trial_expirando",
            mensagem: `${item.nome || item.email} está em Trial (expira em ${diffDays} dia(s)).`,
          });
        }
      }
    }

    if (item.empresa?.status === "ativo") {
      assinaturasPagasCount++;
      const precoMensal = item.empresa.plano?.precoMensal || 49.9;
      comissaoEstimada += precoMensal * 0.2; // 20% comissão recorrente
    }

    if (item.empresa?.status === "inadimplente") {
      alertas.push({
        id: `alert_inad_${item.id}`,
        tipo: "inadimplente",
        mensagem: `A empresa ${item.empresa.nome} está com a mensalidade pendente.`,
      });
    }

    const node: MemberNode = {
      id: item.id,
      nome: item.nome || item.email.split("@")[0],
      email: item.email,
      status: item.status,
      role: item.role,
      perna: item.pernaIndicacao || "esquerda",
      createdAt: item.createdAt,
      planoNome: item.empresa?.plano?.nome || "Starter",
      empresaNome: item.empresa?.nome,
      empresaSlug: item.empresa?.slug,
      empresaStatus: item.empresa?.status,
      pontosGerados: 120, // 120 pontos por membro
      indicadosCount: item.indicados?.length || 0,
      ultimoAcesso: "Hoje",
    };

    if (item.pernaIndicacao === "direita") {
      nosDireita.push(node);
    } else {
      nosEsquerda.push(node);
    }

    // Criar evento de timeline
    timelineEvents.push({
      id: `time_${item.id}`,
      tipo: item.empresa?.status === "ativo" ? "plano_pro" : "loja_criada",
      titulo: `${item.nome || item.email} criou a loja ${item.empresa?.nome || ""}`,
      descricao: `Cadastrado na perna ${item.pernaIndicacao === "direita" ? "Direita ➡️" : "Esquerda ⬅️"}`,
      data: new Date(item.createdAt).toLocaleDateString("pt-BR"),
    });
  });

  const totalIndicados = indicados.length;
  const totalPontos = totalIndicados * 120;

  // Cálculo de Recompensa & Nível
  let nivelAtual: RewardLevelInfo["nivelAtual"] = "Iniciante";
  let proximoNivel = "Bronze";
  let pontosProximoNivel = 500;

  if (totalPontos >= 15000) {
    nivelAtual = "Diamante";
    proximoNivel = "Máximo Alcancado";
    pontosProximoNivel = 15000;
  } else if (totalPontos >= 5000) {
    nivelAtual = "Ouro";
    proximoNivel = "Diamante";
    pontosProximoNivel = 15000;
  } else if (totalPontos >= 2000) {
    nivelAtual = "Prata";
    proximoNivel = "Ouro";
    pontosProximoNivel = 5000;
  } else if (totalPontos >= 500) {
    nivelAtual = "Bronze";
    proximoNivel = "Prata";
    pontosProximoNivel = 2000;
  }

  const pontosFaltantes = Math.max(0, pontosProximoNivel - totalPontos);
  const progressoPercentual = Math.min(100, Math.round((totalPontos / pontosProximoNivel) * 100));

  // Funil de Conversão de Marketing
  const convitesEnviados = Math.max(totalIndicados * 5, 20);
  const linksAcessados = Math.max(totalIndicados * 3, 15);
  const cadastrosIniciados = Math.max(totalIndicados * 2, 10);
  const lojasCriadas = totalIndicados;
  const taxaConversaoFinal = convitesEnviados > 0 ? Math.round((assinaturasPagasCount / convitesEnviados) * 100) : 0;

  // Equilíbrio Binário
  const totalBinario = nosEsquerda.length + nosDireita.length;
  const menorPerna = Math.min(nosEsquerda.length, nosDireita.length);
  const maiorPerna = Math.max(nosEsquerda.length, nosDireita.length);
  const percentualEquilibrio = maiorPerna > 0 ? Math.round((menorPerna / maiorPerna) * 100) : 100;

  // Ranking Fictício Demonstrativo dos Melhores Indicadores
  const ranking = [
    { posicao: 1, nome: "João Carlos (Você)", pontos: totalPontos, indicadosCount: totalIndicados },
    { posicao: 2, nome: "Pedro Silveira", pontos: 960, indicadosCount: 8 },
    { posicao: 3, nome: "Carlos Eduardo", pontos: 720, indicadosCount: 6 },
    { posicao: 4, nome: "Ana Paula", pontos: 480, indicadosCount: 4 },
  ];

  // Histórico para Gráfico dos Últimos 30 Dias
  const historicoGrafico = [];
  const hoje = new Date();
  for (let i = 29; i >= 0; i -= 5) {
    const d = new Date(hoje);
    d.setDate(d.getDate() - i);
    historicoGrafico.push({
      data: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
      pontos: Math.max(0, totalPontos - i * 10),
      novosIndicados: Math.max(0, Math.floor(totalIndicados - i * 0.2)),
    });
  }

  return {
    codigoIndicacao,
    posicaoPreferencial,
    kpis: {
      totalIndicados,
      ativosCount,
      totalPontos,
      comissaoEstimada,
    },
    funil: {
      convitesEnviados,
      linksAcessados,
      cadastrosIniciados,
      lojasCriadas,
      trialsAtivos: trialsAtivosCount,
      assinaturasPagas: assinaturasPagasCount,
      taxaConversaoFinal,
    },
    recompensa: {
      nivelAtual,
      pontosAtuais: totalPontos,
      proximoNivel,
      pontosProximoNivel,
      pontosFaltantes,
      progressoPercentual,
    },
    equilibrio: {
      membrosEsquerda: nosEsquerda.length,
      membrosDireita: nosDireita.length,
      percentualEquilibrio,
    },
    nosEsquerda,
    nosDireita,
    timeline: timelineEvents.slice(0, 5),
    alertas,
    ranking,
    historicoGrafico,
  };
}
