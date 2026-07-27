import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export async function getCurrentProfile() {
  // 1. Tenta recuperar usuário via Supabase Auth
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (user) {
      const profile = await prisma.profile.findFirst({
        where: {
          OR: [
            { id: user.id },
            { email: user.email ? user.email.toLowerCase() : "" },
          ],
        },
      });
      if (profile) return profile;
    }
  } catch {}

  // 2. Tenta recuperar via Cookie de Sessão Local / Demo Mode
  try {
    const cookieStore = cookies();
    const demoEmail = cookieStore.get("demo_user_email")?.value;
    const demoRole = cookieStore.get("demo_user_role")?.value;

    if (demoEmail) {
      const profile = await prisma.profile.findUnique({
        where: { email: demoEmail.toLowerCase() },
      });
      if (profile) return profile;
    }

    if (demoRole === "admin") {
      const adminProfile = await prisma.profile.findFirst({
        where: { role: "admin", status: "aprovado" },
      });
      if (adminProfile) return adminProfile;
    }
  } catch {}

  return null;
}
