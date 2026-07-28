import { prisma } from "@/lib/prisma";

export const EVENTOS_PONTUACAO = {
  NOVO_CADASTRO: { pontos: 100, descricao: "Novo cadastro via link de indicação" },
  LOJA_CRIADA: { pontos: 200, descricao: "Criação de loja no sistema" },
  PRIMEIRA_ASSINATURA: { pontos: 500, descricao: "Primeira assinatura paga realizada" },
  RENOVACAO_MENSAL: { pontos: 100, descricao: "Renovação mensal do indicado" },
  UPGRADE_PLANO: { pontos: 200, descricao: "Upgrade de plano do indicado" },
  PRIMEIRA_VENDA: { pontos: 150, descricao: "Primeira venda realizada na loja" },
  PRIMEIRO_PRODUTO: { pontos: 50, descricao: "Primeiro produto cadastrado no catálogo" },
  PERFIL_COMPLETO: { pontos: 30, descricao: "Perfil completamente preenchido" },
};

export const NIVEIS_RECOMPENSA = [
  { nome: "Bronze", slug: "bronze", pontosMinimos: 0, icone: "🥉", cor: "amber", beneficio: "Acesso ao catálogo de recompensas base", badge: "Iniciante Maker" },
  { nome: "Prata", slug: "prata", pontosMinimos: 500, icone: "🥈", cor: "slate", beneficio: "Desconto de 5% no resgate de insumos", badge: "Maker Prata" },
  { nome: "Ouro", slug: "ouro", pontosMinimos: 1500, icone: "🥇", cor: "yellow", beneficio: "Desconto de 10% + Atendimento prioritário", badge: "Maker Ouro" },
  { nome: "Diamante", slug: "diamante", pontosMinimos: 5000, icone: "💎", cor: "cyan", beneficio: "Frete grátis em resgates físicos + Acesso antecipado a recursos IA", badge: "Maker Diamante" },
  { nome: "Platinum", slug: "platinum", pontosMinimos: 10000, icone: "👑", cor: "indigo", beneficio: "Gerente de conta dedicado + 15% de bônus em todos os pontos", badge: "Embaixador Platinum" },
  { nome: "Elite", slug: "elite", pontosMinimos: 25000, icone: "⚡", cor: "purple", beneficio: "Acesso ilimitado à suíte de IA + Convite para conselho Maker", badge: "Lenda Maker Elite" },
];

export const CATALOGO_DEFAULT = [
  { nome: "Filamento PLA Branco 1kg", descricao: "Carretel de filamento PLA de alta precisão 1.75mm", categoria: "filamentos", tipo: "fisico", pontosNecessarios: 2000, estoque: 50 },
  { nome: "Filamento PETG Preto 1kg", descricao: "Resistência mecânica e térmica superior para peças industriais", categoria: "filamentos", tipo: "fisico", pontosNecessarios: 2500, estoque: 40 },
  { nome: "Kit de Bicos Endurecidos (5un)", descricao: "Bicos de aço endurecido 0.4mm anti-abrasão para PLA de fibra de carbono", categoria: "pecas", tipo: "fisico", pontosNecessarios: 3000, estoque: 30 },
  { nome: "Placa PEI Dupla Face Magnética", descricao: "Superfície de impressão texturizada + lisa para aderência perfeita", categoria: "acessorios", tipo: "fisico", pontosNecessarios: 5000, estoque: 25 },
  { nome: "Camiseta Oficial PrintForge 3D", descricao: "100% Algodão com estampa exclusiva Maker", categoria: "brindes", tipo: "fisico", pontosNecessarios: 4000, estoque: 60 },
  { nome: "1 Mês de Plano Pro Grátis", descricao: "Crédito direto de 1 mensalidade no Plano Pro da sua empresa", categoria: "creditos", tipo: "digital", pontosNecessarios: 1500, estoque: 999 },
  { nome: "Créditos para Assistente de IA (800 AI Tokens)", descricao: "Análise preditiva de falhas e precificação assistida por IA", categoria: "premium", tipo: "digital", pontosNecessarios: 800, estoque: 999 },
  { nome: "Cupom de Frete Grátis", descricao: "Cupom de envio gratuito para qualquer pedido no catálogo público", categoria: "cupons", tipo: "digital", pontosNecessarios: 300, estoque: 999 },
  { nome: "Caixa Surpresa Maker VIP", descricao: "Kit com filamentos raros, ferramentas e brindes secretos", categoria: "brindes", tipo: "fisico", pontosNecessarios: 7500, estoque: 15 },
];

export async function calcularSaldoPontos(profileId: string): Promise<number> {
  try {
    const aggregate = await prisma.rewardTransaction.aggregate({
      where: { profileId },
      _sum: { pontos: true },
    });
    return aggregate._sum.pontos || 0;
  } catch (err) {
    console.warn("Aviso ao calcular saldo Ledger via prisma:", err);
    return 0;
  }
}

export async function registrarTransacaoPontos(params: {
  profileId: string;
  pontos: number;
  tipo: "credito" | "debito";
  evento: string;
  descricao: string;
}) {
  try {
    const valorPontos = params.tipo === "debito" ? -Math.abs(params.pontos) : Math.abs(params.pontos);
    return await prisma.rewardTransaction.create({
      data: {
        profileId: params.profileId,
        pontos: valorPontos,
        tipo: params.tipo,
        evento: params.evento,
        descricao: params.descricao,
      },
    });
  } catch (err: any) {
    console.warn("Aviso ao registrar transacao no Ledger:", err?.message);
    return null;
  }
}

