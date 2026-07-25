import { prisma } from "@/lib/prisma";
import PecasClientPage from "./pecas-client";

export const dynamic = "force-dynamic";

export default async function PecasPage() {
  let pecas: any[] = [];
  let printers: any[] = [];
  let filaments: any[] = [];

  try {
    const [fetchedPecas, fetchedPrinters, fetchedFilaments] = await Promise.all([
      prisma.peca.findMany({
        include: {
          custoImpressao: true,
          custoPintura: true,
          custoEmbalagem: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.printer.findMany(),
      prisma.filament.findMany(),
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
