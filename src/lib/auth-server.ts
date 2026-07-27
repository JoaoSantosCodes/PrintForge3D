import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export async function getCurrentProfile() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      return null;
    }

    const user = data.user;
    const profile = await prisma.profile.findFirst({
      where: {
        OR: [
          { id: user.id },
          { email: user.email ? user.email.toLowerCase() : "" },
        ],
      },
    }).catch(() => null);

    return profile;
  } catch (err) {
    return null;
  }
}
