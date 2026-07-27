import { prisma } from "@/lib/prisma";
import { getEmpresaIdAtual } from "@/lib/auth-server";
import FilamentosClientPage from "./filamentos-client";

export const dynamic = "force-dynamic";

export default async function FilamentsPage() {
  let filaments: any[] = [];
  try {
    const empresaId = await getEmpresaIdAtual();
    filaments = await prisma.filament.findMany({
      where: { empresaId },
      include: {
        priceHistory: {
          orderBy: { data: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.warn("Erro ao buscar filamentos:", err);
  }

  return <FilamentosClientPage initialFilaments={filaments} />;
}
