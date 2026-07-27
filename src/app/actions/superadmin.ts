"use server";

import { getCurrentProfile } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function verifySuperAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "super_admin") {
    throw new Error("Acesso negado. Apenas super_admin pode executar esta ação.");
  }
  return profile;
}

// 1. Marcar mensalidade como paga
export async function marcarMensalidadePagaAction(empresaId: string) {
  try {
    await verifySuperAdmin();

    const proximaCobranca = new Date();
    proximaCobranca.setDate(proximaCobranca.getDate() + 30);

    const empresa = await prisma.empresa.update({
      where: { id: empresaId },
      data: {
        status: "ativo",
        proximaCobranca,
      },
    });

    revalidatePath("/superadmin");
    revalidatePath("/superadmin/empresas");
    return { success: true, message: `Mensalidade da empresa ${empresa.nome} renovada até ${proximaCobranca.toLocaleDateString('pt-BR')}` };
  } catch (err: any) {
    return { error: err?.message || "Erro ao marcar mensalidade como paga." };
  }
}

// 2. Alterar status da empresa manualmente
export async function alterarStatusEmpresaAction(empresaId: string, novoStatus: string) {
  try {
    await verifySuperAdmin();

    const statusValidos = ["trial", "ativo", "inadimplente", "cancelado", "bloqueado", "trial_expirado"];
    if (!statusValidos.includes(novoStatus)) {
      return { error: "Status inválido." };
    }

    const empresa = await prisma.empresa.update({
      where: { id: empresaId },
      data: { status: novoStatus },
    });

    revalidatePath("/superadmin");
    revalidatePath("/superadmin/empresas");
    return { success: true, message: `Status da empresa ${empresa.nome} alterado para ${novoStatus}.` };
  } catch (err: any) {
    return { error: err?.message || "Erro ao alterar status da empresa." };
  }
}

// 3. Trocar plano da empresa manualmente
export async function alterarPlanoEmpresaAction(empresaId: string, planoId: string) {
  try {
    await verifySuperAdmin();

    const plano = await prisma.plano.findUnique({ where: { id: planoId } });
    if (!plano) return { error: "Plano não encontrado." };

    const empresa = await prisma.empresa.update({
      where: { id: empresaId },
      data: { planoId: plano.id },
    });

    revalidatePath("/superadmin");
    revalidatePath("/superadmin/empresas");
    return { success: true, message: `Plano da empresa ${empresa.nome} alterado para ${plano.nome}.` };
  } catch (err: any) {
    return { error: err?.message || "Erro ao alterar plano da empresa." };
  }
}

// 4. CRUD de Planos
const planoSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, "Nome do plano é obrigatório"),
  slug: z.string().min(1, "Slug do plano é obrigatório"),
  precoMensal: z.coerce.number().min(0, "Preço mensal deve ser >= 0"),
  limiteImpressoras: z.coerce.number().int().min(1, "Limite de impressoras deve ser >= 1"),
  limitePecas: z.coerce.number().int().min(1, "Limite de peças deve ser >= 1"),
  limitePedidosMes: z.coerce.number().int().min(1, "Limite de pedidos por mês deve ser >= 1"),
  limiteUsuarios: z.coerce.number().int().min(1, "Limite de usuários deve ser >= 1").default(5),
  ativo: z.boolean().default(true),
});

export async function savePlanoAction(formData: FormData) {
  try {
    await verifySuperAdmin();

    const rawData = {
      id: formData.get("id") as string || undefined,
      nome: formData.get("nome"),
      slug: (formData.get("slug") as string || "").trim().toLowerCase(),
      precoMensal: formData.get("precoMensal"),
      limiteImpressoras: formData.get("limiteImpressoras"),
      limitePecas: formData.get("limitePecas"),
      limitePedidosMes: formData.get("limitePedidosMes"),
      limiteUsuarios: formData.get("limiteUsuarios") || 5,
      ativo: formData.get("ativo") === "true",
    };

    const v = planoSchema.parse(rawData);

    if (v.id) {
      await prisma.plano.update({
        where: { id: v.id },
        data: {
          nome: v.nome,
          slug: v.slug,
          precoMensal: v.precoMensal,
          limiteImpressoras: v.limiteImpressoras,
          limitePecas: v.limitePecas,
          limitePedidosMes: v.limitePedidosMes,
          limiteUsuarios: v.limiteUsuarios,
          ativo: v.ativo,
        },
      });
    } else {
      await prisma.plano.create({
        data: {
          nome: v.nome,
          slug: v.slug,
          precoMensal: v.precoMensal,
          limiteImpressoras: v.limiteImpressoras,
          limitePecas: v.limitePecas,
          limitePedidosMes: v.limitePedidosMes,
          limiteUsuarios: v.limiteUsuarios,
          ativo: v.ativo,
        },
      });
    }

    revalidatePath("/superadmin/planos");
    revalidatePath("/criar-loja");
    return { success: true, message: "Plano salvo com sucesso!" };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.errors.map((e) => e.message).join(", ") };
    }
    return { error: err?.message || "Erro ao salvar plano." };
  }
}

export async function deletePlanoAction(id: string) {
  try {
    await verifySuperAdmin();

    // Check if any company is assigned to this plan
    const count = await prisma.empresa.count({ where: { planoId: id } });
    if (count > 0) {
      return { error: `Não é possível excluir este plano pois ele está associado a ${count} empresa(s).` };
    }

    await prisma.plano.delete({ where: { id } });

    revalidatePath("/superadmin/planos");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Erro ao excluir plano." };
  }
}
