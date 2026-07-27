"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { criarLojaAction } from "@/app/actions/criar-loja";
import { Store, Check, AlertCircle, Loader2, Sparkles, ShieldCheck, ArrowRight, Layers, Network } from "lucide-react";
import Link from "next/link";

interface Plano {
  id: string;
  nome: string;
  slug: string;
  precoMensal: number;
  limiteImpressoras: number;
  limitePecas: number;
  limitePedidosMes: number;
}

export default function CriarLojaClient({ planos }: { planos: Plano[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "";
  const perna = searchParams.get("perna") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [slug, setSlug] = useState("");
  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [planoId, setPlanoId] = useState(planos[0]?.id || "");

  // Real-time slug checking
  const [slugStatus, setSlugStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string | null;
  }>({ checking: false, available: null, message: null });

  // Auto-generate slug from empresa name if user hasn't typed a custom slug
  const [customSlug, setCustomSlug] = useState(false);

  const handleNomeEmpresaChange = (val: string) => {
    setNomeEmpresa(val);
    if (!customSlug) {
      const autoSlug = val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      setSlug(autoSlug);
    }
  };

  useEffect(() => {
    if (!slug) {
      setSlugStatus({ checking: false, available: null, message: null });
      return;
    }

    const timer = setTimeout(async () => {
      setSlugStatus({ checking: true, available: null, message: null });
      try {
        const res = await fetch(`/api/check-slug?slug=${encodeURIComponent(slug)}`);
        const data = await res.json();
        setSlugStatus({
          checking: false,
          available: data.available,
          message: data.message,
        });
      } catch {
        setSlugStatus({ checking: false, available: false, message: "Erro ao verificar slug" });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (slugStatus.available === false) {
      setError("Por favor, escolha um slug disponível antes de prosseguir.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("nomeEmpresa", nomeEmpresa);
    formData.append("slug", slug);
    formData.append("nomeResponsavel", nomeResponsavel);
    formData.append("email", email);
    formData.append("password", password);
    if (planoId) formData.append("planoId", planoId);
    if (refCode) formData.append("refCode", refCode);
    if (perna) formData.append("perna", perna);

    const res = await criarLojaAction(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else if (res?.success && res.redirectUrl) {
      router.push(res.redirectUrl);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      {/* Background Glow Highlights */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      {/* Header Bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Store className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            PrintForge <span className="text-cyan-400">3D</span>
          </span>
        </Link>

        <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-400">
          <span>Já tem uma loja?</span>
          <Link
            href="/login"
            className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4"
          >
            Entrar no Painel
          </Link>
        </div>
      </header>

      {/* Main Content Form */}
      <main className="relative z-10 max-w-4xl w-full mx-auto px-4 py-12">
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4" /> 14 dias grátis • Sem cartão de crédito
          </div>

          {/* Referral Banner */}
          {refCode && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold shadow-lg animate-in fade-in duration-300">
              <Network className="w-4 h-4 text-purple-400" /> Indicado por: <span className="font-mono text-purple-200">{refCode}</span> {perna && `(Perna ${perna === "esquerda" ? "Esquerda ⬅️" : "Direita ➡️"})`}
            </div>
          )}

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Crie sua Loja de Impressão 3D em Minutos
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Tenha seu próprio catálogo público, controle de impressoras, filamentos, cálculo automático de custos e Kanban de encomendas.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Card 1: Dados da Empresa */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Store className="w-5 h-5 text-cyan-400" /> Identificação da Sua Loja
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Nome da Empresa / Impressaria *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: PrintArt 3D Studio"
                  value={nomeEmpresa}
                  onChange={(e) => handleNomeEmpresaChange(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Link / URL Pública da Sua Loja *
                </label>
                <div className="relative">
                  <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden focus-within:border-cyan-500 transition-colors">
                    <span className="text-xs text-slate-500 pl-4 pr-1 select-none hidden sm:inline">
                      printforge3d.com/loja/
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="minha-loja"
                      value={slug}
                      onChange={(e) => {
                        setCustomSlug(true);
                        setSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, "")
                        );
                      }}
                      className="w-full bg-transparent px-3 py-3 text-sm text-white focus:outline-none"
                    />
                  </div>

                  {slugStatus.checking && (
                    <div className="absolute right-3 top-3.5 text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}
                  {!slugStatus.checking && slugStatus.available === true && (
                    <div className="absolute right-3 top-3 text-emerald-400 flex items-center gap-1 text-xs font-semibold bg-emerald-500/10 px-2 py-1 rounded-md">
                      <Check className="w-3.5 h-3.5" /> Disponível
                    </div>
                  )}
                  {!slugStatus.checking && slugStatus.available === false && (
                    <div className="absolute right-3 top-3 text-rose-400 flex items-center gap-1 text-xs font-semibold bg-rose-500/10 px-2 py-1 rounded-md">
                      <AlertCircle className="w-3.5 h-3.5" /> Indisponível
                    </div>
                  )}
                </div>
                {slugStatus.message && (
                  <p
                    className={`text-xs mt-1.5 ${
                      slugStatus.available ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {slugStatus.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Dados do Responsável */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" /> Responsável & Acesso Administrativo
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Seu nome completo"
                  value={nomeResponsavel}
                  onChange={(e) => setNomeResponsavel(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  E-mail *
                </label>
                <input
                  type="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Senha de Acesso *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Seleção do Plano */}
          {planos.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" /> Escolha seu Plano (Teste 14 Dias Grátis)
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {planos.map((p) => {
                  const isSelected = planoId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setPlanoId(p.id)}
                      className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 relative ${
                        isSelected
                          ? "bg-cyan-500/10 border-cyan-500 text-white shadow-lg shadow-cyan-500/10"
                          : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                      <div className="font-bold text-base text-white">{p.nome}</div>
                      <div className="text-2xl font-black text-cyan-400 mt-2">
                        R$ {p.precoMensal.toFixed(2)}
                        <span className="text-xs text-slate-400 font-normal"> /mês</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-3 space-y-1.5 border-t border-slate-800/80 pt-3">
                        <div>🖨️ {p.limiteImpressoras >= 999 ? "Ilimitadas" : `Até ${p.limiteImpressoras}`} impressoras</div>
                        <div>🧩 {p.limitePecas >= 999 ? "Ilimitadas" : `Até ${p.limitePecas}`} peças no catálogo</div>
                        <div>📦 {p.limitePedidosMes >= 999 ? "Ilimitados" : `Até ${p.limitePedidosMes}`} pedidos/mês</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading || slugStatus.available === false}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-base shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-[1.01]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Criando sua loja...
              </>
            ) : (
              <>
                Criar Minha Loja & Começar Trial Grátis <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        PrintForge 3D © {new Date().getFullYear()} — Plataforma Multi-vendedor SaaS para Impressão 3D
      </footer>
    </div>
  );
}
