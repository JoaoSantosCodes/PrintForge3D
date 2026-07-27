import { prisma } from "@/lib/prisma";
import { getEmpresaIdAtual } from "@/lib/auth-server";
import { ConfiguracoesClient } from "./configuracoes-client";

export const dynamic = "force-dynamic";

export default async function AdminConfiguracoesPage() {
  let chavePix = "";
  try {
    const empresaId = await getEmpresaIdAtual();
    let config = await prisma.configuracao.findUnique({
      where: { empresaId },
    });

    if (!config) {
      config = await prisma.configuracao.create({
        data: { empresaId },
      }).catch(() => null);
    }

    chavePix = config?.chavePix || "";
  } catch (err) {
    console.warn("Erro ao buscar configurações:", err);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <ConfiguracoesClient initialChavePix={chavePix} />
    </div>
  );
}
