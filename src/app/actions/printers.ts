"use server";

import { prisma } from "@/lib/prisma";
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
    const rawData = {
      nome: formData.get("nome"),
      modelo: formData.get("modelo") || null,
      consumoWatts: formData.get("consumoWatts"),
      preco: formData.get("preco"),
      vidaUtilHoras: formData.get("vidaUtilHoras"),
      custoManutencaoAno: formData.get("custoManutencaoAno") || 0,
    };

    const validated = printerSchema.parse(rawData);

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
