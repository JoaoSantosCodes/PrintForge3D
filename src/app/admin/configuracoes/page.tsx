import { prisma } from "@/lib/prisma";
import { ConfiguracoesClient } from "./configuracoes-client";

export const dynamic = "force-dynamic";

export default async function AdminConfiguracoesPage() {
  let config = await prisma.configuracao.findUnique({
    where: { id: "global" },
  });

  if (!config) {
    config = await prisma.configuracao.create({
      data: { id: "global" },
    });
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <ConfiguracoesClient initialChavePix={config.chavePix || ""} />
    </div>
  );
}
