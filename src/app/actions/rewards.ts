"use server";

import { getCurrentProfile, getEmpresaIdAtual } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { concederPontos, obterSaldoPontos, verificarConquistas } from "@/lib/rewards";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function verifySuperAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "super_admin") {
    throw new Error("Acesso negado. Apenas super_admin pode executar esta ação.");
  }
  return profile;
}

// -------------------------------------------------------------
// VENDEDOR — FLUXO DE RESGATE DE RECOMPENSAS
// -------------------------------------------------------------

export async function resgatarItemAction(itemId: string) {
  try {
    const empresaId = await getEmpresaIdAtual();

    if (!itemId) {
      return { error: "Item de recompensa não especificado." };
    }

    // Executar resgate em transação de banco (débito + pedido de resgate + baixa em estoque)
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buscar item no catálogo
      const item = await tx.rewardCatalogItem.findUnique({
        where: { id: itemId },
      });

      if (!item || !item.ativo) {
        throw new Error("Recompensa indisponível no catálogo.");
      }

      if (item.estoque !== null && item.estoque <= 0) {
        throw new Error("Estoque desta recompensa esgotado no momento.");
      }

      // 2. Verificar saldo de pontos via histórico (ledger)
      const creditosAgg = await tx.rewardTransaction.aggregate({
        where: { empresaId, tipo: "credito" },
        _sum: { pontos: true },
      });
      const debitosAgg = await tx.rewardTransaction.aggregate({
        where: { empresaId, tipo: "debito" },
        _sum: { pontos: true },
      });

      const totalCreditos = creditosAgg._sum.pontos || 0;
      const totalDebitos = debitosAgg._sum.pontos || 0;
      const saldoAtual = Math.max(0, totalCreditos - totalDebitos);

      if (saldoAtual < item.pontosNecessarios) {
        throw new Error(`Saldo de pontos insuficiente. Você possui ${saldoAtual} pontos, mas são necessários ${item.pontosNecessarios} pontos.`);
      }

      // 3. Criar registro do resgate
      const resgate = await tx.rewardRedemption.create({
        data: {
          empresaId,
          itemId: item.id,
          pontosGastos: item.pontosNecessarios,
          status: "solicitado",
        },
      });

      // 4. Criar transação de débito imutável
      await tx.rewardTransaction.create({
        data: {
          empresaId,
          tipo: "debito",
          evento: "resgate",
          pontos: item.pontosNecessarios,
          descricao: `Resgate de recompensa: ${item.nome}`,
          referenciaId: resgate.id,
        },
      });

      // 5. Baixar estoque se aplicável
      if (item.estoque !== null) {
        await tx.rewardCatalogItem.update({
          where: { id: item.id },
          data: { estoque: { decrement: 1 } },
        });
      }

      return resgate;
    });

    await verificarConquistas(empresaId).catch(() => null);

    revalidatePath("/admin/rewards");
    revalidatePath("/superadmin/rewards");
    return { success: true, message: "Solicitação de resgate realizada com sucesso!", resgateId: result.id };
  } catch (err: any) {
    return { error: err?.message || "Erro ao realizar o resgate de pontos." };
  }
}

// -------------------------------------------------------------
// SUPER-ADMIN — CRUD DO CATÁLOGO DE RECOMPENSAS
// -------------------------------------------------------------

const catalogItemSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(2, "Nome da recompensa é obrigatório"),
  descricao: z.string().optional(),
  imagemUrl: z.string().optional(),
  categoria: z.string().default("filamentos"),
  pontosNecessarios: z.coerce.number().min(1, "Pontos devem ser maiores que 0"),
  estoque: z.preprocess((val) => (val === "" || val === null || val === undefined ? null : Number(val)), z.number().nullable()),
  ativo: z.boolean().default(true),
});

