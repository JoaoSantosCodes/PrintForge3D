import { prisma } from "@/lib/prisma";
import { getEmpresaIdAtual } from "@/lib/auth-server";
import { ConfiguracoesClient } from "./configuracoes-client";

export const dynamic = "force-dynamic";

export default async function AdminConfiguracoesPage() {
  const empresaId = await getEmpresaIdAtual();
  let config = await prisma.configuracao.findUnique({
    where: { empresaId },
  });

  if (!config) {
    config = await prisma.configuracao.create({
      data: { empresaId },
    });
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <ConfiguracoesClient initialChavePix={config.chavePix || ""} />
    </div>
  );
}
