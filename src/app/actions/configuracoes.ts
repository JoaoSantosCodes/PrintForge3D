"use server";

import { getCurrentProfile, getEmpresaIdAtual } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getConfiguracaoAction() {
  try {
    const empresaId = await getEmpresaIdAtual();
    let config = await prisma.configuracao.findUnique({
      where: { empresaId },
    });
    if (!config) {
      config = await prisma.configuracao.create({
        data: { empresaId },
      });
    }
    return { success: true, config };
  } catch (err: any) {
    return { error: err?.message || "Erro ao carregar configurações." };
  }
}

export async function saveChavePixAction(chavePix: string) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
      return { error: "Acesso restrito a administradores." };
    }
    const empresaId = await getEmpresaIdAtual();

    const config = await prisma.configuracao.upsert({
      where: { empresaId },
      create: { empresaId, chavePix: chavePix.trim() },
      update: { chavePix: chavePix.trim() },
    });

    if ((prisma as any).auditLog) {
      await (prisma as any).auditLog.create({
        data: {
          empresaId,
          adminId: profile.id,
          acao: "atualizou_chave_pix",
          detalhes: `Chave PIX atualizada para: "${chavePix.trim()}"`,
        },
      }).catch(() => {});
    }

    revalidatePath("/admin/configuracoes");
    revalidatePath("/pedidos");
    revalidatePath("/admin/pedidos");
    return { success: true, config, message: "Chave PIX atualizada com sucesso!" };
  } catch (err: any) {
    return { error: err?.message || "Erro ao salvar chave PIX." };
  }
}
