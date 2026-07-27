import { prisma } from "@/lib/prisma";
import UsuariosSuperAdminClient from "./usuarios-client";

export const dynamic = "force-dynamic";

export default async function SuperAdminUsuariosPage() {
  let usuarios: any[] = [];
  let empresas: any[] = [];
  let solicitacoesExclusao: any[] = [];

  try {
    const [fUsuarios, fEmpresas, fSolicitacoes] = await Promise.all([
      prisma.profile.findMany({
        include: {
          empresa: {
            select: {
              id: true,
              nome: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }).catch(async () => {
        // Fallback se o banco ainda não tiver a coluna empresaId
        return await prisma.profile.findMany({
          select: {
            id: true,
            email: true,
            nome: true,
            role: true,
            status: true,
            createdAt: true,
            aprovadoEm: true,
          },
          orderBy: { createdAt: "desc" },
        }).catch(() => []);
      }),
      prisma.empresa.findMany({
        select: {
          id: true,
          nome: true,
          slug: true,
        },
        orderBy: { nome: "asc" },
      }).catch(() => []),
      prisma.solicitacaoExclusao.findMany({
        orderBy: { createdAt: "desc" },
      }).catch(() => []),
    ]);

    usuarios = fUsuarios;
    empresas = fEmpresas;
    solicitacoesExclusao = fSolicitacoes;
  } catch (err) {
    console.warn("Erro ao buscar usuários para Super-Admin:", err);
  }

  return (
    <UsuariosSuperAdminClient
      usuarios={usuarios}
      empresas={empresas}
      solicitacoesExclusao={solicitacoesExclusao}
    />
  );
}
