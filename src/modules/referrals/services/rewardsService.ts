import { prisma } from "@/lib/prisma";
import {
  obterNivelEProgresso,
  garantirCodigoIndicacaoEmpresa,
  obterSaldoPontos,
} from "@/lib/rewards";

export async function getVendedorRewardsData(empresaId: string) {
  try {
    const codigoIndicacao = await garantirCodigoIndicacaoEmpresa(empresaId);
    const nivelInfo = await obterNivelEProgresso(empresaId);
    const saldoPontos = nivelInfo.saldoAtual;

    // KPIs e Dados iniciais em paralelo
    const [totalIndicacoes, assinaturasConvertidas, resgatesRealizados, transacoesRecentes] = await Promise.all([
      prisma.referralEvent.count({ where: { indicadorEmpresaId: empresaId } }),
      prisma.referralEvent.count({ where: { indicadorEmpresaId: empresaId, status: "assinatura_paga" } }),
      prisma.rewardRedemption.count({ where: { empresaId } }),
      prisma.rewardTransaction.findMany({
        where: { empresaId },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    // Histórico para gráfico dos últimos 6 meses (em paralelo)
    const hoje = new Date();
    const mesesPromises = [];

    for (let i = 5; i >= 0; i--) {
      const dataMes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() - i + 1, 1);
      const nomeMes = dataMes.toLocaleDateString("pt-BR", { month: "short" }).toUpperCase();

      mesesPromises.push(
        prisma.rewardTransaction
          .aggregate({
            where: {
              empresaId,
              tipo: "credito",
              createdAt: { gte: dataMes, lt: proximoMes },
            },
            _sum: { pontos: true },
          })
          .then((res) => ({
            mes: nomeMes,
            pontos: res._sum.pontos || 0,
          }))
      );
    }

    const mesesGrafico = await Promise.all(mesesPromises);

    // Catálogo de Recompensas Ativo
    const catalogo = await prisma.rewardCatalogItem.findMany({
      where: { ativo: true },
      orderBy: { pontosNecessarios: "asc" },
    });

    // Meus Resgates
    const resgates = await prisma.rewardRedemption.findMany({
      where: { empresaId },
      include: { item: true },
      orderBy: { createdAt: "desc" },
    });

    // Conquistas (Achievements)
    const todasConquistas = await prisma.achievement.findMany();
    const minhasConquistasDesbloqueadas = await prisma.achievementUnlocked.findMany({
      where: { empresaId },
    });
    const idsConquistados = new Set(minhasConquistasDesbloqueadas.map((c) => c.achievementId));

    const conquistasProcessadas = todasConquistas.map((ach) => {
      const desbloqueado = idsConquistados.has(ach.id);
      let progressoAtual = 0;

      if (ach.criterioTipo === "indicacoes_total") progressoAtual = totalIndicacoes;
      else if (ach.criterioTipo === "assinaturas_convertidas") progressoAtual = assinaturasConvertidas;
      else if (ach.criterioTipo === "pontos_total") progressoAtual = saldoPontos;
      else if (ach.criterioTipo === "resgates_total") progressoAtual = resgatesRealizados;

      return {
        ...ach,
        desbloqueado,
        progressoAtual: Math.min(ach.criterioValor, progressoAtual),
      };
    });

    // Missões Ativas
    const missoesAtivas = await prisma.mission.findMany({
      where: { ativo: true },
    });
    const periodoAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;

    const progressoMissoes = await prisma.missionProgress.findMany({
      where: { empresaId, periodoReferencia: periodoAtual },
    });
    const mapProgresso = new Map(progressoMissoes.map((p) => [p.missionId, p]));

    const missoesProcessadas = missoesAtivas.map((m) => {
      const p = mapProgresso.get(m.id);
      return {
        ...m,
        progressoAtual: p?.progresso || 0,
        concluida: p?.concluida || false,
      };
    });

    return {
      codigoIndicacao,
      nivelInfo,
      kpis: {
        saldoPontos,
        totalIndicacoes,
        assinaturasConvertidas,
        resgatesRealizados,
      },
      graficoPontos: mesesGrafico,
      timeline: transacoesRecentes.map((t) => ({
        id: t.id,
        tipo: t.tipo,
        evento: t.evento || "bonus",
        pontos: t.pontos,
        descricao: t.descricao,
        data: t.createdAt.toISOString(),
      })),
      catalogo,
      resgates: resgates.map((r) => ({
        id: r.id,
        itemNome: r.item.nome,
        categoria: r.item.categoria,
        pontosGastos: r.pontosGastos,
        status: r.status,
        data: r.createdAt.toISOString(),
      })),
      conquistas: conquistasProcessadas,
      missoes: missoesProcessadas,
    };
  } catch (err) {
    console.error("Erro ao carregar dados do vendedor no Rewards:", err);
    return {
      codigoIndicacao: `PRINT-${empresaId.substring(0, 6).toUpperCase()}`,
      nivelInfo: {
        nivelAtual: { id: "1", nome: "Bronze", pontosMinimos: 0, ordem: 1, icone: null, cor: null },
        proximoNivel: { id: "2", nome: "Prata", pontosMinimos: 500, ordem: 2, icone: null, cor: null },
        saldoAtual: 0,
        pontosParaProximo: 500,
        progressoPercentual: 0,
      },
      kpis: {
        saldoPontos: 0,
        totalIndicacoes: 0,
        assinaturasConvertidas: 0,
        resgatesRealizados: 0,
      },
      graficoPontos: [],
      timeline: [],
      catalogo: [],
      resgates: [],
      conquistas: [],
      missoes: [],
    };
  }
}

export async function getSuperAdminRewardsData() {
  try {
    const catalogo = await prisma.rewardCatalogItem.findMany({
      orderBy: { createdAt: "desc" },
    });

    const configs = await prisma.rewardPointsConfig.findMany({
      orderBy: { evento: "asc" },
    });

    const resgates = await prisma.rewardRedemption.findMany({
      include: {
        item: true,
        empresa: {
          select: { id: true, nome: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Funil de Conversão de Indicações
    const contagemStatus = await prisma.referralEvent.groupBy({
      by: ["status"],
      _count: { _all: true },
    });

    const statusMap = new Map((contagemStatus as any[]).map((s) => [s.status, s._count._all]));

    const funil = [
      { etapa: "Cadastro Iniciado", count: statusMap.get("cadastro_iniciado") || 0, cor: "#6366f1" },
      { etapa: "Loja Criada", count: statusMap.get("loja_criada") || 0, cor: "#06b6d4" },
      { etapa: "Trial Ativo", count: statusMap.get("trial") || 0, cor: "#eab308" },
      { etapa: "Assinatura Paga", count: statusMap.get("assinatura_paga") || 0, cor: "#10b981" },
      { etapa: "Cancelado", count: statusMap.get("cancelado") || 0, cor: "#f43f5e" },
    ];

    const totalReferrals = await prisma.referralEvent.count();

    return {
      catalogo,
      configs,
      resgates: resgates.map((r) => ({
        id: r.id,
        empresaNome: r.empresa?.nome || "Empresa Desconhecida",
        empresaSlug: r.empresa?.slug || "",
        itemNome: r.item.nome,
        categoria: r.item.categoria,
        pontosGastos: r.pontosGastos,
        status: r.status,
        data: r.createdAt.toISOString(),
      })),
      funil,
      totalReferrals,
    };
  } catch (err) {
    console.error("Erro ao carregar dados do SuperAdmin no Rewards:", err);
    return {
      catalogo: [],
      configs: [],
      resgates: [],
      funil: [],
      totalReferrals: 0,
    };
  }
}
