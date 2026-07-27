import { prisma } from "@/lib/prisma";
import CriarLojaClient from "./criar-loja-client";

export const dynamic = "force-dynamic";

export default async function CriarLojaPage() {
  let planos: any[] = [];
  try {
    planos = await prisma.plano.findMany({
      where: { ativo: true },
      orderBy: { precoMensal: "asc" },
    });
  } catch (err) {
    console.warn("Erro ao buscar planos:", err);
  }

  return <CriarLojaClient planos={planos} />;
}
