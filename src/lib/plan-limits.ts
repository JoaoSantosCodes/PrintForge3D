import { prisma } from "@/lib/prisma";

export async function checkPlanLimit(empresaId: string, resource: "impressoras" | "pecas" | "pedidos") {
  const empresa = await prisma.empresa.findUnique({
    where: { id: empresaId },
    include: { plano: true },
  });

  if (!empresa || !empresa.plano) {
    throw new Error("Empresa ou plano não encontrado.");
  }

  const { plano } = empresa;

  if (resource === "impressoras") {
    const count = await prisma.printer.count({ where: { empresaId } });
    if (count >= plano.limiteImpressoras) {
      return {
        allowed: false,
        message: `Você atingiu o limite de ${plano.limiteImpressoras} impressoras do seu plano (${plano.nome}). Faça upgrade para continuar.`,
        current: count,
        limit: plano.limiteImpressoras,
      };
    }
  }

  if (resource === "pecas") {
    const count = await prisma.peca.count({ where: { empresaId } });
    if (count >= plano.limitePecas) {
      return {
        allowed: false,
        message: `Você atingiu o limite de ${plano.limitePecas} peças no seu catálogo do plano (${plano.nome}). Faça upgrade para continuar.`,
        current: count,
        limit: plano.limitePecas,
      };
    }
  }

  if (resource === "pedidos") {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const count = await prisma.pedido.count({
      where: {
        empresaId,
        createdAt: { gte: startOfMonth },
      },
    });

    if (count >= plano.limitePedidosMes) {
      return {
        allowed: false,
        message: `Você atingiu o limite de ${plano.limitePedidosMes} pedidos no mês corrente do seu plano (${plano.nome}). Faça upgrade para continuar.`,
        current: count,
        limit: plano.limitePedidosMes,
      };
    }
  }

  return { allowed: true };
}
