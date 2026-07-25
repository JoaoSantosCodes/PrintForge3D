"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const filamentSchema = z.object({
  marca: z.string().optional().nullable(),
  tipo: z.string().min(1, "O tipo do filamento é obrigatório (PLA, PETG, Resina, etc)"),
  cor: z.string().min(1, "A cor é obrigatória"),
  precoPorKg: z.coerce.number().min(0, "Preço por kg deve ser maior ou igual a 0"),
  pesoRestanteGramas: z.coerce.number().min(0, "Peso restante deve ser >= 0").default(1000),
});

export async function createFilamentAction(formData: FormData) {
  try {
    const rawData = {
      marca: formData.get("marca") || null,
      tipo: formData.get("tipo"),
      cor: formData.get("cor"),
      precoPorKg: formData.get("precoPorKg"),
      pesoRestanteGramas: formData.get("pesoRestanteGramas") || 1000,
    };

    const validated = filamentSchema.parse(rawData);

    await prisma.filament.create({
      data: {
        marca: validated.marca,
        tipo: validated.tipo,
        cor: validated.cor,
        precoPorKg: validated.precoPorKg,
        pesoRestanteGramas: validated.pesoRestanteGramas,
      },
    });

    revalidatePath("/admin/filamentos");
    revalidatePath("/admin/pecas/nova");
    return { success: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.errors.map((e) => e.message).join(", ") };
    }
    return { error: err?.message || "Erro ao criar filamento." };
  }
}

export async function updateFilamentAction(id: string, formData: FormData) {
  try {
    const rawData = {
      marca: formData.get("marca") || null,
      tipo: formData.get("tipo"),
      cor: formData.get("cor"),
      precoPorKg: formData.get("precoPorKg"),
      pesoRestanteGramas: formData.get("pesoRestanteGramas") || 1000,
    };

    const validated = filamentSchema.parse(rawData);

    const existing = await prisma.filament.findUnique({ where: { id } });
    if (existing && existing.precoPorKg !== validated.precoPorKg) {
      await prisma.filamentPriceHistory.create({
        data: {
          filamentId: id,
          precoPorKg: existing.precoPorKg,
        },
      });
    }

    await prisma.filament.update({
      where: { id },
      data: {
        marca: validated.marca,
        tipo: validated.tipo,
        cor: validated.cor,
        precoPorKg: validated.precoPorKg,
        pesoRestanteGramas: validated.pesoRestanteGramas,
      },
    });

    revalidatePath("/admin/filamentos");
    return { success: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.errors.map((e) => e.message).join(", ") };
    }
    return { error: err?.message || "Erro ao atualizar filamento." };
  }
}

export async function deleteFilamentAction(id: string) {
  try {
    await prisma.filament.delete({
      where: { id },
    });
    revalidatePath("/admin/filamentos");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Erro ao excluir filamento." };
  }
}

export async function getLowStockCountAction() {
  try {
    const filaments = await prisma.filament.findMany({
      select: { pesoRestanteGramas: true },
    });
    const lowStockCount = filaments.filter(
      (f) => (f.pesoRestanteGramas ?? 1000) < 150
    ).length;
    return { lowStockCount };
  } catch (err) {
    return { lowStockCount: 0 };
  }
}
