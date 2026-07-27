import { prisma } from "@/lib/prisma";
import { getEmpresaIdAtual } from "@/lib/auth-server";
import PecasClientPage from "./pecas-client";

export const dynamic = "force-dynamic";

export default async function PecasPage() {
  let pecas: any[] = [];
  let printers: any[] = [];
  let filaments: any[] = [];

  try {
    const empresaId = await getEmpresaIdAtual();
    const [fetchedPecas, fetchedPrinters, fetchedFilaments] = await Promise.all([
      prisma.peca.findMany({
        where: { empresaId },
        include: {
          custoImpressao: true,
          custoPintura: true,
          custoEmbalagem: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.printer.findMany({ where: { empresaId } }),
      prisma.filament.findMany({ where: { empresaId } }),
    ]);

    pecas = fetchedPecas;
    printers = fetchedPrinters;
    filaments = fetchedFilaments;
  } catch (err) {
    console.warn("Erro ao buscar peças:", err);
  }

  return (
    <PecasClientPage
      initialPecas={pecas}
      printers={printers}
      filaments={filaments}
    />
  );
}
