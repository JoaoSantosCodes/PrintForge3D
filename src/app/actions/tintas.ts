"use server";

import { prisma } from "@/lib/prisma";
import { getEmpresaIdAtual } from "@/lib/auth-server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const tintaSchema = z.object({
  nome: z.string().min(1, "O nome da tinta/insumo é obrigatório"),
  marca: z.string().optional().nullable(),
  tipo: z.string().min(1, "O tipo é obrigatório (Acrílica, Spray, Primer, Verniz, etc)"),
  cor: z.string().optional().nullable(),
  volumeMl: z.coerce.number().min(0, "O volume em ml deve ser maior ou igual a 0"),
  preco: z.coerce.number().min(0, "O preço de compra deve ser maior ou igual a 0"),
});

export async function createTintaAction(formData: FormData) {
  try {
    const empresaId = await getEmpresaIdAtual();

    const rawData = {
      nome: formData.get("nome"),
      marca: formData.get("marca") || null,
      tipo: formData.get("tipo"),
      cor: formData.get("cor") || null,
      volumeMl: formData.get("volumeMl"),
      preco: formData.get("preco"),
    };

    const validated = tintaSchema.parse(rawData);

    await prisma.tinta.create({
      data: {
        empresaId,
        nome: validated.nome,
        marca: validated.marca,
        tipo: validated.tipo,
        cor: validated.cor,
        volumeMl: validated.volumeMl,
        preco: validated.preco,
      },
    });

    revalidatePath("/admin/tintas");
    revalidatePath("/admin/pecas/nova");
    return { success: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.errors.map((e) => e.message).join(", ") };
    }
    return { error: err?.message || "Erro ao cadastrar tinta/insumo." };
  }
}

export async function updateTintaAction(id: string, formData: FormData) {
  try {
    const empresaId = await getEmpresaIdAtual();

    const rawData = {
      nome: formData.get("nome"),
      marca: formData.get("marca") || null,
      tipo: formData.get("tipo"),
      cor: formData.get("cor") || null,
      volumeMl: formData.get("volumeMl"),
      preco: formData.get("preco"),
    };

    const validated = tintaSchema.parse(rawData);

    const existing = await prisma.tinta.findFirst({
      where: { id, empresaId },
    });
    if (!existing) {
      return { error: "Tinta não encontrada ou acesso não autorizado." };
    }

    await prisma.tinta.update({
      where: { id },
      data: {
        nome: validated.nome,
        marca: validated.marca,
        tipo: validated.tipo,
        cor: validated.cor,
        volumeMl: validated.volumeMl,
        preco: validated.preco,
      },
    });

    revalidatePath("/admin/tintas");
    revalidatePath("/admin/pecas/nova");
    return { success: true };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.errors.map((e) => e.message).join(", ") };
    }
    return { error: err?.message || "Erro ao atualizar tinta/insumo." };
  }
}

export async function deleteTintaAction(id: string) {
  try {
    const empresaId = await getEmpresaIdAtual();

    const existing = await prisma.tinta.findFirst({
      where: { id, empresaId },
    });
    if (!existing) {
      return { error: "Tinta não encontrada ou acesso não autorizado." };
    }

    await prisma.tinta.delete({
      where: { id },
    });
    revalidatePath("/admin/tintas");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Erro ao excluir tinta/insumo." };
  }
}
