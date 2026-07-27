import { prisma } from "@/lib/prisma";
import { getCurrentProfile, getEmpresaIdAtualOptional } from "@/lib/auth-server";
import UsuariosClientPage from "./usuarios-client";

export const dynamic = "force-dynamic";

export default async function AdminUsuariosPage() {
  let currentUserId: string | null = null;
  let empresaId: string | null = null;
  try {
    const profile = await getCurrentProfile();
    currentUserId = profile?.id || null;
    empresaId = await getEmpresaIdAtualOptional();
  } catch {}

  const usuarios = await prisma.profile.findMany({
    where: empresaId ? { empresaId } : undefined,
    orderBy: { createdAt: "desc" },
  });

  const solicitacoesExclusao = await prisma.solicitacaoExclusao.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <UsuariosClientPage
      usuarios={usuarios}
      solicitacoesExclusao={solicitacoesExclusao}
      currentUserId={currentUserId}
    />
  );
}
