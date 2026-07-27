import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateMultiTenant() {
  console.log("🚀 Iniciando migração de dados legados para o modelo multiempresa...");

  // 1. Criar Plano Legado se não existir
  let planoLegado = await prisma.plano.findUnique({
    where: { slug: "legado" },
  });

  if (!planoLegado) {
    planoLegado = await prisma.plano.create({
      data: {
        nome: "Legado",
        slug: "legado",
        precoMensal: 0.0,
        limiteImpressoras: 999999,
        limitePecas: 999999,
        limitePedidosMes: 999999,
        limiteUsuarios: 999999,
        ativo: true,
      },
    });
    console.log("✅ Plano 'Legado' criado com sucesso.");
  }

  // 2. Criar Empresa Inicial se não existir
  let empresaInicial = await prisma.empresa.findUnique({
    where: { slug: "minha-loja" },
  });

  if (!empresaInicial) {
    empresaInicial = await prisma.empresa.create({
      data: {
        nome: "Minha Loja",
        slug: "minha-loja",
        planoId: planoLegado.id,
        status: "ativo",
      },
    });
    console.log("✅ Empresa inicial 'Minha Loja' (slug: minha-loja) criada com sucesso.");
  }

  const empresaId = empresaInicial.id;

  // 3. Atualizar registros existentes sem empresaId
  console.log("🔄 Vinculando registros operacionais existentes à Empresa inicial...");

  await prisma.printer.updateMany({
    where: { empresaId: "" },
    data: { empresaId },
  }).catch(() => null);

  await prisma.filament.updateMany({
    where: { empresaId: "" },
    data: { empresaId },
  }).catch(() => null);

  await prisma.filamentPriceHistory.updateMany({
    where: { empresaId: "" },
    data: { empresaId },
  }).catch(() => null);

  await prisma.tinta.updateMany({
    where: { empresaId: "" },
    data: { empresaId },
  }).catch(() => null);

  await prisma.peca.updateMany({
    where: { empresaId: "" },
    data: { empresaId },
  }).catch(() => null);

  await prisma.pedido.updateMany({
    where: { empresaId: "" },
    data: { empresaId },
  }).catch(() => null);

  await prisma.cupom.updateMany({
    where: { empresaId: "" },
    data: { empresaId },
  }).catch(() => null);

  await prisma.auditLog.updateMany({
    where: { empresaId: "" },
    data: { empresaId },
  }).catch(() => null);

  // Configuracao da Empresa Inicial
  const existingConfig = await prisma.configuracao.findFirst({
    where: { empresaId },
  });

  if (!existingConfig) {
    await prisma.configuracao.create({
      data: {
        empresaId,
        chavePix: null,
      },
    });
  }

  // 4. Vincular Profiles existentes à Empresa inicial
  console.log("👤 Vinculando perfis de usuário à Empresa inicial...");
  await prisma.profile.updateMany({
    where: {
      role: { in: ["admin", "usuario"] },
      empresaId: null,
    },
    data: { empresaId },
  });

  console.log("🎉 Migração multi-tenant concluída com sucesso!");
}

migrateMultiTenant()
  .catch((e) => {
    console.error("❌ Erro na migração multi-tenant:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