export async function salvarItemCatalogoSuperAdminAction(formData: FormData) {
  try {
    await verifySuperAdmin();

    const rawData = {
      id: (formData.get("id") as string) || undefined,
      nome: formData.get("nome"),
      descricao: formData.get("descricao") || undefined,
      imagemUrl: formData.get("imagemUrl") || undefined,
      categoria: formData.get("categoria") || "filamentos",
      pontosNecessarios: formData.get("pontosNecessarios"),
      estoque: formData.get("estoque"),
      ativo: formData.get("ativo") === "true",
    };

    const v = catalogItemSchema.parse(rawData);

    if (v.id) {
      await prisma.rewardCatalogItem.update({
        where: { id: v.id },
        data: {
          nome: v.nome,
          descricao: v.descricao,
          imagemUrl: v.imagemUrl,
          categoria: v.categoria,
          pontosNecessarios: v.pontosNecessarios,
          estoque: v.estoque,
          ativo: v.ativo,
        },
      });
    } else {
      await prisma.rewardCatalogItem.create({
        data: {
          nome: v.nome,
          descricao: v.descricao,
          imagemUrl: v.imagemUrl,
          categoria: v.categoria,
          pontosNecessarios: v.pontosNecessarios,
          estoque: v.estoque,
          ativo: v.ativo,
        },
      });
    }

    revalidatePath("/admin/rewards");
    revalidatePath("/superadmin/rewards");
    return { success: true, message: "Item de recompensa salvo com sucesso!" };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.errors.map((e) => e.message).join(", ") };
    }
    return { error: err?.message || "Erro ao salvar item no catálogo." };
  }
}

export async function deletarItemCatalogoSuperAdminAction(id: string) {
  try {
    await verifySuperAdmin();

    const countResgates = await prisma.rewardRedemption.count({
      where: { itemId: id },
    });

    if (countResgates > 0) {
      return { error: `Não é possível excluir este item pois existem ${countResgates} solicitação(ões) de resgate associadas a ele. Desative-o em vez de excluir.` };
    }

    await prisma.rewardCatalogItem.delete({
      where: { id },
    });

    revalidatePath("/admin/rewards");
    revalidatePath("/superadmin/rewards");
    return { success: true, message: "Item de recompensa excluído com sucesso." };
  } catch (err: any) {
    return { error: err?.message || "Erro ao excluir item do catálogo." };
  }
}

// -------------------------------------------------------------
// SUPER-ADMIN — GESTÃO DE REGRAS DE PONTUAÇÃO (RewardPointsConfig)
// -------------------------------------------------------------

export async function salvarPontosConfigSuperAdminAction(evento: string, pontos: number, ativo: boolean, descricao?: string) {
  try {
    await verifySuperAdmin();

    if (!evento) return { error: "Evento não informado." };
    if (pontos < 0) return { error: "Pontos devem ser maiores ou iguais a 0." };

    await prisma.rewardPointsConfig.upsert({
      where: { evento },
      update: { pontos, ativo, descricao },
      create: { evento, pontos, ativo, descricao },
    });

    revalidatePath("/admin/rewards");
    revalidatePath("/superadmin/rewards");
    return { success: true, message: `Configuração do evento '${evento}' salva com sucesso!` };
  } catch (err: any) {
    return { error: err?.message || "Erro ao atualizar regra de pontuação." };
  }
}

// -------------------------------------------------------------
// SUPER-ADMIN — AVANÇO DE STATUS DOS RESGATES (RewardRedemption)
// -------------------------------------------------------------

export async function alterarStatusResgateSuperAdminAction(resgateId: string, novoStatus: string) {
  try {
    await verifySuperAdmin();

    const statusValidos = ["solicitado", "em_processamento", "enviado", "entregue", "cancelado"];
    if (!statusValidos.includes(novoStatus)) {
      return { error: "Status inválido." };
    }

    const resgate = await prisma.rewardRedemption.findUnique({
      where: { id: resgateId },
      include: { item: true },
    });

    if (!resgate) {
      return { error: "Solicitação de resgate não encontrada." };
    }

    // Se estiver cancelando o resgate, devolver os pontos via transação de crédito (estorno)
    if (novoStatus === "cancelado" && resgate.status !== "cancelado") {
      await prisma.$transaction(async (tx) => {
        await tx.rewardRedemption.update({
          where: { id: resgateId },
          data: { status: "cancelado" },
        });

        await tx.rewardTransaction.create({
          data: {
            empresaId: resgate.empresaId,
            tipo: "credito",
            evento: "estorno_resgate",
            pontos: resgate.pontosGastos,
            descricao: `Estorno do resgate cancelado: ${resgate.item.nome}`,
            referenciaId: resgate.id,
          },
        });

        // Devolver estoque se aplicável
        if (resgate.item.estoque !== null) {
          await tx.rewardCatalogItem.update({
            where: { id: resgate.itemId },
            data: { estoque: { increment: 1 } },
          });
        }
      });
    } else {
      await prisma.rewardRedemption.update({
        where: { id: resgateId },
        data: { status: novoStatus },
      });
    }

    revalidatePath("/admin/rewards");
    revalidatePath("/superadmin/rewards");
    return { success: true, message: `Status do resgate atualizado para '${novoStatus}'.` };
  } catch (err: any) {
    return { error: err?.message || "Erro ao alterar status do resgate." };
  }
}
