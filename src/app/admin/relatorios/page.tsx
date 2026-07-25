import { prisma } from "@/lib/prisma";
import RelatoriosClientPage from "./relatorios-client";

export const dynamic = "force-dynamic";

export default async function AdminRelatoriosPage() {
  const [pedidos, pecas, printers, filaments] = await Promise.all([
    prisma.pedido.findMany({
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
    prisma.peca.findMany(),
    prisma.printer.findMany(),
    prisma.filament.findMany(),
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
