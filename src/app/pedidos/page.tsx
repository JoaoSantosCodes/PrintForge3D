import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PublicNavbar } from "@/components/catalogo/navbar";
import { PedidosUsuarioClient } from "./pedidos-usuario-client";

export const dynamic = "force-dynamic";

export default async function PedidosUsuarioPage() {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;
  } catch {}

  if (!user) {
    redirect("/login?redirectTo=/pedidos");
  }

  const profile = await prisma.profile.findFirst({
    where: {
      OR: [
        { id: user.id },
        { email: user.email ? user.email.toLowerCase() : "" },
      ],
    },
  });

  if (!profile || profile.status !== "aprovado") {
    redirect("/login?error=Sua conta precisa estar aprovada por um administrador para visualizar seus pedidos.");
  }

  const pedidos = await prisma.pedido.findMany({
    where: {
      OR: [
        { usuarioId: profile.id },
        { clienteContato: profile.email },
      ],
    },
    select: {
      id: true,
      quantidade: true,
      status: true,
      observacoes: true,
      createdAt: true,
      peca: {
        select: {
          id: true,
          nome: true,
          fotoUrl: true,
          categoria: true,
        },
      },
      avaliacao: {
        select: {
          id: true,
          nota: true,
          comentario: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedPedidos = pedidos.map((p) => ({
    id: p.id,
    quantidade: p.quantidade,
    status: p.status,
    observacoes: p.observacoes,
    createdAt: p.createdAt.toISOString(),
    peca: p.peca,
    avaliacao: p.avaliacao,
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-slate-950">
      <PublicNavbar />
      <main className="p-6 sm:p-12">
        <PedidosUsuarioClient pedidos={formattedPedidos} />
      </main>
    </div>
  );
}
