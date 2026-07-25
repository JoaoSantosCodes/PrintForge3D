import { prisma } from "@/lib/prisma";
import PedidosClientPage from "./pedidos-client";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  let pedidos: any[] = [];
  let pecas: any[] = [];

  try {
    const [fetchedPedidos, fetchedPecas] = await Promise.all([
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
    ]);

    pedidos = fetchedPedidos;
    pecas = fetchedPecas;
  } catch (err) {
    console.warn("Erro ao buscar pedidos ou peças:", err);
  }

  return <PedidosClientPage initialPedidos={pedidos} pecas={pecas} />;
}
