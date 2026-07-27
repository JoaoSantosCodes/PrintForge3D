import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/auth-server";
import UsuariosClientPage from "./usuarios-client";

export const dynamic = "force-dynamic";

export default async function AdminUsuariosPage() {
  let currentUserId: string | null = null;
  try {
    const profile = await getCurrentProfile();
    currentUserId = profile?.id || null;
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
