"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentProfile, getEmpresaIdAtual } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const pedidoSchema = z.object({
  clienteNome: z.string().min(1, "O nome do cliente é obrigatório"),
  clienteContato: z.string().optional().nullable(),
  pecaId: z.string().min(1, "A peça é obrigatória"),
  quantidade: z.coerce.number().min(1, "Quantidade deve ser pelo menos 1"),
  precoAcordado: z.coerce.number().min(0, "Preço acordado deve ser maior ou igual a 0").optional().nullable(),
  status: z.enum([
    "pendente",
    "aguardando_pagamento",
    "em_impressao",
    "pintando",
    "pronto",
    "enviado",
    "entregue",
    "cancelado",
  ]),
});

export async function createPedidoAction(formData: FormData) {
  try {
    const empresaId = await getEmpresaIdAtual();

    const rawData = {
      clienteNome: formData.get("clienteNome"),
      clienteContato: formData.get("clienteContato") || null,
      pecaId: formData.get("pecaId"),
      quantidade: formData.get("quantidade") || 1,
      precoAcordado: formData.get("precoAcordado") || 0,
      status: formData.get("status") || "pendente",
    };

    const validated = pedidoSchema.parse(rawData);

    await prisma.pedido.create({
      data: {
        empresaId,
        clienteNome: validated.clienteNome,
        clienteContato: validated.clienteContato,
        pecaId: validated.pecaId,
        quantidade: validated.quantidade,
        precoAcordado: validated.precoAcordado || 0,
        status: validated.status,
      },
    });

    revalidatePath("/admin/pedidos");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.errors.map((e) => e.message).join(", ") };
    }
    return { error: err?.message || "Erro ao criar pedido." };
  }
}

export async function updatePedidoStatusAction(id: string, novoStatus: string) {
  try {
    const empresaId = await getEmpresaIdAtual();

    const existing = await prisma.pedido.findFirst({
      where: { id, empresaId },
    });

    if (!existing) {
      return { error: "Pedido não encontrado ou acesso não autorizado." };
    }

    await prisma.pedido.update({
      where: { id },
      data: { status: novoStatus },
    });

    if (novoStatus === "entregue" && existing.pago) {
      await checarPrimeiraVenda(empresaId, id);
    }

    revalidatePath("/admin/pedidos");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Erro ao atualizar status do pedido." };
  }
}

async function checarPrimeiraVenda(empresaId: string, pedidoId: string) {
  try {
    const totalEntreguesPagos = await prisma.pedido.count({
      where: { empresaId, status: "entregue", pago: true },
    });
    if (totalEntreguesPagos === 1) {
      const { concederPontos } = await import("@/lib/rewards");
      const referralEvent = await prisma.referralEvent.findFirst({
        where: { indicadoEmpresaId: empresaId },
      });
      if (referralEvent && referralEvent.indicadorEmpresaId) {
        await concederPontos(
          referralEvent.indicadorEmpresaId,
          "primeira_venda",
          pedidoId,
          "Bônus pela primeira venda realizada da empresa indicada"
        );
      }
    }
  } catch (err) {
    console.warn("Aviso ao checar primeira venda:", err);
  }
}

export async function updatePedidoAction(id: string, formData: FormData) {
  try {
    const empresaId = await getEmpresaIdAtual();

    const existing = await prisma.pedido.findFirst({
      where: { id, empresaId },
    });

    if (!existing) {
      return { error: "Pedido não encontrado ou acesso não autorizado." };
    }

    const rawData = {
      clienteNome: formData.get("clienteNome"),
      clienteContato: formData.get("clienteContato") || null,
      pecaId: formData.get("pecaId"),
      quantidade: formData.get("quantidade") || 1,
      precoAcordado: formData.get("precoAcordado") || 0,
      status: formData.get("status") || existing.status,
    };

    const validated = pedidoSchema.parse(rawData);

    await prisma.pedido.update({
      where: { id },
      data: {
        clienteNome: validated.clienteNome,
        clienteContato: validated.clienteContato,
        pecaId: validated.pecaId,
        quantidade: validated.quantidade,
        precoAcordado: validated.precoAcordado || 0,
        status: validated.status,
      },
    });

    revalidatePath("/admin/pedidos");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.errors.map((e) => e.message).join(", ") };
    }
    return { error: err?.message || "Erro ao atualizar pedido." };
  }
}

