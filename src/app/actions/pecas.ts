"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getEmpresaIdAtual } from "@/lib/auth-server";
import { checkPlanLimit } from "@/lib/plan-limits";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const pecaSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, "O nome da peça é obrigatório"),
  descricao: z.string().optional().nullable(),
  categoria: z.string().optional().nullable(),
  fotoUrl: z.string().optional().nullable(),
  publicada: z.boolean().default(false),
  status: z.enum(["em_producao", "pronta", "vendida"]).default("em_producao"),

  // Custo de Impressão
  printerId: z.string().min(1, "Selecione uma impressora"),
  filamentId: z.string().min(1, "Selecione um filamento"),
  pesoGramas: z.coerce.number().min(0.01, "Peso em gramas deve ser maior que 0"),
  tempoHorasImpressao: z.coerce.number().min(0.01, "Tempo de impressão em horas deve ser maior que 0"),
  tarifaEnergiaKwh: z.coerce.number().min(0, "Tarifa de energia deve ser maior ou igual a 0"),

  // Custo de Pintura
  custoTintas: z.coerce.number().min(0).default(0),
  tempoHorasPintura: z.coerce.number().min(0).default(0),
  valorHoraMaoDeObra: z.coerce.number().min(0).default(0),

  // Custo de Embalagem
  materialEmbalagemDescricao: z.string().optional().nullable(),
  custoUnitarioEmbalagem: z.coerce.number().min(0).default(0),
});

export async function uploadFotoToSupabase(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null;

  try {
    const supabase = await createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `pecas/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("pecas-fotos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.warn("Aviso ao fazer upload no Supabase Storage (tentando fallback local/dataUrl):", uploadError.message);
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    const { data } = supabase.storage.from("pecas-fotos").getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.warn("Erro no upload de foto, utilizando fallback data URL", err);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:${file.type};base64,${buffer.toString("base64")}`;
  }
}

