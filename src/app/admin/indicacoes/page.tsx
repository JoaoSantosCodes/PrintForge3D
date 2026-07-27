import { getPerfilIndicacoesAction } from "@/app/actions/indicacoes";
import IndicacoesClientPage from "./indicacoes-client";

export const dynamic = "force-dynamic";

export default async function AdminIndicacoesPage() {
  const data = await getPerfilIndicacoesAction();

  return (
    <IndicacoesClientPage
      codigoIndicacao={data.codigoIndicacao || ""}
      posicaoPreferencial={data.posicaoPreferencial || "auto"}
      indicadosEsquerda={data.indicadosEsquerda || []}
      indicadosDireita={data.indicadosDireita || []}
      totalPontos={data.totalPontos || 0}
    />
  );
}
