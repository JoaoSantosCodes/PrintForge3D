import { prisma } from "@/lib/prisma";
import EmpresasSuperAdminClient from "./empresas-client";

export const dynamic = "force-dynamic";

export default async function SuperAdminEmpresasPage() {
  let empresas: any[] = [];
  let planos: any[] = [];

  try {
    const res = await Promise.all([
      prisma.empresa.findMany({
        include: {
          plano: true,
          profiles: {
            where: { role: "admin" },
            select: { nome: true, email: true },
          },
          _count: {
            select: {
              printers: true,
              pecas: true,
              pedidos: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.plano.findMany({ orderBy: { precoMensal: "asc" } }),
    ]);

    empresas = res[0];
    planos = res[1];
  } catch (err) {
    console.warn("Erro ao carregar empresas para superadmin:", err);
  }

  return <EmpresasSuperAdminClient empresas={empresas} planos={planos} />;
}
