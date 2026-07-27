import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, FileText, UserCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata = {
  title: "Política de Privacidade — PrintForge 3D",
  description: "Entenda como tratamos seus dados pessoais de acordo com a LGPD no PrintForge 3D.",
};

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 md:p-12 relative overflow-hidden transition-colors">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <div>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Catálogo
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center justify-center text-teal-500 dark:text-teal-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Política de Privacidade
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed shadow-lg dark:shadow-2xl transition-colors">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-500 dark:text-teal-400" /> 1. Coleta de Dados Pessoais
            </h2>
            <p>
              O **PrintForge 3D** coleta apenas os dados estritamente necessários para a prestação de serviços de orçamento e encomenda de impressões 3D:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 pl-2">
              <li>**Dados Cadastrais**: Nome completo, endereço de e-mail e dados de login.</li>
              <li>**Dados de Contato**: Telefone/WhatsApp informado na realização de pedidos.</li>
              <li>**Histórico de Transações**: Detalhes das peças encomendadas, status de entrega e avaliações fornecidas.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-500 dark:text-cyan-400" /> 2. Finalidade e Utilização
            </h2>
            <p>
              Os dados coletados são utilizados exclusivamente para:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 pl-2">
              <li>Processamento, identificação e produção dos orçamentos e pedidos de impressão 3D.</li>
              <li>Comunicação sobre o status de produção, envio e faturamento de pedidos.</li>
              <li>Aprimoramento da experiência do usuário e controle de acessos à plataforma.</li>
            </ul>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              *Não compartilhamos nem vendemos seus dados para terceiros ou fins publicitários.*
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-500 dark:text-amber-400" /> 3. Seus Direitos como Titular (LGPD)
            </h2>
            <p>
              Você possui controle total sobre suas informações armazenadas na nossa plataforma:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 pl-2">
              <li>**Confirmação e Acesso**: Você pode visualizar e exportar seus dados a qualquer momento no seu **Perfil (`/perfil`)**.</li>
              <li>**Portabilidade / Exportação**: Disponibilizamos um botão para download integral dos seus dados em formato legível (JSON).</li>
              <li>**Solicitação de Exclusão**: Você pode solicitar o encerramento da conta e anonimização dos seus dados pessoais diretamente no seu painel.</li>
            </ul>
          </section>

          <section className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            Última atualização: Julho de 2026. Em caso de dúvidas sobre privacidade, entre em contato através da nossa equipe de atendimento.
          </section>
        </div>
      </div>
    </main>
  );
}
