import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Limpando banco de dados para o seed...");

  // Clean existing data in order of relations
  await prisma.rewardRedemption.deleteMany().catch(() => {});
  await prisma.rewardCatalogItem.deleteMany().catch(() => {});
  await prisma.rewardTransaction.deleteMany().catch(() => {});
  await prisma.referralEvent.deleteMany().catch(() => {});
  await prisma.rewardPointsConfig.deleteMany().catch(() => {});
  await prisma.rewardLevel.deleteMany().catch(() => {});
  await prisma.achievementUnlocked.deleteMany().catch(() => {});
  await prisma.achievement.deleteMany().catch(() => {});
  await prisma.missionProgress.deleteMany().catch(() => {});
  await prisma.mission.deleteMany().catch(() => {});

  await prisma.custoEmbalagem.deleteMany().catch(() => {});
  await prisma.custoPintura.deleteMany().catch(() => {});
  await prisma.custoImpressao.deleteMany().catch(() => {});
  if ((prisma as any).avaliacao) await (prisma as any).avaliacao.deleteMany().catch(() => {});
  await prisma.pedido.deleteMany().catch(() => {});
  await prisma.peca.deleteMany().catch(() => {});
  await prisma.tinta.deleteMany().catch(() => {});
  await prisma.filamentPriceHistory.deleteMany().catch(() => {});
  await prisma.filament.deleteMany().catch(() => {});
  await prisma.printer.deleteMany().catch(() => {});
  await prisma.cupom.deleteMany().catch(() => {});
  await prisma.configuracao.deleteMany().catch(() => {});
  if ((prisma as any).auditLog) await (prisma as any).auditLog.deleteMany().catch(() => {});
  await prisma.profile.deleteMany().catch(() => {});
  await prisma.empresa.deleteMany().catch(() => {});
  await prisma.plano.deleteMany().catch(() => {});

  console.log("🏆 Populando configurações iniciais do PrintForge Rewards...");

  // Seed de Configurações de Pontuação
  const rewardConfigs = [
    { evento: "novo_cadastro", pontos: 100, descricao: "Nova indicação direta cadastrada" },
    { evento: "loja_criada", pontos: 200, descricao: "Loja criada pela empresa indicada" },
    { evento: "primeira_assinatura", pontos: 500, descricao: "Primeira assinatura paga pela empresa indicada" },
    { evento: "renovacao_mensal", pontos: 100, descricao: "Renovação mensal confirmada da assinatura" },
    { evento: "upgrade_plano", pontos: 200, descricao: "Upgrade para um plano superior" },
    { evento: "primeira_venda", pontos: 150, descricao: "Primeira venda entregue e paga da empresa indicada" },
    { evento: "primeiro_produto", pontos: 50, descricao: "Primeiro produto cadastrado pela empresa indicada" },
    { evento: "perfil_completo", pontos: 30, descricao: "Perfil preenchido completamente com nome" },
  ];

  for (const config of rewardConfigs) {
    await prisma.rewardPointsConfig.create({ data: config });
  }

  // Seed de Níveis de Recompensa
  const rewardLevels = [
    { nome: "Bronze", pontosMinimos: 0, icone: "Shield", cor: "#CD7F32", beneficios: "Acesso ao catálogo básico de recompensas", ordem: 1 },
    { nome: "Prata", pontosMinimos: 500, icone: "Award", cor: "#C0C0C0", beneficios: "5% de bônus em resgates de cupons", ordem: 2 },
    { nome: "Ouro", pontosMinimos: 1500, icone: "Crown", cor: "#FFD700", beneficios: "Suporte prioritário + frete grátis em resgates físicos", ordem: 3 },
    { nome: "Diamante", pontosMinimos: 5000, icone: "Gem", cor: "#B9F2FF", beneficios: "Atendimento dedicado + brindes exclusivos", ordem: 4 },
    { nome: "Platinum", pontosMinimos: 10000, icone: "Zap", cor: "#E5E4E2", beneficios: "10% de desconto adicional na renovação de assinatura", ordem: 5 },
    { nome: "Elite", pontosMinimos: 25000, icone: "Star", cor: "#FF4500", beneficios: "Convites para eventos VIP + mentorias exclusivas de negócios 3D", ordem: 6 },
  ];

  for (const level of rewardLevels) {
    await prisma.rewardLevel.create({ data: level });
  }

  // Seed de Itens do Catálogo de Recompensas
  const catalogItems = [
    { nome: "Filamento PLA Premium 1kg", descricao: "Carretel de PLA Esun High Speed (Cor à escolha)", categoria: "filamentos", pontosNecessarios: 1200, estoque: 50 },
    { nome: "Bico de Latão Hardened 0.4mm", descricao: "Bico reforçado compatível com Ender 3 / Bambu Lab", categoria: "acessorios", pontosNecessarios: 400, estoque: 100 },
    { nome: "Cupom R$ 50 Off na Assinatura", descricao: "Desconto de R$ 50,00 na próxima mensalidade do PrintForge 3D", categoria: "cupons", pontosNecessarios: 800, estoque: null },
    { nome: "Kit Espátula & Alicate 3D Pro", descricao: "Kit completo de ferramentas para acabamento e remoção de suportes", categoria: "acessorios", pontosNecessarios: 1500, estoque: 25 },
    { nome: "Resina 3D Standard 1L", descricao: "Garrafa de Resina LCD 405nm Alta Precisão 1000g", categoria: "resinas", pontosNecessarios: 2200, estoque: 30 },
  ];

  for (const item of catalogItems) {
    await prisma.rewardCatalogItem.create({ data: item });
  }

  // Seed de Conquistas (Achievements)
  const achievements = [
    { nome: "Primeira Indicação", descricao: "Indique seu primeiro parceiro para o PrintForge 3D", icone: "UserPlus", raridade: "comum", criterioTipo: "indicacoes_total", criterioValor: 1 },
    { nome: "Embaixador 3D", descricao: "Alcance 10 indicações diretas", icone: "Users", raridade: "raro", criterioTipo: "indicacoes_total", criterioValor: 10 },
    { nome: "Líder de Comunidade", descricao: "Alcance 50 indicações diretas", icone: "Trophy", raridade: "lendario", criterioTipo: "indicacoes_total", criterioValor: 50 },
    { nome: "Primeira Conversão", descricao: "Consiga sua primeira indicação que se tornou assinante paga", icone: "CheckCircle", raridade: "comum", criterioTipo: "assinaturas_convertidas", criterioValor: 1 },
    { nome: "Clube dos 1.000 Pontos", descricao: "Acumule 1.000 pontos no saldo histórico do PrintForge Rewards", icone: "Star", raridade: "raro", criterioTipo: "pontos_total", criterioValor: 1000 },
    { nome: "Clube dos 5.000 Pontos", descricao: "Acumule 5.000 pontos no saldo histórico do PrintForge Rewards", icone: "Crown", raridade: "epico", criterioTipo: "pontos_total", criterioValor: 5000 },
    { nome: "Primeiro Resgate", descricao: "Realize seu primeiro resgate no catálogo de recompensas", icone: "Gift", raridade: "comum", criterioTipo: "resgates_total", criterioValor: 1 },
  ];

  for (const ach of achievements) {
    await prisma.achievement.create({ data: ach });
  }

  // Seed de Missões Simples
  const missions = [
    { nome: "Cadastre 10 produtos este mês", descricao: "Adicione pelo menos 10 peças ao seu catálogo no mês atual", tipo: "mensal", criterioTipo: "produtos_cadastrados", criterioValor: 10, recompensaPontos: 100, ativo: true },
    { nome: "Realize 5 vendas no mês", descricao: "Conclua e marque como pagas pelo menos 5 vendas no mês", tipo: "mensal", criterioTipo: "vendas_realizadas", criterioValor: 5, recompensaPontos: 200, ativo: true },
  ];

  for (const m of missions) {
    await prisma.mission.create({ data: m });
  }

  console.log("📦 Criando plano e empresa de teste...");
  const planoLegado = await prisma.plano.create({
    data: {
      nome: "Legado",
      slug: "legado",
      precoMensal: 0,
      limiteImpressoras: 999999,
      limitePecas: 999999,
      limitePedidosMes: 999999,
      limiteUsuarios: 999999,
      ativo: true,
    },
  });

  const empresa = await prisma.empresa.create({
    data: {
      nome: "Loja Principal",
      slug: "loja-principal",
      planoId: planoLegado.id,
      status: "ativo",
      codigoIndicacao: "PRINT-DEMO123",
    },
  });

  console.log("👥 Criando usuários...");
  await prisma.profile.create({
    data: {
      id: "usr_admin_01",
      email: "admin@printforge3d.com",
      nome: "Administrador General",
      role: "admin",
      status: "aprovado",
      empresaId: empresa.id,
    },
  });

  console.log("🖨️ Criando impressoras...");
  const pEnder = await prisma.printer.create({
    data: {
      empresaId: empresa.id,
      nome: "Ender 3 V2 - 01",
      modelo: "Creality Ender 3 V2",
      consumoWatts: 150,
      preco: 1800,
      vidaUtilHoras: 3000,
      horasTrabalhadas: 450,
      custoManutencaoAno: 200,
    },
  });

  const pBambu = await prisma.printer.create({
    data: {
      empresaId: empresa.id,
      nome: "Bambu Lab X1-Carbon - 01",
      modelo: "Bambu Lab X1C",
      consumoWatts: 350,
      preco: 9500,
      vidaUtilHoras: 6000,
      horasTrabalhadas: 1200,
      custoManutencaoAno: 500,
    },
  });

  console.log("🧵 Criando filamentos...");
  const fPlaBranco = await prisma.filament.create({
    data: {
      empresaId: empresa.id,
      nome: "PLA Premium Branco",
      marca: "Esun",
      material: "PLA",
      cor: "Branco",
      precoPorKg: 110.0,
      pesoRestanteGramas: 850,
    },
  });

  const fPetgCinza = await prisma.filament.create({
    data: {
      empresaId: empresa.id,
      nome: "PETG HS Cinza",
      marca: "Esun",
      material: "PETG",
      cor: "Cinza",
      precoPorKg: 130.0,
      pesoRestanteGramas: 1000,
    },
  });

  console.log("🧩 Criando catálogo de peças...");
  const pecaDragao = await prisma.peca.create({
    data: {
      empresaId: empresa.id,
      nome: "Dragão Articulado 35cm",
      descricao: "Dragão impresso em PLA com articulações fluídas e acabamento acetinado.",
      categoria: "Colecionáveis",
      fotoUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=60",
      publicada: true,
      status: "pronta",
      custoImpressao: {
        create: {
          printerId: pBambu.id,
          filamentId: fPlaBranco.id,
          pesoGramas: 180,
          tempoHoras: 6.5,
          tarifaEnergiaKwh: 0.85,
        },
      },
    },
  });

  console.log("🛒 Criando pedidos de demonstração...");
  await prisma.pedido.create({
    data: {
      empresaId: empresa.id,
      clienteNome: "João Silva",
      clienteContato: "11999998888",
      pecaId: pecaDragao.id,
      quantidade: 2,
      precoAcordado: 120.0,
      status: "entregue",
      pago: true,
    },
  });

  // Creditar transação inicial de pontos para a empresa de teste
  await prisma.rewardTransaction.create({
    data: {
      empresaId: empresa.id,
      tipo: "credito",
      evento: "loja_criada",
      pontos: 200,
      descricao: "Bônus inicial de boas-vindas do PrintForge Rewards",
    },
  });

  console.log("✅ Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
