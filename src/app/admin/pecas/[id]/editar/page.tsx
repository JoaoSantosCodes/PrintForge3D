import { prisma } from "@/lib/prisma";
import PecaForm from "@/components/admin/peca-form";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditarPecaPage({ params }: { params: { id: string } }) {
  const [peca, printers, filaments] = await Promise.all([
    prisma.peca.findUnique({
      where: { id: params.id },
      include: {
        custoImpressao: true,
        custoPintura: true,
        custoEmbalagem: true,
      },
    }),
    prisma.printer.findMany({ orderBy: { nome: "asc" } }).catch(() => []),
    prisma.filament.findMany({ orderBy: { tipo: "asc" } }).catch(() => []),
  ]);

  if (!peca) {
    notFound();
  }

  return <PecaForm printers={printers} filaments={filaments} initialData={peca} />;
}
