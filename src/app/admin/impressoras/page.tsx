import { prisma } from "@/lib/prisma";
import { getEmpresaIdAtual } from "@/lib/auth-server";
import ImpressorasClientPage from "./impressoras-client";

export const dynamic = "force-dynamic";

export default async function PrintersPage() {
  let printers: any[] = [];
  try {
    const empresaId = await getEmpresaIdAtual();
    printers = await prisma.printer.findMany({
      where: { empresaId },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.warn("Erro ao buscar impressoras:", err);
  }

  return <ImpressorasClientPage initialPrinters={printers} />;
}
