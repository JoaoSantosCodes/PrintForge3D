import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Limpando banco de dados para o seed...");

  // Clean existing data in order of relations
  await prisma.custoEmbalagem.deleteMany();
  await prisma.custoPintura.deleteMany();
  await prisma.custoImpressao.deleteMany();
  await prisma.peca.deleteMany();
  await prisma.tinta.deleteMany();
  await prisma.filament.deleteMany();
  await prisma.printer.deleteMany();

  console.log("🖨️ Cadastrando impressoras...");
  const p1 = await prisma.printer.create({
    data: {
      nome: "Bambu Lab X1 Carbon",
      modelo: "X1-Carbon Combo",
      consumoWatts: 350,
      preco: 12500,
      vidaUtilHoras: 15000,
      custoManutencaoAno: 600,
    },
  });

  const p2 = await prisma.printer.create({
    data: {
      nome: "Creality Ender 3 V3",
      modelo: "Ender 3 V3 SE",
      consumoWatts: 220,
      preco: 2200,
      vidaUtilHoras: 10000,
      custoManutencaoAno: 200,
    },
  });

  const p3 = await prisma.printer.create({
    data: {
      nome: "Elegoo Saturn (Resina)",
      modelo: "Saturn 3 Ultra 12K",
      consumoWatts: 120,
      preco: 3800,
      vidaUtilHoras: 8000,
      custoManutencaoAno: 350,
    },
  });

  console.log("🧶 Cadastrando filamentos e resinas...");
  const f1 = await prisma.filament.create({
    data: {
      marca: "3D Fila",
      tipo: "PLA",
      cor: "Branco",
      precoPorKg: 89.9,
    },
  });

  const f2 = await prisma.filament.create({
    data: {
      marca: "Voolt3D",
      tipo: "PETG",
      cor: "Preto",
      precoPorKg: 119.9,
    },
  });

  const f3 = await prisma.filament.create({
    data: {
      marca: "3D Fila",
      tipo: "ABS",
      cor: "Cinza",
      precoPorKg: 99.9,
    },
  });

  const f4 = await prisma.filament.create({
    data: {
      marca: "Voolt3D",
      tipo: "TPU",
      cor: "Transparente",
      precoPorKg: 159.9,
    },
  });

  const f5 = await prisma.filament.create({
    data: {
      marca: "Elegoo",
      tipo: "Resina",
      cor: "Cinza Padrão",
      precoPorKg: 179.9,
    },
  });

  console.log("🎨 Cadastrando tintas e acabamentos...");
  await prisma.tinta.createMany({
    data: [
      {
        nome: "Primer Spray Cinza",
        marca: "Tekbond",
        tipo: "Primer",
        cor: "Cinza",
        volumeMl: 400,
        preco: 24.9,
      },
      {
        nome: "Tinta Acrílica Preta",
        marca: "Acrilex",
        tipo: "Acrílica",
        cor: "Preto Fosco",
        volumeMl: 60,
        preco: 8.9,
      },
      {
        nome: "Tinta Acrílica Dourada",
        marca: "Acrilex",
        tipo: "Acrílica",
        cor: "Ouro Real",
        volumeMl: 60,
        preco: 9.9,
      },
      {
        nome: "Verniz Fosco Spray",
        marca: "Colorgin",
        tipo: "Verniz",
        cor: "Transparente Fosco",
        volumeMl: 300,
        preco: 22.9,
      },
    ],
  });

  console.log("🧩 Cadastrando peças com detalhamento de custos...");

  // 1. Miniatura Dragão
  const peca1 = await prisma.peca.create({
    data: {
      nome: "Miniatura Dragão",
      descricao: "Miniatura detalhada de dragão místico com asas abertas e base ornamentada.",
      categoria: "Miniaturas",
      fotoUrl: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=80",
      publicada: true,
      status: "em_producao",
      custoImpressao: {
        create: {
          printerId: p1.id,
          filamentId: f1.id,
          pesoGramas: 180,
          tempoHoras: 8.5,
          tarifaEnergiaKwh: 0.85,
        },
      },
      custoPintura: {
        create: {
          tempoHoras: 3.0,
          valorHoraMaoDeObra: 35.0,
          custoTintas: 15.0,
        },
      },
      custoEmbalagem: {
        create: {
          materialDescricao: "Caixa de Papelão Reforçada com Ninho de Espuma",
          custoUnitario: 8.5,
        },
      },
    },
  });

  // 2. Vaso Geométrico
  const peca2 = await prisma.peca.create({
    data: {
      nome: "Vaso Geométrico",
      descricao: "Vaso decorativo multifacetado estilo minimalista moderno para plantas secas ou suculentas.",
      categoria: "Decoração",
      fotoUrl: "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=800&auto=format&fit=crop&q=80",
      publicada: true,
      status: "pronta",
      custoImpressao: {
        create: {
          printerId: p2.id,
          filamentId: f2.id,
          pesoGramas: 320,
          tempoHoras: 14.0,
          tarifaEnergiaKwh: 0.85,
        },
      },
      custoEmbalagem: {
        create: {
          materialDescricao: "Plástico Bolha de Alta Densidade e Caixa Padrão",
          custoUnitario: 4.0,
        },
      },
    },
  });

  // 3. Suporte de Celular
  const peca3 = await prisma.peca.create({
    data: {
      nome: "Suporte de Celular Ergonomico",
      descricao: "Suporte ajustável para mesa compatível com smartphones e tablets até 11 polegadas.",
      categoria: "Utilitários",
      fotoUrl: "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&auto=format&fit=crop&q=80",
      publicada: true,
      status: "pronta",
      custoImpressao: {
        create: {
          printerId: p2.id,
          filamentId: f1.id,
          pesoGramas: 65,
          tempoHoras: 2.5,
          tarifaEnergiaKwh: 0.85,
        },
      },
    },
  });

  // 4. Busto Guerreiro
  const peca4 = await prisma.peca.create({
    data: {
      nome: "Busto Guerreiro Nórdico",
      descricao: "Busto em alta definição impresso em resina 12K para colecionadores e pintura de fã.",
      categoria: "Miniaturas",
      fotoUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80",
      publicada: false, // em produção, ainda não publicada
      status: "em_producao",
      custoImpressao: {
        create: {
          printerId: p3.id,
          filamentId: f5.id,
          pesoGramas: 210,
          tempoHoras: 6.0,
          tarifaEnergiaKwh: 0.85,
        },
      },
      custoPintura: {
        create: {
          tempoHoras: 5.0,
          valorHoraMaoDeObra: 40.0,
          custoTintas: 22.0,
        },
      },
      custoEmbalagem: {
        create: {
          materialDescricao: "Estojo Estofado Personalizado com Espuma EPE",
          custoUnitario: 12.0,
        },
      },
    },
  });

  console.log("📦 Cadastrando pedidos/encomendas de exemplo...");
  await prisma.pedido.createMany({
    data: [
      {
        clienteNome: "Carlos Eduardo Silva",
        clienteContato: "(11) 98765-4321",
        status: "pendente",
        pecaId: peca4.id,
        quantidade: 1,
        precoAcordado: 450.0,
        observacoes: "Pintura realista no estilo Viking com acabamento fosco.",
      },
      {
        clienteNome: "Mariana Oliveira",
        clienteContato: "(21) 99123-8877",
        status: "em_impressao",
        pecaId: peca1.id,
        quantidade: 2,
        precoAcordado: 280.0,
        observacoes: "Entregar em caixa presenteável com cartão de felicitações.",
      },
      {
        clienteNome: "Lucas Mendes",
        clienteContato: "(31) 98844-5566",
        status: "pintando",
        pecaId: peca1.id,
        quantidade: 1,
        precoAcordado: 150.0,
        observacoes: "Detalhes em dourado nas asas do dragão.",
      },
      {
        clienteNome: "Arquitetura & Design Studio",
        clienteContato: "contato@arqstudio.com.br",
        status: "entregue",
        pecaId: peca2.id,
        quantidade: 5,
        precoAcordado: 420.0,
        observacoes: "Pedido corporativo para recepção de escritório.",
      },
    ],
  });

  console.log("✅ Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
