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

  const [printers, filaments] = await Promise.all([
    prisma.printer.findMany({ where: { empresaId: peca.empresaId } }),
    prisma.filament.findMany({ where: { empresaId: peca.empresaId } }),
  ]);

  return <PecaDetailClientPage peca={peca} printers={printers} filaments={filaments} />;
}
