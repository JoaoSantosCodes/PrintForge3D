"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";

// In-memory rate limiting map for login attempts (5 attempts per minute)
const loginAttemptsMap = new Map<string, { count: number; resetTime: number }>();

const cadastroSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Endereço de e-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export async function cadastroAction(formData: FormData) {
  try {
    const rawData = {
      nome: formData.get("nome"),
      email: (formData.get("email") as string || "").trim().toLowerCase(),
      password: formData.get("password"),
    };

    const v = cadastroSchema.parse(rawData);

    const supabase = await createClient();

    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: v.email,
      password: v.password,
      options: {
        data: { nome: v.nome },
      },
    });

    if (authError) {
      return { error: authError.message || "Erro ao realizar cadastro no serviço de autenticação." };
    }

    const authUserId = authData.user?.id || `user_${Date.now()}`;

    // 2. Criar Profile no Prisma com role="usuario" e status="pendente"
    await prisma.profile.upsert({
      where: { email: v.email },
      create: {
        id: authUserId,
        email: v.email,
        nome: v.nome,
        role: "usuario",
        status: "pendente",
      },
      update: {
        nome: v.nome,
      },
    });

    // Desconectar sessão automática se tiver sido iniciada pelo Supabase signUp
    await supabase.auth.signOut().catch(() => {});

    return {
      success: true,
      message: "Seu cadastro foi enviado e aguarda aprovação de um administrador.",
    };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.errors.map((e) => e.message).join(", ") };
    }
    return { error: err?.message || "Erro ao realizar cadastro." };
  }
}

export async function loginAction(formData: FormData) {
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const password = formData.get("password") as string;
  const targetRedirect = (formData.get("redirectTo") as string) || "";

  if (!email || !password) {
    return { error: "Email e senha são obrigatórios." };
  }

  // 1. Rate Limiting Check (5 attempts / 60s)
  const now = Date.now();
  const userAttempt = loginAttemptsMap.get(email);
  if (userAttempt) {
    if (now < userAttempt.resetTime) {
      if (userAttempt.count >= 5) {
        const remainingSeconds = Math.ceil((userAttempt.resetTime - now) / 1000);
        return {
          error: `Muitas tentativas de login falhas. Aguarde ${remainingSeconds} segundos antes de tentar novamente.`,
        };
      }
    } else {
      loginAttemptsMap.delete(email);
    }
  }

  const recordFailedAttempt = () => {
    const current = loginAttemptsMap.get(email);
    if (!current || Date.now() > current.resetTime) {
      loginAttemptsMap.set(email, { count: 1, resetTime: Date.now() + 60000 });
    } else {
      current.count += 1;
    }
  };

  // 2. Autenticação via Supabase Auth
  let authUser: any = null;
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      recordFailedAttempt();
      return { error: authError.message || "Falha na autenticação. Verifique suas credenciais." };
    }
    authUser = authData.user;
  } catch (err: any) {
    recordFailedAttempt();
    return { error: "Erro ao conectar com servidor de autenticação." };
  }

  // 3. Verificação do Profile no Prisma
  let profile = await prisma.profile.findUnique({
    where: { email },
  });

  if (!profile && authUser) {
    // Se o usuário existe no Supabase Auth mas ainda não tem perfil no Prisma
    profile = await prisma.profile.create({
      data: {
        id: authUser.id,
        email: authUser.email || email,
        nome: authUser.user_metadata?.nome || email.split("@")[0],
        role: "usuario",
        status: "pendente",
      },
    });
  }

  if (!profile || profile.status === "pendente") {
    // Fazer logout no Supabase para não manter cookies de sessão ativos
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {}
    return {
      error: "Sua conta ainda está aguardando aprovação de um administrador.",
    };
  }

  if (profile.status === "bloqueado") {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {}
    return {
      error: "Sua conta foi bloqueada. Entre em contato com o administrador.",
    };
  }

  // Se aprovado, sucesso!
  loginAttemptsMap.delete(email);

  if (profile.role === "admin") {
    redirect(targetRedirect.startsWith("/admin") ? targetRedirect : "/admin");
  } else {
    redirect(targetRedirect || "/catalogo");
  }
}

export async function logoutAction() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {}
  redirect("/login");
}
