import { prisma } from "@/lib/prisma";
import { getEmpresaIdAtual } from "@/lib/auth-server";
import RelatoriosClientPage from "./relatorios-client";

export const dynamic = "force-dynamic";

export default async function AdminRelatoriosPage() {
  let pedidos: any[] = [];
  let pecas: any[] = [];
  let printers: any[] = [];
  let filaments: any[] = [];

  try {
    const empresaId = await getEmpresaIdAtual();
    const [fPedidos, fPecas, fPrinters, fFilaments] = await Promise.all([
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

    pedidos = fPedidos;
    pecas = fPecas;
    printers = fPrinters;
    filaments = fFilaments;
  } catch (err) {
    console.warn("Aviso ao carregar dados de relatórios:", err);
  }

  return (
    <RelatoriosClientPage
      pedidos={pedidos}
      pecas={pecas}
      printers={printers}
      filaments={filaments}
    />
  );
}
