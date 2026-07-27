"use server";

import { getCurrentProfile, getEmpresaIdAtual } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCupomAction(formData: FormData) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
      return { error: "Acesso restrito a administradores." };
    }
    const empresaId = await getEmpresaIdAtual();

    const codigo = (formData.get("codigo") as string || "").trim().toUpperCase();
    const percentualDesconto = parseFloat(formData.get("percentualDesconto") as string || "0");
    const validoAteStr = formData.get("validoAte") as string;

    if (!codigo) {
      return { error: "O código do cupom é obrigatório." };
    }
    if (isNaN(percentualDesconto) || percentualDesconto <= 0 || percentualDesconto > 100) {
      return { error: "O percentual de desconto deve estar entre 1% e 100%." };
    }

    const existing = await prisma.cupom.findFirst({
      where: { codigo, empresaId },
    });
    if (existing) {
      return { error: "Já existe um cupom cadastrado com este código nesta empresa." };
    }

    const validoAte = validoAteStr ? new Date(validoAteStr) : null;

    const cupom = await prisma.cupom.create({
      data: {
        empresaId,
        codigo,
        percentualDesconto,
        validoAte,
        ativo: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        empresaId,
        adminId: profile.id,
        acao: "criou_cupom",
        detalhes: `Cupom ${codigo} de ${percentualDesconto}% de desconto criado.`,
      },
    });

    revalidatePath("/admin/cupons");
    return { success: true, cupom, message: `Cupom ${codigo} criado com sucesso!` };
  } catch (err: any) {
    return { error: err?.message || "Erro ao criar cupom." };
  }
}

export async function toggleCupomAction(id: string) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
      return { error: "Acesso restrito a administradores." };
    }
    const empresaId = await getEmpresaIdAtual();

    const current = await prisma.cupom.findFirst({ where: { id, empresaId } });
    if (!current) return { error: "Cupom não encontrado." };

    const cupom = await prisma.cupom.update({
      where: { id },
      data: { ativo: !current.ativo },
    });

    revalidatePath("/admin/cupons");
    return { success: true, cupom };
  } catch (err: any) {
    return { error: err?.message || "Erro ao alterar status do cupom." };
  }
}

export async function deleteCupomAction(id: string) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
      return { error: "Acesso restrito a administradores." };
    }
    const empresaId = await getEmpresaIdAtual();

    const current = await prisma.cupom.findFirst({ where: { id, empresaId } });
    if (!current) return { error: "Cupom não encontrado." };

    await prisma.cupom.delete({ where: { id } });

    revalidatePath("/admin/cupons");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Erro ao excluir cupom." };
  }
}

export async function validarCupomAction(codigo: string, empresaId?: string) {
  try {
    const codeClean = (codigo || "").trim().toUpperCase();
    if (!codeClean) return { error: "Informe o código do cupom." };

    const whereCondition: any = { codigo: codeClean };
    if (empresaId) {
      whereCondition.empresaId = empresaId;
    }

    const cupom = await prisma.cupom.findFirst({
      where: whereCondition,
    });

    if (!cupom || !cupom.ativo) {
      return { error: "Cupom inválido ou inativo." };
    }

    if (cupom.validoAte && new Date() > new Date(cupom.validoAte)) {
      return { error: "Este cupom já expirou." };
    }

    return {
      success: true,
      cupom: {
        codigo: cupom.codigo,
        percentualDesconto: cupom.percentualDesconto,
      },
    };
  } catch (err: any) {
    return { error: "Erro ao validar cupom." };
  }
}
