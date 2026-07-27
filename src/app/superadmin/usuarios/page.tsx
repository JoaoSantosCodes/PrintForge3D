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
      }),
      prisma.empresa.findMany({
        select: {
          id: true,
          nome: true,
          slug: true,
        },
        orderBy: { nome: "asc" },
      }),
      prisma.solicitacaoExclusao.findMany({
        orderBy: { createdAt: "desc" },
      }),
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
