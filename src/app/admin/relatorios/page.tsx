import { prisma } from "@/lib/prisma";
import { getEmpresaIdAtual } from "@/lib/auth-server";
import RelatoriosClientPage from "./relatorios-client";

export const dynamic = "force-dynamic";

export default async function AdminRelatoriosPage() {
  const empresaId = await getEmpresaIdAtual();
  const [pedidos, pecas, printers, filaments] = await Promise.all([
    prisma.pedido.findMany({
      where: { empresaId },
      include: {
        peca: {
          include: {
            custoImpressao: true,
            custoPintura: true,
            custoEmbalagem: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.peca.findMany({ where: { empresaId } }),
    prisma.printer.findMany({ where: { empresaId } }),
    prisma.filament.findMany({ where: { empresaId } }),
  ]);

  return (
    <RelatoriosClientPage
      pedidos={pedidos}
      pecas={pecas}
      printers={printers}
      filaments={filaments}
    />
  );
}
