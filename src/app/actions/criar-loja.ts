"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const criarLojaSchema = z.object({
  nomeEmpresa: z.string().min(2, "Nome da empresa é obrigatório"),
  slug: z
    .string()
    .min(2, "Slug é obrigatório")
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  nomeResponsavel: z.string().min(2, "Nome do responsável é obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  planoId: z.string().optional(),
});

export async function criarLojaAction(formData: FormData) {
  try {
    const rawData = {
      nomeEmpresa: formData.get("nomeEmpresa"),
      slug: (formData.get("slug") as string || "").trim().toLowerCase(),
      nomeResponsavel: formData.get("nomeResponsavel"),
      email: (formData.get("email") as string || "").trim().toLowerCase(),
      password: formData.get("password"),
      planoId: formData.get("planoId") as string | undefined,
    };

    const v = criarLojaSchema.parse(rawData);

    // 1. Validar se o slug é reservado
    const reservedSlugs = [
      "admin",
      "superadmin",
      "login",
      "cadastro",
      "catalogo",
      "loja",
      "api",
      "perfil",
      "pedidos",
      "criar-loja",
      "esqueci-senha",
      "redefinir-senha",
      "termos",
      "privacidade",
    ];
    if (reservedSlugs.includes(v.slug)) {
      return { error: "Este nome não está disponível" };
    }

    // 2. Validar disponibilidade do slug no banco
    const existingEmpresa = await prisma.empresa.findUnique({
      where: { slug: v.slug },
    });
    if (existingEmpresa) {
      return { error: "Este nome não está disponível" };
    }

    // 2. Buscar ou selecionar plano
    let plano = v.planoId
      ? await prisma.plano.findUnique({ where: { id: v.planoId } })
      : null;

    if (!plano) {
      plano = await prisma.plano.findFirst({
        where: { ativo: true },
        orderBy: { precoMensal: "asc" },
      });
    }

    if (!plano) {
      // Se não houver plano no banco, cria o plano Starter padrão
      plano = await prisma.plano.create({
        data: {
          nome: "Starter",
          slug: "starter",
          precoMensal: 49.9,
          limiteImpressoras: 3,
          limitePecas: 20,
          limitePedidosMes: 50,
          limiteUsuarios: 2,
          ativo: true,
        },
      });
    }

    const supabase = await createClient();

    // 3. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: v.email,
      password: v.password,
      options: {
        data: { nome: v.nomeResponsavel },
      },
    });

    if (authError) {
      return { error: authError.message || "Erro ao criar conta de usuário no sistema." };
    }

    const authUserId = authData.user?.id || `user_${Date.now()}`;

    // 4. Data de expiração do trial (14 dias)
    const trialExpiraEm = new Date();
    trialExpiraEm.setDate(trialExpiraEm.getDate() + 14);

    // 5. Criar Empresa no Prisma
    const novaEmpresa = await prisma.empresa.create({
      data: {
        nome: v.nomeEmpresa,
        slug: v.slug,
        planoId: plano.id,
        status: "trial",
        trialExpiraEm,
      },
    });

    // 6. Criar Perfil de Admin vinculado à nova Empresa
    await prisma.profile.upsert({
      where: { email: v.email },
      create: {
        id: authUserId,
        email: v.email,
        nome: v.nomeResponsavel,
        role: "admin",
        status: "aprovado",
        empresaId: novaEmpresa.id,
      },
      update: {
        nome: v.nomeResponsavel,
        role: "admin",
        status: "aprovado",
        empresaId: novaEmpresa.id,
      },
    });

    // 7. Criar Configuração da Empresa
    await prisma.configuracao.create({
      data: {
        empresaId: novaEmpresa.id,
      },
    });

    // Sign in automatically
    await supabase.auth.signInWithPassword({
      email: v.email,
      password: v.password,
    });

    return { success: true, redirectUrl: "/admin" };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.errors.map((e) => e.message).join(", ") };
    }
    return { error: err?.message || "Erro ao criar a loja." };
  }
}
