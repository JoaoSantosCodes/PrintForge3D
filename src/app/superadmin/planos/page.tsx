import { prisma } from "@/lib/prisma";
import PlanosSuperAdminClient from "./planos-client";

export const dynamic = "force-dynamic";

export default async function SuperAdminPlanosPage() {
  let planos: any[] = [];
  try {
    planos = await prisma.plano.findMany({
      include: {
        _count: {
          select: { empresas: true },
        },
      },
      orderBy: { precoMensal: "asc" },
    });
  } catch (err) {
    console.warn("Erro ao carregar planos para superadmin:", err);
  }

  return <PlanosSuperAdminClient planos={planos} />;
}
