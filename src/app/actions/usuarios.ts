"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function aprovarUsuarioAction(id: string) {
  try {
    await prisma.profile.update({
      where: { id },
      data: {
        status: "aprovado",
        aprovadoEm: new Date(),
      },
    });
    revalidatePath("/admin/usuarios");
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

    // Buscar perfil para verificar e-mail do admin atual se ID for diferente
    const currentAdminProfile = currentUserId
      ? await prisma.profile.findUnique({ where: { id: currentUserId } })
      : null;

    const targetProfile = await prisma.profile.findUnique({ where: { id } });
    if (currentAdminProfile && targetProfile && currentAdminProfile.email === targetProfile.email) {
      return { error: "Você não pode bloquear seu próprio usuário administrador." };
    }

    await prisma.profile.update({
      where: { id },
      data: {
        status: "bloqueado",
      },
    });
    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Erro ao bloquear usuário." };
  }
}

export async function reativarUsuarioAction(id: string) {
  try {
    await prisma.profile.update({
      where: { id },
      data: {
        status: "aprovado",
      },
    });
    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Erro ao reativar usuário." };
  }
}
