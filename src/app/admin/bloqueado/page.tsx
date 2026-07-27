import { getCurrentProfile } from "@/lib/auth-server";
import { AlertTriangle, Lock, MessageCircle, ArrowLeft, CreditCard } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminBloqueadoPage() {
  const profile = await getCurrentProfile();
  const empresa = profile?.empresa;

  const whatsappMessage = encodeURIComponent(
    `Olá! Sou da empresa "${empresa?.nome || ""}" (slug: ${empresa?.slug || ""}) e preciso regularizar o acesso ao meu painel PrintForge 3D.`
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white">Acesso ao Painel Suspenso</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            {empresa?.status === "trial_expirado"
              ? "Seu período de testes de 14 dias expirou. Escolha um plano para reativar seu acesso."
              : "Sua assinatura possui pendência de pagamento vencida há mais de 7 dias."}
          </p>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-300 text-left space-y-2">
          <div className="font-bold text-amber-400">💡 Importante:</div>
          <p>
            O seu catálogo público em <span className="font-mono text-cyan-400">/loja/{empresa?.slug}</span> continua ativo para seus clientes. Regularize seu pagamento para liberar novamente o painel administrativo.
          </p>
        </div>

        <div className="space-y-3">
          <a
            href={`https://wa.me/5511999999999?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
          >
            <MessageCircle className="w-4 h-4" /> Regularizar via WhatsApp
          </a>

          <Link href="/admin/assinatura" className="block">
            <button className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all">
              <CreditCard className="w-4 h-4 text-cyan-400" /> Ver Detalhes da Assinatura
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
