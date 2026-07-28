import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Limpando banco de dados para o seed...");

  // Clean existing data in order of relations
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
    },
  });

  console.log("👥 Criando usuários...");
  const userAdmin = await prisma.profile.create({
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

  const fPlaPreto = await prisma.filament.create({
    data: {
      empresaId: empresa.id,
      nome: "PLA Premium Preto",
      marca: "Voolt3D",
      material: "PLA",
      cor: "Preto",
      precoPorKg: 98.0,
      pesoRestanteGramas: 150, // Baixo estoque
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

  console.log("🎨 Criando tintas e insumos...");
  await prisma.tinta.createMany({
    data: [
      { empresaId: empresa.id, nome: "Spray Primer Cinza", marca: "Colorgin", tipo: "Primer", cor: "Cinza", volumeMl: 400, preco: 35.0 },
      { empresaId: empresa.id, nome: "Tinta Acrílica Vermelho Fogo", marca: "Acrilex", tipo: "Acrílica", cor: "Vermelho", volumeMl: 250, preco: 18.5 },
      { empresaId: empresa.id, nome: "Verniz Fosco Protetor", marca: "Acrilex", tipo: "Verniz", cor: "Incolor", volumeMl: 300, preco: 28.0 },
    ],
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
      custoPintura: {
        create: {
          custoTintas: 5.0,
          tempoHoras: 1.0,
          valorHoraMaoDeObra: 30.0,
        },
      },
      custoEmbalagem: {
        create: {
          materialDescricao: "Caixa papelão N2 + plástico bolha",
          custoUnitario: 4.5,
        },
      },
    },
  });

  const pecaSuporte = await prisma.peca.create({
    data: {
      empresaId: empresa.id,
      nome: "Suporte Headset Gamer",
      descricao: "Suporte robusto impresso em PETG com fixação para mesa.",
      categoria: "Acessórios",
      fotoUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=60",
      publicada: true,
      status: "pronta",
      custoImpressao: {
        create: {
          printerId: pEnder.id,
          filamentId: fPetgCinza.id,
          pesoGramas: 120,
          tempoHoras: 4.0,
          tarifaEnergiaKwh: 0.85,
        },
      },
      custoEmbalagem: {
        create: {
          custoUnitario: 3.0,
        },
      },
    },
  });

  console.log("🛒 Criando pedidos de demonstração...");
  await prisma.pedido.createMany({
    data: [
      {
        empresaId: empresa.id,
        clienteNome: "João Silva",
        clienteContato: "11999998888",
        pecaId: pecaDragao.id,
        quantidade: 2,
        precoAcordado: 120.0,
        status: "entregue",
        pago: true,
      },
      {
        empresaId: empresa.id,
        clienteNome: "Maria Oliveira",
        clienteContato: "21988887777",
        pecaId: pecaSuporte.id,
        quantidade: 1,
        precoAcordado: 75.0,
        status: "em_impressao",
        pago: true,
      },
    ],
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
