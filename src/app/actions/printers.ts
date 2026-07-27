"use server";

import { prisma } from "@/lib/prisma";
import { getEmpresaIdAtual } from "@/lib/auth-server";
import { checkPlanLimit } from "@/lib/plan-limits";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const printerSchema = z.object({
  nome: z.string().min(1, "O nome da impressora é obrigatório"),
  modelo: z.string().optional().nullable(),
  consumoWatts: z.coerce.number().min(0, "Consumo em Watts deve ser maior ou igual a 0"),
  preco: z.coerce.number().min(0, "Preço deve ser maior ou igual a 0"),
  vidaUtilHoras: z.coerce.number().min(1, "Vida útil deve ser de pelo menos 1 hora"),
  custoManutencaoAno: z.coerce.number().min(0, "Custo de manutenção deve ser maior ou igual a 0").default(0),
});

export async function createPrinterAction(formData: FormData) {
  try {
    const empresaId = await getEmpresaIdAtual();

    const limitCheck = await checkPlanLimit(empresaId, "impressoras");
    if (!limitCheck.allowed) {
      return { error: limitCheck.message };
    }

    const rawData = {
      nome: formData.get("nome"),
      modelo: formData.get("modelo") || null,
      consumoWatts: formData.get("consumoWatts"),
      preco: formData.get("preco"),
      vidaUtilHoras: formData.get("vidaUtilHoras"),
      custoManutencaoAno: formData.get("custoManutencaoAno") || 0,
    };

    const validated = printerSchema.parse(rawData);

    await prisma.printer.create({
      data: {
        empresaId,
        nome: validated.nome,
        modelo: validated.modelo,
        consumoWatts: validated.consumoWatts,
        preco: validated.preco,
        vidaUtilHoras: validated.vidaUtilHoras,
        custoManutencaoAno: validated.custoManutencaoAno,
      },
    });

    revalidatePath("/admin/impressoras");
    revalidatePath("/admin/pecas/nova");
    return { success: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.errors.map((e) => e.message).join(", ") };
    }
    return { error: err?.message || "Erro ao criar impressora." };
  }
}

export async function updatePrinterAction(id: string, formData: FormData) {
  try {
    const empresaId = await getEmpresaIdAtual();

    const rawData = {
      nome: formData.get("nome"),
      modelo: formData.get("modelo") || null,
      consumoWatts: formData.get("consumoWatts"),
      preco: formData.get("preco"),
      vidaUtilHoras: formData.get("vidaUtilHoras"),
      custoManutencaoAno: formData.get("custoManutencaoAno") || 0,
    };

    const validated = printerSchema.parse(rawData);

    // Garante que só atualiza se for da empresa atual
    const existing = await prisma.printer.findFirst({
      where: { id, empresaId },
    });
    if (!existing) {
      return { error: "Impressora não encontrada ou acesso não autorizado." };
    }

    await prisma.printer.update({
      where: { id },
      data: {
        nome: validated.nome,
        modelo: validated.modelo,
        consumoWatts: validated.consumoWatts,
        preco: validated.preco,
        vidaUtilHoras: validated.vidaUtilHoras,
        custoManutencaoAno: validated.custoManutencaoAno,
      },
    });

    revalidatePath("/admin/impressoras");
    return { success: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.errors.map((e) => e.message).join(", ") };
    }
    return { error: err?.message || "Erro ao atualizar impressora." };
  }
}

export async function deletePrinterAction(id: string) {
  try {
    const empresaId = await getEmpresaIdAtual();

    const existing = await prisma.printer.findFirst({
      where: { id, empresaId },
    });
    if (!existing) {
      return { error: "Impressora não encontrada ou acesso não autorizado." };
    }

    await prisma.printer.delete({
      where: { id },
    });
    revalidatePath("/admin/impressoras");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Erro ao excluir impressora." };
  }
}

export async function registrarManutencaoAction(id: string) {
  try {
    const empresaId = await getEmpresaIdAtual();

    const existing = await prisma.printer.findFirst({
      where: { id, empresaId },
    });
    if (!existing) {
      return { error: "Impressora não encontrada ou acesso não autorizado." };
    }

    await prisma.printer.update({
      where: { id },
      data: {
        horasUsoAcumuladas: 0,
        ultimaManutencao: new Date(),
      },
    });
    revalidatePath("/admin/impressoras");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Erro ao registrar manutenção da impressora." };
  }
}
