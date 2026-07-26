"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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
      message: "Enviamos um e-mail de confirmação. Confirme seu e-mail antes de aguardar aprovação do administrador.",
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
      const msg = authError.message || "";
      if (msg.toLowerCase().includes("email not confirmed") || msg.toLowerCase().includes("email_not_confirmed")) {
        return { error: "Confirme seu e-mail antes de entrar." };
      }
      return { error: msg || "Falha na autenticação. Verifique suas credenciais." };
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

  loginAttemptsMap.delete(email);

  if (profile.role === "admin") {
    redirect(targetRedirect.startsWith("/admin") ? targetRedirect : "/admin");
  } else {
    redirect(targetRedirect || "/catalogo");
  }
}

export async function solicitarRecuperacaoSenhaAction(email: string) {
  try {
    if (!email || !email.includes("@")) {
      return { error: "Informe um e-mail válido." };
    }
    const supabase = await createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${siteUrl}/redefinir-senha`,
    });

    if (error) {
      return { error: error.message || "Erro ao solicitar recuperação de senha." };
    }

    return {
      success: true,
      message: "Enviamos as instruções de redefinição de senha para seu e-mail.",
    };
  } catch (err: any) {
    return { error: err?.message || "Erro ao solicitar recuperação de senha." };
  }
}

export async function redefinirSenhaAction(newPassword: string) {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { error: "A nova senha deve ter no mínimo 6 caracteres." };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error: error.message || "Erro ao redefinir a senha." };
    }

    return {
      success: true,
      message: "Sua senha foi redefinida com sucesso! Você já pode fazer login.",
    };
  } catch (err: any) {
    return { error: err?.message || "Erro ao redefinir a senha." };
  }
}

export async function atualizarPerfilAction(nome: string, newPassword?: string) {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;

    if (!user) {
      return { error: "Usuário não autenticado." };
    }

    if (!nome || nome.trim().length < 2) {
      return { error: "O nome deve ter no mínimo 2 caracteres." };
    }

    const nomeTrimmed = nome.trim();

    // 1. Atualizar nome no Prisma
    await prisma.profile.updateMany({
      where: {
        OR: [{ id: user.id }, { email: user.email ? user.email.toLowerCase() : "" }],
      },
      data: { nome: nomeTrimmed },
    });

    // 2. Atualizar user_metadata no Supabase Auth
    await supabase.auth.updateUser({
      data: { nome: nomeTrimmed },
    });

    // 3. Atualizar senha se informada
    if (newPassword && newPassword.trim().length > 0) {
      if (newPassword.trim().length < 6) {
        return { error: "A nova senha deve ter no mínimo 6 caracteres." };
      }
      const { error: pwdError } = await supabase.auth.updateUser({
        password: newPassword.trim(),
      });
      if (pwdError) {
        return { error: `Nome atualizado, mas ocorreu um erro ao redefinir a senha: ${pwdError.message}` };
      }
    }

    revalidatePath("/perfil");
    revalidatePath("/admin");
    revalidatePath("/catalogo");
    return { success: true, message: "Perfil atualizado com sucesso!" };
  } catch (err: any) {
    return { error: err?.message || "Erro ao atualizar perfil." };
  }
}

export async function logoutAction() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {}
  redirect("/login");
}
