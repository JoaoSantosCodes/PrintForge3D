import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Termos de Uso — PrintForge 3D",
  description: "Condições gerais de uso do catálogo e encomenda de peças no PrintForge 3D.",
};

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <div>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Catálogo
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Termos de Uso</h1>
              <p className="text-sm text-slate-400">
                Regras e diretrizes para navegação e realização de pedidos na plataforma.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" /> 1. Aceitação dos Termos
            </h2>
            <p>
              Ao cadastrar-se ou efetuar pedidos no **PrintForge 3D**, você concorda integralmente com estes Termos de Uso e com a nossa Política de Privacidade.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" /> 2. Orçamentos e Fabricação 3D
            </h2>
            <p>
              O PrintForge 3D atua no cálculo de custos e produção customizada de objetos 3D. As peças são produzidas conforme as especificações descritas no catálogo ou enviadas nos arquivos de modelo.
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
              <li>Pequenas variações de textura ou acabamento superficial são inerentes ao processo de impressão FDM/Resina.</li>
              <li>Prazos de entrega contam a partir da confirmação do orçamento ou pagamento.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" /> 3. Cancelamento e Devolução
            </h2>
            <p>
              Cancelamentos podem ser solicitados gratuitamente enquanto o pedido estiver no status **Pendente**. Após o início da produção ou pintura, custos de insumos alocados poderão ser retidos.
            </p>
          </section>

          <section className="pt-4 border-t border-slate-800 text-xs text-slate-400">
            Última atualização: Julho de 2026. PrintForge 3D — Todos os direitos reservados.
          </section>
        </div>
      </div>
    </main>
  );
}
