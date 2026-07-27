import { prisma } from "@/lib/prisma";
import CatalogoClientPage from "./catalogo-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catálogo Público 3D — PrintForge 3D",
  description: "Explore o catálogo de modelos e objetos 3D produzidos com alta precisão sob demanda.",
  openGraph: {
    title: "Catálogo Público 3D — PrintForge 3D",
    description: "Explore o catálogo de modelos e objetos 3D produzidos com alta precisão sob demanda.",
    type: "website",
  },
};

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
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.warn("Erro ao carregar catálogo público:", err);
  }

  return <CatalogoClientPage pecas={pecas} />;
}
