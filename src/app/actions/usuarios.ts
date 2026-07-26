"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getAdminIdFromSession() {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return data.user?.id || "admin-system";
  } catch {
    return "admin-system";
  }
}

async function registrarAuditLog(acao: string, alvoId?: string, detalhes?: string) {
  try {
    const adminId = await getAdminIdFromSession();
    await prisma.auditLog.create({
      data: {
        adminId,
        acao,
        alvoId,
        detalhes,
      },
    });
  } catch (err) {
    console.warn("⚠️ Falha ao gravar AuditLog:", err);
  }
}

export async function aprovarUsuarioAction(id: string) {
  try {
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
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const currentUserId = data.user?.id;

    if (currentUserId && currentUserId === id) {
      return { error: "Você não pode bloquear seu próprio usuário administrador." };
    }

    const currentAdminProfile = currentUserId
      ? await prisma.profile.findUnique({ where: { id: currentUserId } })
      : null;

    const targetProfile = await prisma.profile.findUnique({ where: { id } });
    if (currentAdminProfile && targetProfile && currentAdminProfile.email === targetProfile.email) {
      return { error: "Você não pode bloquear seu próprio usuário administrador." };
    }

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
    const count = await prisma.profile.count({
      where: { status: "pendente" },
    });
    return { count };
  } catch (err: any) {
    return { count: 0 };
  }
}
