import { prisma } from "@/lib/prisma";
import { getCurrentProfile, getEmpresaIdAtualOptional } from "@/lib/auth-server";
import UsuariosClientPage from "./usuarios-client";

export const dynamic = "force-dynamic";

export default async function AdminUsuariosPage() {
  let currentUserId: string | null = null;
  let empresaId: string | null = null;
  let usuarios: any[] = [];
  let solicitacoesExclusao: any[] = [];

  try {
    const profile = await getCurrentProfile();
    currentUserId = profile?.id || null;
    empresaId = await getEmpresaIdAtualOptional();

    const [fUsuarios, fSolicitacoes] = await Promise.all([
      prisma.profile.findMany({
        where: empresaId ? { empresaId } : undefined,
        orderBy: { createdAt: "desc" },
      }),
      prisma.solicitacaoExclusao.findMany({
        orderBy: { createdAt: "desc" },
      }),
    ]);

    usuarios = fUsuarios;
    solicitacoesExclusao = fSolicitacoes;
  } catch (err) {
    console.warn("Erro ao carregar usuários:", err);
  }

  return (
    <UsuariosClientPage
      usuarios={usuarios}
      solicitacoesExclusao={solicitacoesExclusao}
      currentUserId={currentUserId}
    />
  );
}
