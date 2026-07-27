import { prisma } from "@/lib/prisma";
import { getCurrentProfile, getEmpresaIdAtual } from "@/lib/auth-server";
import AssinaturaClientPage from "./assinatura-client";

export const dynamic = "force-dynamic";

export default async function AdminAssinaturaPage() {
  const profile = await getCurrentProfile();
  const empresaId = await getEmpresaIdAtual();

  let empresa: any = null;
  let planos: any[] = [];
  let usage = { printers: 0, pecas: 0, pedidosMes: 0 };

  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [fetchedEmpresa, fetchedPlanos, countPrinters, countPecas, countPedidosMes] = await Promise.all([
      prisma.empresa.findUnique({
        where: { id: empresaId },
        include: { plano: true },
      }),
      prisma.plano.findMany({
        where: { ativo: true },
        orderBy: { precoMensal: "asc" },
      }),
      prisma.printer.count({ where: { empresaId } }),
      prisma.peca.count({ where: { empresaId } }),
      prisma.pedido.count({
        where: {
          empresaId,
          createdAt: { gte: startOfMonth },
        },
      }),
    ]);

    empresa = fetchedEmpresa;
    planos = fetchedPlanos;
    usage = {
      printers: countPrinters,
      pecas: countPecas,
      pedidosMes: countPedidosMes,
    };
  } catch (err) {
    console.warn("Erro ao buscar dados de assinatura:", err);
  }

  return <AssinaturaClientPage empresa={empresa} planos={planos} usage={usage} />;
}
