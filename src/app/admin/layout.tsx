import { Sidebar } from "@/components/admin/sidebar";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;
  } catch {}

  if (!user) {
    redirect("/login");
  }

  // Fetch profile to strictly verify role="admin" and status="aprovado"
  const profile = await prisma.profile.findFirst({
    where: {
      OR: [
        { id: user.id },
        { email: user.email ? user.email.toLowerCase() : "" },
      ],
    },
  });

  if (!profile || profile.role !== "admin" || profile.status !== "aprovado") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <main className="flex-1 p-8 max-w-7xl mx-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
