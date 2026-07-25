import { prisma } from "@/lib/prisma";
import CatalogoClientPage from "./catalogo-client";

export const dynamic = "force-dynamic";

export default async function CatalogoPage() {
  let pecas: any[] = [];
  try {
    pecas = await prisma.peca.findMany({
      where: { publicada: true },
      select: {
        id: true,
        nome: true,
        descricao: true,
        categoria: true,
        fotoUrl: true,
        status: true,
        createdAt: true,
        // CRITICAL SECURITY RULE: Do NOT include cost relations or financial fields here!
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.warn("Erro ao carregar catálogo público:", err);
  }

  return <CatalogoClientPage pecas={pecas} />;
}
