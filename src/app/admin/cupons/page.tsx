import { prisma } from "@/lib/prisma";
import { getEmpresaIdAtual } from "@/lib/auth-server";
import { CuponsClient } from "./cupons-client";

export const dynamic = "force-dynamic";

export default async function AdminCuponsPage() {
  let cupons: any[] = [];
  try {
    const empresaId = await getEmpresaIdAtual();
    cupons = await prisma.cupom.findMany({
      where: { empresaId },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.warn("Erro ao buscar cupons:", err);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <CuponsClient cupons={cupons} />
    </div>
  );
}
