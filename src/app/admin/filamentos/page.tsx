import { prisma } from "@/lib/prisma";
import FilamentsClientPage from "./filaments-client";

export const dynamic = "force-dynamic";

export default async function FilamentsPage() {
  let filaments: any[] = [];
  try {
    filaments = await prisma.filament.findMany({
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

  return <FilamentsClientPage initialFilaments={filaments} />;
}
