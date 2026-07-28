import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { PublicNavbar } from "@/components/catalogo/navbar";
import { PedidosUsuarioClient } from "./pedidos-usuario-client";

export const dynamic = "force-dynamic";

export default async function PedidosUsuarioPage() {
  const profile = await getCurrentProfile();

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
    include: {
      empresa: {
        select: {
          nome: true,
          slug: true,
        },
      },
      peca: {
        select: {
          id: true,
          nome: true,
          fotoUrl: true,
          categoria: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedPedidos = pedidos.map((p) => ({
    id: p.id,
    quantidade: p.quantidade,
    precoAcordado: p.precoAcordado,
    pago: p.pago,
    cupomCodigo: p.cupomCodigo,
    status: p.status,
    observacoes: null,
    createdAt: p.createdAt ? (typeof p.createdAt === "string" ? p.createdAt : new Date(p.createdAt).toISOString()) : new Date().toISOString(),
    empresa: p.empresa,
    peca: p.peca,
    avaliacao: null,
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
