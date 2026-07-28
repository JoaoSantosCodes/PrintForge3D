"use server";

import { getCurrentProfile } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { concederPontos } from "@/lib/rewards";

async function verifySuperAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "super_admin") {
    throw new Error("Acesso negado. Apenas super_admin pode executar esta ação.");
  }
  return profile;
}

// 1. Marcar mensalidade como paga
export async function marcarMensalidadePagaAction(empresaId: string) {
  try {
    await verifySuperAdmin();

    const proximaCobranca = new Date();
    proximaCobranca.setDate(proximaCobranca.getDate() + 30);

    const empresa = await prisma.empresa.update({
      where: { id: empresaId },
      data: {
        status: "ativo",
        proximaCobranca,
      },
    });

    // Processar pontuação do PrintForge Rewards
    const referralEvent = await prisma.referralEvent.findFirst({
      where: { indicadoEmpresaId: empresaId },
    });

    if (referralEvent) {
      if (referralEvent.status !== "assinatura_paga") {
        await prisma.referralEvent.update({
          where: { id: referralEvent.id },
          data: { status: "assinatura_paga" },
        });
        await concederPontos(
          referralEvent.indicadorEmpresaId,
          "primeira_assinatura",
          referralEvent.id,
          `Bônus pela primeira assinatura paga da empresa ${empresa.nome}`
        );
      } else {
        await concederPontos(
          referralEvent.indicadorEmpresaId,
          "renovacao_mensal",
          `${referralEvent.id}_renovacao_${proximaCobranca.toISOString().substring(0, 7)}`,
          `Bônus por renovação mensal da empresa ${empresa.nome}`
        );
      }
    }

    revalidatePath("/superadmin");
    revalidatePath("/superadmin/empresas");
    revalidatePath("/admin/rewards");
    return { success: true, message: `Mensalidade da empresa ${empresa.nome} renovada até ${proximaCobranca.toLocaleDateString('pt-BR')}` };
  } catch (err: any) {
    return { error: err?.message || "Erro ao marcar mensalidade como paga." };
  }
}

// 2. Alterar status da empresa manualmente
export async function alterarStatusEmpresaAction(empresaId: string, novoStatus: string) {
  try {
    await verifySuperAdmin();

    const statusValidos = ["trial", "ativo", "inadimplente", "cancelado", "bloqueado", "trial_expirado"];
    if (!statusValidos.includes(novoStatus)) {
      return { error: "Status inválido." };
    }

    const empresa = await prisma.empresa.update({
      where: { id: empresaId },
      data: { status: novoStatus },
    });

    revalidatePath("/superadmin");
    revalidatePath("/superadmin/empresas");
    return { success: true, message: `Status da empresa ${empresa.nome} alterado para ${novoStatus}.` };
  } catch (err: any) {
    return { error: err?.message || "Erro ao alterar status da empresa." };
  }
}

// 3. Trocar plano da empresa manualmente
export async function alterarPlanoEmpresaAction(empresaId: string, planoId: string) {
  try {
    await verifySuperAdmin();

    const plano = await prisma.plano.findUnique({ where: { id: planoId } });
    if (!plano) return { error: "Plano não encontrado." };

    const empresa = await prisma.empresa.update({
      where: { id: empresaId },
      data: { planoId: plano.id },
    });

    const referralEvent = await prisma.referralEvent.findFirst({
      where: { indicadoEmpresaId: empresaId },
    });

    if (referralEvent) {
      await concederPontos(
        referralEvent.indicadorEmpresaId,
        "upgrade_plano",
        `${empresaId}_upgrade_${planoId}`,
        `Bônus por upgrade de plano da empresa ${empresa.nome}`
      );
    }

    revalidatePath("/superadmin");
    revalidatePath("/superadmin/empresas");
    revalidatePath("/admin/rewards");
    return { success: true, message: `Plano da empresa ${empresa.nome} alterado para ${plano.nome}.` };
  } catch (err: any) {
    return { error: err?.message || "Erro ao alterar plano da empresa." };
  }
}

// 4. CRUD de Planos
const planoSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, "Nome do plano é obrigatório"),
  slug: z.string().min(1, "Slug do plano é obrigatório"),
  precoMensal: z.coerce.number().min(0, "Preço mensal deve ser >= 0"),
  limiteImpressoras: z.coerce.number().int().min(1, "Limite de impressoras deve ser >= 1"),
  limitePecas: z.coerce.number().int().min(1, "Limite de peças deve ser >= 1"),
  limitePedidosMes: z.coerce.number().int().min(1, "Limite de pedidos por mês deve ser >= 1"),
  limiteUsuarios: z.coerce.number().int().min(1, "Limite de usuários deve ser >= 1").default(5),
  ativo: z.boolean().default(true),
});

