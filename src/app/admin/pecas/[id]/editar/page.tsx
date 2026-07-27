import { prisma } from "@/lib/prisma";
import { getEmpresaIdAtual } from "@/lib/auth-server";
import PecaForm from "@/components/admin/peca-form";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditarPecaPage({ params }: { params: { id: string } }) {
  const empresaId = await getEmpresaIdAtual();

  const [peca, printers, filaments] = await Promise.all([
    prisma.peca.findFirst({
      where: { id: params.id, empresaId },
      include: {
        custoImpressao: true,
        custoPintura: true,
        custoEmbalagem: true,
      },
    }),
    prisma.printer.findMany({ where: { empresaId }, orderBy: { nome: "asc" } }).catch(() => []),
    prisma.filament.findMany({ where: { empresaId }, orderBy: { tipo: "asc" } }).catch(() => []),
  ]);

  if (!peca) {
    notFound();
  }

  return <PecaForm printers={printers} filaments={filaments} initialData={peca} />;
}
