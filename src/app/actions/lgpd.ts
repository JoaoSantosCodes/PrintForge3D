"use server";

import { getCurrentProfile, getEmpresaIdAtualOptional } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function exportUserDataAction() {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return { error: "Usuário não autenticado." };
    }

    const pedidos = await prisma.pedido.findMany({
      where: { usuarioId: profile.id },
      include: {
        peca: {
          select: { nome: true, categoria: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const exportPayload = {
      termo: "Exportação de Dados Pessoais - LGPD (Lei nº 13.709/2018)",
      dataExportacao: new Date().toISOString(),
      usuario: {
        id: profile.id,
        nome: profile.nome,
        email: profile.email,
        role: profile.role,
        status: profile.status,
        criadoEm: profile.createdAt,
      },
      historicoPedidos: pedidos.map((p) => ({
        id: p.id,
        dataPedido: p.createdAt,
        peca: p.peca?.nome || "Peça Personalizada",
        categoria: p.peca?.categoria || "N/A",
        quantidade: p.quantidade,
        precoAcordado: p.precoAcordado,
        status: p.status,
        pago: p.pago,
      })),
    };

    return { success: true, data: exportPayload };
  } catch (err: any) {
    return { error: err?.message || "Erro ao exportar dados." };
  }
}

export async function requestAccountDeletionAction(motivo?: string) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return { error: "Usuário não autenticado." };
    }

    const existingPending = await prisma.solicitacaoExclusao.findFirst({
      where: { usuarioId: profile.id, status: "pendente" },
    });

    if (existingPending) {
      return { error: "Você já possui uma solicitação de exclusão em análise pelo administrador." };
    }

    await prisma.solicitacaoExclusao.create({
      data: {
        usuarioId: profile.id,
        email: profile.email,
        motivo: motivo || "Solicitação realizada pelo painel do usuário.",
        status: "pendente",
      },
    });

    revalidatePath("/perfil");
    revalidatePath("/admin/perfil");
    return { success: true, message: "Sua solicitação de exclusão de conta foi enviada com sucesso ao administrador." };
  } catch (err: any) {
    return { error: err?.message || "Erro ao solicitar exclusão da conta." };
  }
}

export async function resolveDeletionRequestAction(requestId: string, status: "concluido" | "rejeitado") {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
      return { error: "Acesso restrito a administradores." };
    }

    await prisma.solicitacaoExclusao.update({
      where: { id: requestId },
      data: { status },
    });

    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Erro ao atualizar solicitação." };
  }
}
