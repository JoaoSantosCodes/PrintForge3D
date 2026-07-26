"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
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

export async function criarPedidoClienteAction(pecaId: string, quantidade: number, observacoes?: string) {
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

    const novoPedido = await prisma.pedido.create({
      data: {
        clienteNome: profile.nome || profile.email,
        clienteContato: profile.email,
        usuarioId: profile.id,
        pecaId: peca.id,
        quantidade: Math.max(1, quantidade || 1),
        observacoes: observacoes || null,
        status: "pendente",
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
