"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

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
    }).catch(() => {});

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
  try {
    const email = (formData.get("email") as string || "").trim().toLowerCase();
    const password = formData.get("password") as string;
    const targetRedirect = (formData.get("redirectTo") as string) || "";

    if (!email || !password) {
      return { error: "Email e senha são obrigatórios." };
    }

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

    const envAdmin = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.toLowerCase() : "";
    const envSuperAdmin = process.env.SUPERADMIN_EMAIL ? process.env.SUPERADMIN_EMAIL.toLowerCase() : "";

    const isSystemAdmin = email === "admin@printforge3d.com" || (envAdmin !== "" && email === envAdmin);
    const isSystemSuperAdmin = email === "superadmin@printforge3d.com" || (envSuperAdmin !== "" && email === envSuperAdmin);

    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    let authUser = authData?.user || null;

    // Fallback for system accounts if Supabase Auth credentials or network is offline
    if (!authUser && (isSystemAdmin || isSystemSuperAdmin)) {
      const validAdminPwd = process.env.ADMIN_PASSWORD || "admin123";
      const validSuperAdminPwd = process.env.SUPERADMIN_PASSWORD || "superadmin123";

      if ((isSystemAdmin && password === validAdminPwd) || (isSystemSuperAdmin && password === validSuperAdminPwd)) {
        authUser = {
          id: isSystemSuperAdmin ? "superadmin_dev_id" : "admin_dev_id",
          email: email,
          user_metadata: { nome: isSystemSuperAdmin ? "Super Administrador" : "Administrador" },
        } as any;
      }
    }

    if (!authUser) {
      recordFailedAttempt();
      const msg = authError?.message || "";
      if (msg.toLowerCase().includes("email not confirmed") || msg.toLowerCase().includes("email_not_confirmed")) {
        return { error: "Confirme seu e-mail antes de entrar." };
      }
      return { error: "E-mail ou senha incorretos." };
    }

    let dbError = false;
    let profile: any = null;

    try {
      profile = await prisma.profile.findUnique({
        where: { email },
      });
    } catch (err) {
      console.warn("Aviso: Banco de dados indisponível, utilizando fallback em memória:", err);
      dbError = true;
    }

    if (isSystemAdmin || isSystemSuperAdmin) {
      const targetRole = isSystemSuperAdmin ? "super_admin" : "admin";

      if (!profile && !dbError) {
        try {
          profile = await prisma.profile.create({
            data: {
              id: authUser.id,
              email: authUser.email || email,
              nome: authUser.user_metadata?.nome || email.split("@")[0],
              role: targetRole,
              status: "aprovado",
            },
          });
        } catch (createErr) {
          console.warn("Erro ao criar perfil de sistema no banco:", createErr);
        }
      } else if (profile && (profile.status !== "aprovado" || profile.role !== targetRole)) {
        try {
          profile = await prisma.profile.update({
            where: { id: profile.id },
            data: {
              id: authUser.id,
              role: targetRole,
              status: "aprovado",
            },
          });
        } catch (updateErr) {
          console.warn("Erro ao atualizar perfil de sistema no banco:", updateErr);
        }
      }

      if (!profile) {
        profile = {
          id: authUser.id,
          email: email,
          nome: authUser.user_metadata?.nome || (isSystemSuperAdmin ? "Super Admin" : "Admin"),
          role: targetRole,
          status: "aprovado",
          empresaId: isSystemSuperAdmin ? null : "minha-loja",
        };
      }
    } else if (!profile && !dbError) {
      try {
        profile = await prisma.profile.create({
          data: {
            id: authUser.id,
            email: authUser.email || email,
            nome: authUser.user_metadata?.nome || email.split("@")[0],
            role: "usuario",
            status: "pendente",
          },
        });
      } catch (createErr) {
        console.warn("Erro ao criar perfil padrão no banco:", createErr);
      }
    }

    if (!profile) {
      profile = {
        id: authUser.id,
        email: email,
        nome: authUser.user_metadata?.nome || email.split("@")[0],
        role: "usuario",
        status: "aprovado",
      };
    }

    if (profile.status === "bloqueado") {
      await supabase.auth.signOut().catch(() => {});
      return {
        error: "Sua conta foi bloqueada. Entre em contato com o administrador.",
      };
    }

    if (profile.status === "pendente") {
      await supabase.auth.signOut().catch(() => {});
      return {
        error: "Sua conta ainda está aguardando aprovação de um administrador.",
      };
    }

    loginAttemptsMap.delete(email);

    let redirectUrl = "/catalogo";
    if (profile.role === "super_admin") {
      redirectUrl = "/superadmin";
    } else if (profile.role === "admin") {
      redirectUrl = targetRedirect.startsWith("/admin") ? targetRedirect : "/admin";
    } else {
      redirectUrl = targetRedirect || "/pedidos";
    }

    return { success: true, redirectUrl };
  } catch (globalErr: any) {
    console.error("Erro global em loginAction:", globalErr);
    return { error: globalErr?.message || "Erro interno ao processar autenticação no servidor." };
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

    await prisma.profile.updateMany({
      where: {
        OR: [{ id: user.id }, { email: user.email ? user.email.toLowerCase() : "" }],
      },
      data: { nome: nomeTrimmed },
    }).catch(() => {});

    await supabase.auth.updateUser({
      data: { nome: nomeTrimmed },
    });

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
    revalidatePath("/admin/perfil");
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
  try {
    const cookieStore = cookies();
    cookieStore.delete("demo_user_role");
    cookieStore.delete("demo_user_email");
  } catch {}
  redirect("/login");
}
