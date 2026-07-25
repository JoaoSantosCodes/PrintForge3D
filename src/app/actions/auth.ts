"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// In-memory rate limiting map for login attempts (5 attempts per minute)
const loginAttemptsMap = new Map<string, { count: number; resetTime: number }>();

export async function loginAction(formData: FormData) {
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirectTo") as string) || "/admin";

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
      // Reset window expired
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

  // 2. DEMO MODE Gate Check
  const isDemoModeEnabled = process.env.DEMO_MODE === "true";

  const isDemoUser =
    (email === "admin@printforge3d.com" ||
      email === "admin@printforge.com" ||
      email === "admin") &&
    (password === "admin123" || password === "admin");

  if (isDemoUser) {
    if (!isDemoModeEnabled) {
      recordFailedAttempt();
      return {
        error: "O Modo Demo de autenticação está desativado neste ambiente (DEMO_MODE !== true). Use a autenticação oficial.",
      };
    }

    // Success in Demo Mode
    loginAttemptsMap.delete(email);
    const cookieStore = cookies();
    cookieStore.set("printforge_dev_admin", "true", { path: "/" });
    redirect(redirectTo);
  }

  // 3. Real Supabase Auth Flow
  let supabaseSuccess = false;
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      recordFailedAttempt();
      return { error: error.message || "Falha na autenticação. Verifique suas credenciais." };
    }
    supabaseSuccess = true;
  } catch (err: any) {
    recordFailedAttempt();
    return { error: "Erro ao conectar com servidor de autenticação." };
  }

  if (supabaseSuccess) {
    loginAttemptsMap.delete(email);
    redirect(redirectTo);
  }
}


export async function logoutAction() {
  const cookieStore = cookies();
  cookieStore.delete("printforge_dev_admin");
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {}
  redirect("/login");
}

