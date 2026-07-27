import { prisma } from "@/lib/prisma";
import PedidosClientPage from "./pedidos-client";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  let pedidos: any[] = [];
  let pecas: any[] = [];
  let config = null;

  try {
    const [fetchedPedidos, fetchedPecas, fetchedConfig] = await Promise.all([
      prisma.pedido.findMany({
        include: {
          peca: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.peca.findMany({
        select: {
          id: true,
          nome: true,
          fotoUrl: true,
        },
        orderBy: { nome: "asc" },
      }),
      prisma.configuracao.findUnique({ where: { id: "global" } }),
    ]);

    pedidos = fetchedPedidos;
    pecas = fetchedPecas;
    config = fetchedConfig;
  } catch (err) {
    console.warn("Erro ao buscar pedidos ou peças:", err);
  }

  return <PedidosClientPage initialPedidos={pedidos} pecas={pecas} chavePix={config?.chavePix || null} />;
}
