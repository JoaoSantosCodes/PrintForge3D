"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getEmpresaIdAtual } from "@/lib/auth-server";
import { checkPlanLimit } from "@/lib/plan-limits";
import { enviarEmailMudancaStatus } from "@/lib/email";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const pedidoSchema = z.object({
  clienteNome: z.string().min(1, "O nome do cliente é obrigatório"),
  clienteContato: z.string().optional().nullable(),
  pecaId: z.string().min(1, "Selecione uma peça"),
  quantidade: z.coerce.number().int().min(1, "Quantidade deve ser no mínimo 1"),
  precoAcordado: z.coerce.number().optional().nullable(),
  status: z.string().default("pendente"),
  observacoes: z.string().optional().nullable(),
});

export async function createPedidoAction(formData: FormData) {
  try {
    const empresaId = await getEmpresaIdAtual();

    const limitCheck = await checkPlanLimit(empresaId, "pedidos");
    if (!limitCheck.allowed) {
      return { error: limitCheck.message };
    }

    const rawData = {
      clienteNome: formData.get("clienteNome"),
      clienteContato: formData.get("clienteContato") || null,
      pecaId: formData.get("pecaId"),
      quantidade: formData.get("quantidade") || 1,
      precoAcordado: formData.get("precoAcordado") ? Number(formData.get("precoAcordado")) : null,
      status: formData.get("status") || "pendente",
      observacoes: formData.get("observacoes") || null,
    };

    const validated = pedidoSchema.parse(rawData);

    await prisma.pedido.create({
      data: {
        empresaId,
        clienteNome: validated.clienteNome,
        clienteContato: validated.clienteContato,
        pecaId: validated.pecaId,
        quantidade: validated.quantidade,
        precoAcordado: validated.precoAcordado,
        status: validated.status,
        observacoes: validated.observacoes,
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

export async function updatePedidoStatusAction(id: string, newStatus: string) {
  try {
    const empresaId = await getEmpresaIdAtual();

    const existing = await prisma.pedido.findFirst({
      where: { id, empresaId },
    });
    if (!existing) {
      return { error: "Pedido não encontrado ou acesso não autorizado." };
    }

    const updatedPedido = await prisma.pedido.update({
      where: { id },
      data: { status: newStatus },
      include: {
        peca: { select: { nome: true } },
        usuario: { select: { email: true, nome: true } },
      },
    });

    const targetEmail =
      updatedPedido.usuario?.email ||
      (updatedPedido.clienteContato && updatedPedido.clienteContato.includes("@")
        ? updatedPedido.clienteContato
        : null);

    if (targetEmail) {
      enviarEmailMudancaStatus({
        toEmail: targetEmail,
        clienteNome: updatedPedido.usuario?.nome || updatedPedido.clienteNome,
        pecaNome: updatedPedido.peca.nome,
        novoStatus: newStatus,
        pedidoId: updatedPedido.id,
      }).catch((err) => console.warn("⚠️ Error in email trigger:", err));
    }

    revalidatePath("/admin/pedidos");
    revalidatePath("/admin");
    revalidatePath("/pedidos");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Erro ao atualizar status do pedido." };
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
      precoAcordado: formData.get("precoAcordado") ? Number(formData.get("precoAcordado")) : null,
      status: formData.get("status") || "pendente",
      observacoes: formData.get("observacoes") || null,
    };

    const validated = pedidoSchema.parse(rawData);

    await prisma.pedido.update({
      where: { id },
      data: {
        clienteNome: validated.clienteNome,
        clienteContato: validated.clienteContato,
        pecaId: validated.pecaId,
        quantidade: validated.quantidade,
        precoAcordado: validated.precoAcordado,
        status: validated.status,
        observacoes: validated.observacoes,
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

    const valorTotalAcordado = precoFinalUnitario ? precoFinalUnitario * Math.max(1, quantidade) : null;

    const novoPedido = await prisma.pedido.create({
      data: {
        empresaId: peca.empresaId,
        clienteNome: profile.nome || profile.email,
        clienteContato: profile.email,
        usuarioId: profile.id,
        pecaId: peca.id,
        quantidade: Math.max(1, quantidade || 1),
        precoAcordado: valorTotalAcordado,
        cupomCodigo: cupomValido,
        observacoes: observacoes || null,
        status: "pendente",
        pago: false,
      },
    });

    revalidatePath("/pedidos");
    revalidatePath("/admin/pedidos");
    revalidatePath("/admin");

    return { success: true, pedidoId: novoPedido.id };
  } catch (err: any) {
    return { error: err?.message || "Erro ao solicitar pedido." };
  }
}

export async function cancelarPedidoClienteAction(pedidoId: string) {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;

    if (!user) {
      return { error: "Você precisa estar logado para cancelar um pedido." };
    }

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
    });

    if (!pedido) {
      return { error: "Pedido não encontrado." };
    }

    if (pedido.status !== "pendente") {
      return { error: "Este pedido já entrou em produção e não pode mais ser cancelado." };
    }

    await prisma.pedido.update({
      where: { id: pedidoId },
      data: { status: "cancelado" },
    });

    revalidatePath("/pedidos");
    revalidatePath("/admin/pedidos");
    revalidatePath("/admin");

    return { success: true, message: "Pedido cancelado com sucesso." };
  } catch (err: any) {
    return { error: err?.message || "Erro ao cancelar pedido." };
  }
}

export async function avaliarPedidoAction(pedidoId: string, nota: number, comentario?: string) {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;

    if (!user) {
      return { error: "Você precisa estar logado para avaliar." };
    }

    if (!nota || nota < 1 || nota > 5) {
      return { error: "Selecione uma nota de 1 a 5 estrelas." };
    }

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: { avaliacao: true },
    });

    if (!pedido) {
      return { error: "Pedido não encontrado." };
    }

    if (pedido.status !== "entregue") {
      return { error: "Você só pode avaliar pedidos que já foram entregues." };
    }

    if (pedido.avaliacao) {
      return { error: "Este pedido já foi avaliado anteriormente." };
    }

    await prisma.avaliacao.create({
      data: {
        pedidoId: pedido.id,
        nota: Math.round(nota),
        comentario: comentario ? comentario.trim() : null,
      },
    });

    revalidatePath("/pedidos");

    return { success: true, message: "Obrigado por sua avaliação!" };
  } catch (err: any) {
    return { error: err?.message || "Erro ao enviar avaliação." };
  }
}