export async function savePlanoAction(formData: FormData) {
  try {
    await verifySuperAdmin();

    const rawData = {
      id: formData.get("id") as string || undefined,
      nome: formData.get("nome"),
      slug: (formData.get("slug") as string || "").trim().toLowerCase(),
      precoMensal: formData.get("precoMensal"),
      limiteImpressoras: formData.get("limiteImpressoras"),
      limitePecas: formData.get("limitePecas"),
      limitePedidosMes: formData.get("limitePedidosMes"),
      limiteUsuarios: formData.get("limiteUsuarios") || 5,
      ativo: formData.get("ativo") === "true",
    };

    const v = planoSchema.parse(rawData);

    if (v.id) {
      await prisma.plano.update({
        where: { id: v.id },
        data: {
          nome: v.nome,
          slug: v.slug,
          precoMensal: v.precoMensal,
          limiteImpressoras: v.limiteImpressoras,
          limitePecas: v.limitePecas,
          limitePedidosMes: v.limitePedidosMes,
          limiteUsuarios: v.limiteUsuarios,
          ativo: v.ativo,
        },
      });
    } else {
      await prisma.plano.create({
        data: {
          nome: v.nome,
          slug: v.slug,
          precoMensal: v.precoMensal,
          limiteImpressoras: v.limiteImpressoras,
          limitePecas: v.limitePecas,
          limitePedidosMes: v.limitePedidosMes,
          limiteUsuarios: v.limiteUsuarios,
          ativo: v.ativo,
        },
      });
    }

    revalidatePath("/superadmin/planos");
    revalidatePath("/criar-loja");
    return { success: true, message: "Plano salvo com sucesso!" };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.errors.map((e) => e.message).join(", ") };
    }
    return { error: err?.message || "Erro ao salvar plano." };
  }
}

export async function deletePlanoAction(id: string) {
  try {
    await verifySuperAdmin();

    const count = await prisma.empresa.count({ where: { planoId: id } });
    if (count > 0) {
      return { error: `Não é possível excluir este plano pois ele está associado a ${count} empresa(s).` };
    }

    await prisma.plano.delete({ where: { id } });

    revalidatePath("/superadmin/planos");
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Erro ao excluir plano." };
  }
}

// 5. GESTÃO DE USUÁRIOS (SUPER-ADMIN)

