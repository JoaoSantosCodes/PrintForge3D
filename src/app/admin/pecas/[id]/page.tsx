import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PecaDetailClientPage from "./peca-detail-client";

export const dynamic = "force-dynamic";

export default async function PecaDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const peca = await prisma.peca.findUnique({
    where: { id: params.id },
    include: {
      custoImpressao: true,
      custoPintura: true,
      custoEmbalagem: true,
      pedidos: true,
    },
  });

  if (!peca) {
    notFound();
  }

  const printers = await prisma.printer.findMany();
  const filaments = await prisma.filament.findMany();

  return <PecaDetailClientPage peca={peca} printers={printers} filaments={filaments} />;
}
