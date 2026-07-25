import { prisma } from "@/lib/prisma";
import TintasClientPage from "./tintas-client";

export const dynamic = "force-dynamic";

export default async function TintasPage() {
  let tintas: any[] = [];
  try {
    tintas = await prisma.tinta.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.warn("Erro ao buscar tintas:", err);
  }

  return <TintasClientPage initialTintas={tintas} />;
}
