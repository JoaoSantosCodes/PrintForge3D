import { prisma } from "@/lib/prisma";
import PrintersClientPage from "./printers-client";

export const dynamic = "force-dynamic";

export default async function PrintersPage() {
  let printers: any[] = [];
  try {
    printers = await prisma.printer.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.warn("Erro ao buscar impressoras:", err);
  }

  return <PrintersClientPage initialPrinters={printers} />;
}
