import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import UsuariosClientPage from "./usuarios-client";

export const dynamic = "force-dynamic";

export default async function AdminUsuariosPage() {
  let currentUserId: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    currentUserId = data?.user?.id || null;
  } catch {}

  const usuarios = await prisma.profile.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <UsuariosClientPage
      usuarios={usuarios}
      currentUserId={currentUserId}
    />
  );
}