export async function deletePedidoAction(id: string) {
  try {
    const empresaId = await getEmpresaIdAtual();

    const existing = await prisma.pedido.findFirst({
      where: { id, empresaId },
    });
    if (!existing) {
      return { error: "Pedido não encontrado ou acesso não autorizado." };
    }

    await prisma.pedido.delete({
      where: { id },
    });
    revalidatePath("/admin/pedidos");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Erro ao excluir pedido." };
  }
}

export async function confirmarPagamentoAction(pedidoId: string, pago: boolean = true) {
  try {
    const empresaId = await getEmpresaIdAtual();

    const existing = await prisma.pedido.findFirst({
      where: { id: pedidoId, empresaId },
    });
    if (!existing) {
      return { error: "Pedido não encontrado ou acesso não autorizado." };
    }

    await prisma.pedido.update({
      where: { id: pedidoId },
      data: { pago },
    });

    revalidatePath("/admin/pedidos");
    revalidatePath("/pedidos");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Erro ao atualizar status de pagamento." };
  }
}

export async function criarPedidoClienteAction(
  pecaId: string,
  quantidade: number,
  observacoes?: string,
  cupomCodigo?: string,
  precoBaseUnitario?: number
) {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;

    if (!user) {
      return { error: "Você precisa estar logado para fazer um pedido." };
    }

    const profile = await prisma.profile.findFirst({
      where: {
        OR: [
          { id: user.id },
          { email: user.email ? user.email.toLowerCase() : "" },
        ],
      },
    });

    if (!profile || profile.status !== "aprovado") {
      return { error: "Sua conta precisa estar aprovada por um administrador para realizar pedidos." };
    }

    const peca = await prisma.peca.findUnique({ where: { id: pecaId } });
    if (!peca) {
      return { error: "Peça não encontrada." };
    }

    let precoFinalUnitario = precoBaseUnitario || null;
    let cupomValido = null;

    if (cupomCodigo) {
      const codeClean = cupomCodigo.trim().toUpperCase();
      const cupom = await prisma.cupom.findFirst({
        where: { codigo: codeClean, empresaId: peca.empresaId },
      });
      if (cupom && cupom.ativo && (!cupom.validoAte || new Date() <= new Date(cupom.validoAte))) {
        cupomValido = cupom.codigo;
        if (precoFinalUnitario) {
          const desconto = (precoFinalUnitario * cupom.percentualDesconto) / 100;
          precoFinalUnitario = Math.max(0, precoFinalUnitario - desconto);
        }
      }
    }

    const valorTotalAcordado = precoFinalUnitario ? precoFinalUnitario * Math.max(1, quantidade) : 0;

    const novoPedido = await prisma.pedido.create({
      data: {
        empresaId: peca.empresaId,
        clienteNome: profile.nome || profile.email,
        clienteContato: profile.email,
        usuarioId: profile.id,
        pecaId: peca.id,
        quantidade: Math.max(1, quantidade || 1),
        precoAcordado: valorTotalAcordado || 0,
        cupomCodigo: cupomValido,
        status: "pendente",
        pago: false,
      },
    });

    revalidatePath("/pedidos");
    revalidatePath("/admin/pedidos");
    revalidatePath("/admin");
    return { success: true, pedidoId: novoPedido.id };
  } catch (err: any) {
    return { error: err?.message || "Erro ao criar pedido." };
  }
}

export async function cancelarPedidoClienteAction(pedidoId: string) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return { error: "Não autorizado." };

    await prisma.pedido.updateMany({
      where: { id: pedidoId, usuarioId: profile.id },
      data: { status: "cancelado" },
    });

    revalidatePath("/pedidos");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Erro ao cancelar pedido." };
  }
}

export async function avaliarPedidoAction(pedidoId: string, nota: number, comentario?: string) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return { error: "Usuário não autenticado." };
    }

    revalidatePath("/pedidos");
    return { success: true, message: "Obrigado por sua avaliação!" };
  } catch (err: any) {
    return { error: err?.message || "Erro ao enviar avaliação." };
  }
}