export async function criarUsuarioSuperAdminAction(formData: FormData) {
  try {
    await verifySuperAdmin();

    const nome = (formData.get("nome") as string || "").trim();
    const email = (formData.get("email") as string || "").trim().toLowerCase();
    const password = (formData.get("password") as string || "").trim();
    const role = (formData.get("role") as string || "admin");
    const status = (formData.get("status") as string || "aprovado");
    const empresaId = (formData.get("empresaId") as string || "").trim();

    if (!email || !email.includes("@")) {
      return { error: "Informe um e-mail válido." };
    }

    if (!password || password.length < 6) {
      return { error: "A senha deve ter no mínimo 6 caracteres." };
    }

    // Verificar se já existe perfil com este e-mail
    let existing: any = null;
    try {
      existing = await prisma.profile.findFirst({
        where: { email },
        select: { id: true, email: true },
      });
    } catch (findErr) {
      console.warn("Aviso ao verificar e-mail de perfil:", findErr);
    }

    if (existing) {
      return { error: "Já existe um usuário cadastrado com este e-mail." };
    }

    let authUserId = `user_${Date.now()}`;

    // Provisionar no Supabase Auth via Service Role se disponível
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRoleKey && !supabaseUrl.includes("placeholder")) {
      try {
        const { createClient: createAdminClient } = await import("@supabase/supabase-js");
        const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        // Verificar se usuário já existe no Supabase Auth
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
        const existingAuthUser = usersData?.users?.find(
          (u) => u.email?.toLowerCase() === email
        );

        if (existingAuthUser) {
          authUserId = existingAuthUser.id;
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingAuthUser.id, {
            password,
            email_confirm: true,
            user_metadata: { nome: nome || email.split("@")[0] },
          });

          if (updateError) {
            return { error: `Erro ao atualizar a senha no Supabase Auth: ${updateError.message}` };
          }
        } else {
          const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { nome: nome || email.split("@")[0] },
          });

          if (created?.user) {
            authUserId = created.user.id;
          } else if (createError) {
            return { error: `Erro ao criar usuário no Supabase Auth: ${createError.message}` };
          }
        }
      } catch (authErr: any) {
        return { error: `Erro ao integrar com Supabase Auth: ${authErr?.message || authErr}` };
      }
    }

    let profile: any = null;
    try {
      profile = await prisma.profile.create({
        data: {
          id: authUserId,
          email,
          nome: nome || email.split("@")[0],
          role,
          status,
          empresaId: empresaId ? empresaId : null,
          aprovadoEm: status === "aprovado" ? new Date() : null,
        },
      });
    } catch (createErr: any) {
      console.warn("Aviso ao criar perfil Prisma (desalinhamento de colunas no Postgres):", createErr?.message);
      try {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "Profile" ("id", "email", "nome", "role", "status") VALUES ($1, $2, $3, $4, $5)`,
          authUserId,
          email,
          nome || email.split("@")[0],
          role,
          status
        );
        profile = { id: authUserId, email, nome: nome || email.split("@")[0], role, status };
      } catch (rawErr: any) {
        return { error: `Erro no banco de dados: ${rawErr?.message || "Não foi possível cadastrar o perfil."}` };
      }
    }

    revalidatePath("/superadmin/usuarios");
    revalidatePath("/superadmin");
    return { success: true, message: `Usuário ${profile.email} criado com sucesso!` };
  } catch (err: any) {
    return { error: err?.message || "Erro ao criar usuário pelo Super-Admin." };
  }
}

export async function aprovarUsuarioSuperAdminAction(id: string) {
  try {
    await verifySuperAdmin();

    const user = await prisma.profile.update({
      where: { id },
      data: {
        status: "aprovado",
        aprovadoEm: new Date(),
      },
    });

    revalidatePath("/superadmin/usuarios");
    revalidatePath("/superadmin");
    revalidatePath("/admin/usuarios");
    return { success: true, message: `Usuário ${user.nome || user.email} aprovado com sucesso!` };
  } catch (err: any) {
    return { error: err?.message || "Erro ao aprovar usuário." };
  }
}

export async function alterarStatusUsuarioSuperAdminAction(id: string, novoStatus: string) {
  try {
    await verifySuperAdmin();

    const statusValidos = ["aprovado", "pendente", "bloqueado"];
    if (!statusValidos.includes(novoStatus)) {
      return { error: "Status inválido." };
    }

    const user = await prisma.profile.update({
      where: { id },
      data: { status: novoStatus },
    });

    revalidatePath("/superadmin/usuarios");
    revalidatePath("/superadmin");
    return { success: true, message: `Status do usuário ${user.email} alterado para ${novoStatus}.` };
  } catch (err: any) {
    return { error: err?.message || "Erro ao alterar status do usuário." };
  }
}

export async function alterarRoleUsuarioSuperAdminAction(id: string, novaRole: string) {
  try {
    await verifySuperAdmin();

    const rolesValidas = ["super_admin", "admin", "usuario"];
    if (!rolesValidas.includes(novaRole)) {
      return { error: "Papel/Role inválido." };
    }

    const user = await prisma.profile.update({
      where: { id },
      data: { role: novaRole },
    });

    revalidatePath("/superadmin/usuarios");
    revalidatePath("/superadmin");
    return { success: true, message: `Papel do usuário ${user.email} alterado para ${novaRole}.` };
  } catch (err: any) {
    return { error: err?.message || "Erro ao alterar perfil do usuário." };
  }
}

export async function vincularEmpresaUsuarioSuperAdminAction(id: string, empresaId: string | null) {
  try {
    await verifySuperAdmin();

    if (empresaId) {
      const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
      if (!empresa) return { error: "Empresa não encontrada." };
    }

    const user = await prisma.profile.update({
      where: { id },
      data: { empresaId: empresaId || null },
    });

    revalidatePath("/superadmin/usuarios");
    return { success: true, message: `Vínculo de empresa do usuário ${user.email} atualizado.` };
  } catch (err: any) {
    return { error: err?.message || "Erro ao vincular empresa ao usuário." };
  }
}

export async function deleteUsuarioSuperAdminAction(id: string) {
  try {
    const currentAdmin = await verifySuperAdmin();
    if (currentAdmin.id === id) {
      return { error: "Você não pode excluir sua própria conta de Super-Admin." };
    }

    await prisma.profile.delete({ where: { id } });

    revalidatePath("/superadmin/usuarios");
    revalidatePath("/superadmin");
    return { success: true, message: "Usuário excluído com sucesso." };
  } catch (err: any) {
    return { error: err?.message || "Erro ao excluir usuário." };
  }
}

export async function concluirSolicitacaoExclusaoSuperAdminAction(id: string, acao: "concluir" | "rejeitar") {
  try {
    await verifySuperAdmin();

    const novoStatus = acao === "concluir" ? "concluido" : "rejeitado";
    await prisma.solicitacaoExclusao.update({
      where: { id },
      data: { status: novoStatus },
    });

    revalidatePath("/superadmin/usuarios");
    return { success: true, message: `Solicitação de exclusão marcada como ${novoStatus}.` };
  } catch (err: any) {
    return { error: err?.message || "Erro ao processar solicitação de exclusão." };
  }
}