export async function resgatarItemRecompensa(profileId: string, rewardId: string) {
  try {
    const reward = await prisma.rewardCatalog.findUnique({ where: { id: rewardId } });
    if (!reward || !reward.ativo) {
      return { error: "Recompensa não disponível para resgate." };
    }

    if (reward.estoque <= 0) {
      return { error: "Estoque esgotado para esta recompensa." };
    }

    const saldoAtual = await calcularSaldoPontos(profileId);
    if (saldoAtual < reward.pontosNecessarios) {
      return { error: `Pontos insuficientes. Você possui ${saldoAtual} pts, mas são necessários ${reward.pontosNecessarios} pts.` };
    }

    // 1. Deduzir pontos via Ledger
    await registrarTransacaoPontos({
      profileId,
      pontos: reward.pontosNecessarios,
      tipo: "debito",
      evento: "resgate",
      descricao: `Resgate do item: ${reward.nome}`,
    });

    // 2. Decrementar estoque
    await prisma.rewardCatalog.update({
      where: { id: rewardId },
      data: { estoque: { decrement: 1 } },
    });

    // 3. Criar registro de resgate
    const codigoCupom = `REWARD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const redemption = await prisma.rewardRedemption.create({
      data: {
        profileId,
        rewardId,
        pontosGastos: reward.pontosNecessarios,
        status: "aprovado",
        codigoCupom,
      },
    });

    return {
      success: true,
      message: `Parabéns! Você resgatou "${reward.nome}". Código do resgate: ${codigoCupom}`,
      redemption,
    };
  } catch (err: any) {
    return { error: err?.message || "Erro ao efetuar resgate da recompensa." };
  }
}

export async function getRewardsDashboardData(profileId: string) {
  const saldoPontos = await calcularSaldoPontos(profileId);

  // Garantir catálogo populado
  let catalogo = await prisma.rewardCatalog.findMany({ where: { ativo: true } }).catch(() => []);
  if (catalogo.length === 0) {
    try {
      await prisma.rewardCatalog.createMany({
        data: CATALOGO_DEFAULT,
        skipDuplicates: true,
      });
      catalogo = await prisma.rewardCatalog.findMany({ where: { ativo: true } });
    } catch (e) {
      console.warn("Aviso ao popular catálogo default:", e);
    }
  }

  // Determinar Nível
  let nivelAtual = NIVEIS_RECOMPENSA[0];
  let proximoNivel = NIVEIS_RECOMPENSA[1];

  for (let i = 0; i < NIVEIS_RECOMPENSA.length; i++) {
    if (saldoPontos >= NIVEIS_RECOMPENSA[i].pontosMinimos) {
      nivelAtual = NIVEIS_RECOMPENSA[i];
      proximoNivel = NIVEIS_RECOMPENSA[i + 1] || NIVEIS_RECOMPENSA[i];
    }
  }

  const pontosFaltantes = Math.max(0, proximoNivel.pontosMinimos - saldoPontos);
  const progressoPercentual = Math.min(100, Math.round((saldoPontos / Math.max(1, proximoNivel.pontosMinimos)) * 100));

  // Transações recentes
  const transacoes = await prisma.rewardTransaction.findMany({
    where: { profileId },
    orderBy: { createdAt: "desc" },
    take: 10,
  }).catch(() => []);

  // Resgates recentes
  const resgates = await prisma.rewardRedemption.findMany({
    where: { profileId },
    include: { reward: true },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  // Missoes Ativas
  const missoes = [
    { id: "m1", titulo: "Convide 3 Vendedores", descricao: "Traga 3 novos parceiros para criar a loja no PrintForge", pontosRecompensa: 500, categoria: "diaria", progressoAtual: 1, meta: 3, concluida: false },
    { id: "m2", titulo: "Cadastre 10 Produtos", descricao: "Popule seu catálogo público com 10 peças prontas", pontosRecompensa: 100, categoria: "semanal", progressoAtual: 6, meta: 10, concluida: false },
    { id: "m3", titulo: "Complete Seu Perfil", descricao: "Preencha chave PIX e informações da empresa", pontosRecompensa: 30, categoria: "mensal", progressoAtual: 1, meta: 1, concluida: true },
  ];

  // Conquistas (Achievements)
  const conquistas = [
    { id: "a1", nome: "Primeira Indicação", descricao: "Indicou seu primeiro vendedor parceiro", icone: "🚀", raridade: "comum", conquistada: true },
    { id: "a2", nome: "Rede de 10 Makers", descricao: "Formou uma equipe de 10 impressores na rede", icone: "🔥", raridade: "rara", conquistada: false },
    { id: "a3", nome: "Primeiro Resgate", descricao: "Resgatou sua primeira recompensa física ou digital", icone: "🎁", raridade: "comum", conquistada: resgates.length > 0 },
    { id: "a4", nome: "Super Maker", descricao: "Alcançou a marca de 5.000 pontos no Ledger", icone: "⚡", raridade: "epica", conquistada: saldoPontos >= 5000 },
    { id: "a5", nome: "Lenda da Manufatura", descricao: "Alcançou o nível máximo Elite de 25.000 pontos", icone: "💎", raridade: "lendaria", conquistada: saldoPontos >= 25000 },
  ];

  return {
    saldoPontos,
    nivelAtual,
    proximoNivel,
    pontosFaltantes,
    progressoPercentual,
    catalogo,
    transacoes,
    resgates,
    missoes,
    conquistas,
    niveis: NIVEIS_RECOMPENSA,
  };
}