export async function savePecaAction(formData: FormData) {
  try {
    const empresaId = await getEmpresaIdAtual();

    const pecaId = formData.get("id") as string | null;
    const fotoFile = formData.get("fotoFile") as File | null;
    let fotoUrl = (formData.get("fotoUrl") as string) || null;

    if (fotoFile && fotoFile.size > 0) {
      const uploadedUrl = await uploadFotoToSupabase(fotoFile);
      if (uploadedUrl) {
        fotoUrl = uploadedUrl;
      }
    }

    const rawData = {
      id: pecaId || undefined,
      nome: formData.get("nome"),
      descricao: formData.get("descricao") || null,
      categoria: formData.get("categoria") || null,
      fotoUrl,
      publicada: formData.get("publicada") === "true",
      status: (formData.get("status") as string) || "em_producao",

      printerId: formData.get("printerId"),
      filamentId: formData.get("filamentId"),
      pesoGramas: formData.get("pesoGramas"),
      tempoHorasImpressao: formData.get("tempoHorasImpressao"),
      tarifaEnergiaKwh: formData.get("tarifaEnergiaKwh"),

      custoTintas: formData.get("custoTintas") || 0,
      tempoHorasPintura: formData.get("tempoHorasPintura") || 0,
      valorHoraMaoDeObra: formData.get("valorHoraMaoDeObra") || 0,

      materialEmbalagemDescricao: formData.get("materialEmbalagemDescricao") || null,
      custoUnitarioEmbalagem: formData.get("custoUnitarioEmbalagem") || 0,
    };

    const v = pecaSchema.parse(rawData);

    let peca;

    if (v.id) {
      // Edit mode - verify ownership
      const existing = await prisma.peca.findFirst({
        where: { id: v.id, empresaId },
      });
      if (!existing) {
        return { error: "Peça não encontrada ou acesso não autorizado." };
      }

      peca = await prisma.peca.update({
        where: { id: v.id },
        data: {
          nome: v.nome,
          descricao: v.descricao,
          categoria: v.categoria,
          fotoUrl: v.fotoUrl,
          publicada: v.publicada,
          status: v.status,
          custoImpressao: {
            upsert: {
              create: {
                printerId: v.printerId,
                filamentId: v.filamentId,
                pesoGramas: v.pesoGramas,
                tempoHoras: v.tempoHorasImpressao,
                tarifaEnergiaKwh: v.tarifaEnergiaKwh,
              },
              update: {
                printerId: v.printerId,
                filamentId: v.filamentId,
                pesoGramas: v.pesoGramas,
                tempoHoras: v.tempoHorasImpressao,
                tarifaEnergiaKwh: v.tarifaEnergiaKwh,
              },
            },
          },
          custoPintura: {
            upsert: {
              create: {
                custoTintas: v.custoTintas,
                tempoHoras: v.tempoHorasPintura,
                valorHoraMaoDeObra: v.valorHoraMaoDeObra,
              },
              update: {
                custoTintas: v.custoTintas,
                tempoHoras: v.tempoHorasPintura,
                valorHoraMaoDeObra: v.valorHoraMaoDeObra,
              },
            },
          },
          custoEmbalagem: {
            upsert: {
              create: {
                materialDescricao: v.materialEmbalagemDescricao,
                custoUnitario: v.custoUnitarioEmbalagem,
              },
              update: {
                materialDescricao: v.materialEmbalagemDescricao,
                custoUnitario: v.custoUnitarioEmbalagem,
              },
            },
          },
        },
      });
    } else {
      // Create mode - verify plan limit
      const limitCheck = await checkPlanLimit(empresaId, "pecas");
      if (!limitCheck.allowed) {
        return { error: limitCheck.message };
      }

      const countPecasAntes = await prisma.peca.count({ where: { empresaId } });

      peca = await prisma.peca.create({
        data: {
          empresaId,
          nome: v.nome,
          descricao: v.descricao,
          categoria: v.categoria,
          fotoUrl: v.fotoUrl,
          publicada: v.publicada,
          status: v.status,
          custoImpressao: {
            create: {
              printerId: v.printerId,
              filamentId: v.filamentId,
              pesoGramas: v.pesoGramas,
              tempoHoras: v.tempoHorasImpressao,
              tarifaEnergiaKwh: v.tarifaEnergiaKwh,
            },
          },
          custoPintura: {
            create: {
              custoTintas: v.custoTintas,
              tempoHoras: v.tempoHorasPintura,
              valorHoraMaoDeObra: v.valorHoraMaoDeObra,
            },
          },
          custoEmbalagem: {
            create: {
              materialDescricao: v.materialEmbalagemDescricao,
              custoUnitario: v.custoUnitarioEmbalagem,
            },
          },
        },
      });

      if (countPecasAntes === 0) {
        const { concederPontos } = await import("@/lib/rewards");
        const referralEvent = await prisma.referralEvent.findFirst({
          where: { indicadoEmpresaId: empresaId },
        });
        if (referralEvent && referralEvent.indicadorEmpresaId) {
          await concederPontos(
            referralEvent.indicadorEmpresaId,
            "primeiro_produto",
            peca.id,
            "Bônus pelo primeiro produto cadastrado pela empresa indicada"
          );
        }
      }
    }

    if (v.printerId && v.tempoHorasImpressao > 0) {
      await prisma.printer.updateMany({
        where: { id: v.printerId, empresaId },
        data: {
          horasTrabalhadas: { increment: v.tempoHorasImpressao },
        },
      }).catch(() => {});
    }

    if (v.filamentId && v.pesoGramas > 0) {
      const fil = await prisma.filament.findFirst({ where: { id: v.filamentId, empresaId } });
      if (fil) {
        const novoPeso = Math.max(0, fil.pesoRestanteGramas - v.pesoGramas);
        await prisma.filament.update({
          where: { id: v.filamentId },
          data: { pesoRestanteGramas: novoPeso },
        });
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/pecas");
    revalidatePath("/admin/filamentos");
    return { success: true, pecaId: peca.id };
  } catch (err: any) {
    console.error("Erro ao salvar peça:", err);
    if (err instanceof z.ZodError) {
      return { error: err.errors.map((e) => e.message).join(", ") };
    }
    return { error: err?.message || "Erro ao salvar a peça." };
  }
}

export async function togglePublicacaoAction(id: string, publicada: boolean) {
  try {
    const empresaId = await getEmpresaIdAtual();
    const existing = await prisma.peca.findFirst({ where: { id, empresaId } });
    if (!existing) return { error: "Peça não encontrada ou acesso não autorizado." };

    await prisma.peca.update({
      where: { id },
      data: { publicada },
    });
    revalidatePath("/admin/pecas");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Erro ao alterar visibilidade pública." };
  }
}

export async function updateStatusAction(id: string, status: string) {
  try {
    const empresaId = await getEmpresaIdAtual();
    const existing = await prisma.peca.findFirst({ where: { id, empresaId } });
    if (!existing) return { error: "Peça não encontrada ou acesso não autorizado." };

    await prisma.peca.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/admin/pecas");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Erro ao atualizar status." };
  }
}

export async function deletePecaAction(id: string) {
  try {
    const empresaId = await getEmpresaIdAtual();
    const existing = await prisma.peca.findFirst({ where: { id, empresaId } });
    if (!existing) return { error: "Peça não encontrada ou acesso não autorizado." };

    await prisma.peca.delete({
      where: { id },
    });
    revalidatePath("/admin/pecas");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Erro ao excluir peça." };
  }
}

export async function duplicarPecaAction(id: string) {
  try {
    const empresaId = await getEmpresaIdAtual();
    const original = await prisma.peca.findFirst({
      where: { id, empresaId },
      include: {
        custoImpressao: true,
        custoPintura: true,
        custoEmbalagem: true,
      },
    });

    if (!original) {
      return { error: "Peça original não encontrada." };
    }

    const novaPeca = await prisma.peca.create({
      data: {
        empresaId,
        nome: `${original.nome} (cópia)`,
        descricao: original.descricao,
        categoria: original.categoria,
        fotoUrl: original.fotoUrl,
        publicada: false,
        status: "em_producao",
        custoImpressao: original.custoImpressao
          ? {
              create: {
                printerId: original.custoImpressao.printerId,
                filamentId: original.custoImpressao.filamentId,
                pesoGramas: original.custoImpressao.pesoGramas,
                tempoHoras: original.custoImpressao.tempoHoras,
                tarifaEnergiaKwh: original.custoImpressao.tarifaEnergiaKwh,
              },
            }
          : undefined,
        custoPintura: original.custoPintura
          ? {
              create: {
                custoTintas: original.custoPintura.custoTintas,
                tempoHoras: original.custoPintura.tempoHoras,
                valorHoraMaoDeObra: original.custoPintura.valorHoraMaoDeObra,
              },
            }
          : undefined,
        custoEmbalagem: original.custoEmbalagem
          ? {
              create: {
                materialDescricao: original.custoEmbalagem.materialDescricao,
                custoUnitario: original.custoEmbalagem.custoUnitario,
              },
            }
          : undefined,
      },
    });

    revalidatePath("/admin/pecas");
    return { success: true, newId: novaPeca.id };
  } catch (err: any) {
    return { error: err?.message || "Erro ao duplicar peça." };
  }
}
