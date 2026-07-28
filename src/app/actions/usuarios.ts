"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentProfile, getEmpresaIdAtual } from "@/lib/auth-server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function registrarAuditLog(acao: string, alvoId?: string, detalhes?: string) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return;
    const empresaId = profile.empresaId || "";
    if ((prisma as any).auditLog) {
      await (prisma as any).auditLog.create({
        data: {
          empresaId,
          adminId: profile.id,
          acao,
          alvoId,
          detalhes,
        },
      });
    }
  } catch (err) {
    console.warn("⚠️ Falha ao gravar AuditLog:", err);
  }
}

export async function aprovarUsuarioAction(id: string) {
  try {
    const empresaId = await getEmpresaIdAtual();
    const existing = await prisma.profile.findFirst({
      where: { id, empresaId },
    });
    if (!existing) return { error: "Usuário não encontrado nesta empresa." };

    const targetUser = await prisma.profile.update({
      where: { id },
      data: {
        status: "aprovado",
        aprovadoEm: new Date(),
      },
    });

    await registrarAuditLog(
      "aprovou_usuario",
      id,
      `Aprovou o acesso do usuário ${targetUser.nome || targetUser.email} (${targetUser.email})`
    );

    revalidatePath("/admin/usuarios");
    revalidatePath("/admin/auditoria");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Erro ao aprovar usuário." };
  }
}

export async function bloquearUsuarioAction(id: string) {
  try {
    const empresaId = await getEmpresaIdAtual();
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const currentUserId = data.user?.id;

    if (currentUserId && currentUserId === id) {
      return { error: "Você não pode bloquear seu próprio usuário administrador." };
    }

    const existing = await prisma.profile.findFirst({
      where: { id, empresaId },
    });
    if (!existing) return { error: "Usuário não encontrado nesta empresa." };

    const targetUser = await prisma.profile.update({
      where: { id },
      data: {
        status: "bloqueado",
      },
    });

    await registrarAuditLog(
      "bloqueou_usuario",
      id,
      `Bloqueou o acesso do usuário ${targetUser.nome || targetUser.email} (${targetUser.email})`
    );

    revalidatePath("/admin/usuarios");
    revalidatePath("/admin/auditoria");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Erro ao bloquear usuário." };
  }
}

export async function reativarUsuarioAction(id: string) {
  try {
    const empresaId = await getEmpresaIdAtual();
    const existing = await prisma.profile.findFirst({
      where: { id, empresaId },
    });
    if (!existing) return { error: "Usuário não encontrado nesta empresa." };

    const targetUser = await prisma.profile.update({
      where: { id },
      data: {
        status: "aprovado",
      },
    });

    await registrarAuditLog(
      "reativou_usuario",
      id,
      `Reativou o acesso do usuário ${targetUser.nome || targetUser.email} (${targetUser.email})`
    );

    revalidatePath("/admin/usuarios");
    revalidatePath("/admin/auditoria");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Erro ao reativar usuário." };
  }
}

export async function getPendingUsersCountAction() {
  try {
    const empresaId = await getEmpresaIdAtual();
    const count = await prisma.profile.count({
      where: { status: "pendente", empresaId },
    });
    return { count };
  } catch (err: any) {
    return { count: 0 };
  }
}
