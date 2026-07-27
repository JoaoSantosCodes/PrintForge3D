import { prisma } from "@/lib/prisma";
import { formatarMoeda, calcularCustoPeca } from "@/lib/custos";
import { FinancialChart } from "@/components/admin/financial-chart";
import { Box, Printer, Boxes, TrendingUp, DollarSign, Globe, Plus, Layers, Palette, ShoppingBag, Clock, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Fetch stats from Prisma safely
  let totalPecas = 0;
  let totalImpressoras = 0;
  let totalFilamentos = 0;
  let totalTintas = 0;
  let pedidosPendentes = 0;
  let pedidosEmProducao = 0;
  let totalPedidos = 0;
  let pendingProfilesCount = 0;
  let pecas: any[] = [];
  let pedidos30Dias: any[] = [];

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const [
      countPecas,
      countPrinters,
      countFilaments,
      countTintas,
      countPendentes,
      countProducao,
      countPedidosTotal,
      countPendingProfiles,
      fetchedPecas,
      fetchedPedidos,
    ] = await Promise.all([
      prisma.peca.count(),
      prisma.printer.count(),
      prisma.filament.count(),
      prisma.tinta.count(),
      prisma.pedido.count({ where: { status: "pendente" } }),
      prisma.pedido.count({ where: { status: { in: ["em_impressao", "pintando"] } } }),
      prisma.pedido.count(),
      prisma.profile.count({ where: { status: "pendente" } }),
      prisma.peca.findMany({
        include: {
          custoImpressao: true,
          custoPintura: true,
          custoEmbalagem: true,
        },
      }),
      prisma.pedido.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
        include: {
          peca: {
            include: {
              custoImpressao: true,
              custoPintura: true,
              custoEmbalagem: true,
            },
          },
        },
      }),
    ]);

    totalPecas = countPecas;
    totalImpressoras = countPrinters;
    totalFilamentos = countFilaments;
    totalTintas = countTintas;
    pedidosPendentes = countPendentes;
    pedidosEmProducao = countProducao;
    totalPedidos = countPedidosTotal;
    pendingProfilesCount = countPendingProfiles;
    pecas = fetchedPecas;
    pedidos30Dias = fetchedPedidos;
  } catch (err) {
    console.warn("Nenhum dado no banco ainda ou erro na busca:", err);
  }

  // Fetch printers and filaments dictionary to calculate exact depreciation & material cost
  const printers = await prisma.printer.findMany().catch(() => []);
  const filaments = await prisma.filament.findMany().catch(() => []);

  const printerMap = new Map(printers.map((p) => [p.id, p]));
  const filamentMap = new Map(filaments.map((f) => [f.id, f]));

  let custoTotalMes = 0;
  let faturamentoSugeridoMes = 0;

  pecas.forEach((peca) => {
    const imp = peca.custoImpressao;
    const pin = peca.custoPintura;
    const emb = peca.custoEmbalagem;

    const printer = imp ? printerMap.get(imp.printerId) : null;
    const filament = imp ? filamentMap.get(imp.filamentId) : null;

    const custos = calcularCustoPeca({
      material: filament && imp ? { precoPorKg: filament.precoPorKg, pesoGramas: imp.pesoGramas } : undefined,
      energia: imp ? { consumoWatts: printer?.consumoWatts || 150, tempoHoras: imp.tempoHoras, tarifaEnergiaKwh: imp.tarifaEnergiaKwh } : undefined,
      depreciacao: printer && imp ? { precoImpressora: printer.preco, vidaUtilHoras: printer.vidaUtilHoras, tempoHoras: imp.tempoHoras } : undefined,
      pintura: pin ? { tempoHoras: pin.tempoHoras, valorHoraMaoDeObra: pin.valorHoraMaoDeObra, custoTintas: pin.custoTintas } : undefined,
      embalagem: emb ? { custoUnitario: emb.custoUnitario } : undefined,
      margemDesejadaPercentual: 100, // 100% margem padrão para estimativa de faturamento
    });

    custoTotalMes += custos.custoTotal;
    faturamentoSugeridoMes += custos.precoSugerido;
  });

  // Calculate 30-day daily aggregated chart data
  const chartDataMap = new Map<string, { receita: number; custo: number }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    chartDataMap.set(dateStr, { receita: 0, custo: 0 });
  }

  pedidos30Dias.forEach((ped) => {
    const dateStr = new Date(ped.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    const current = chartDataMap.get(dateStr) || { receita: 0, custo: 0 };

    const receita = (ped.precoAcordado || 0) * (ped.quantidade || 1);
    
    // Calculate cost for piece in order
    let custoPecaUnitario = 0;
    if (ped.peca) {
      const imp = ped.peca.custoImpressao;
      const pin = ped.peca.custoPintura;
      const emb = ped.peca.custoEmbalagem;
      const printer = imp ? printerMap.get(imp.printerId) : null;
      const filament = imp ? filamentMap.get(imp.filamentId) : null;
      const custosCalculados = calcularCustoPeca({
        material: filament && imp ? { precoPorKg: filament.precoPorKg, pesoGramas: imp.pesoGramas } : undefined,
        energia: imp ? { consumoWatts: printer?.consumoWatts || 150, tempoHoras: imp.tempoHoras, tarifaEnergiaKwh: imp.tarifaEnergiaKwh } : undefined,
        depreciacao: printer && imp ? { precoImpressora: printer.preco, vidaUtilHoras: printer.vidaUtilHoras, tempoHoras: imp.tempoHoras } : undefined,
        pintura: pin ? { tempoHoras: pin.tempoHoras, valorHoraMaoDeObra: pin.valorHoraMaoDeObra, custoTintas: pin.custoTintas } : undefined,
        embalagem: emb ? { custoUnitario: emb.custoUnitario } : undefined,
      });
      custoPecaUnitario = custosCalculados.custoTotal;
    }

    const custoTotalPedido = custoPecaUnitario * (ped.quantidade || 1);
    chartDataMap.set(dateStr, {
      receita: current.receita + receita,
      custo: current.custo + custoTotalPedido,
    });
  });

  const chartData = Array.from(chartDataMap.entries()).map(([dataStr, vals]) => ({
    data: dataStr,
    receita: Math.round(vals.receita * 100) / 100,
    custo: Math.round(vals.custo * 100) / 100,
    lucro: Math.round((vals.receita - vals.custo) * 100) / 100,
  }));

  const lucroEstimadoMes = faturamentoSugeridoMes - custoTotalMes;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Dashboard Administrativo
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Visão geral da sua produção 3D, encomendas, métricas financeiras e custos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link href="/admin/pedidos">
            <Button variant="secondary" size="sm">
              <ShoppingBag className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Ver Pedidos ({totalPedidos})
            </Button>
          </Link>
          <Link href="/admin/pecas/nova">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4" /> Nova Peça & Calculadora
            </Button>
          </Link>
        </div>
      </div>

      {pendingProfilesCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold border border-amber-500/30 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {pendingProfilesCount} {pendingProfilesCount === 1 ? "novo usuário aguarda" : "novos usuários aguardam"} aprovação de acesso
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Acesse a gestão de usuários para analisar e aprovar as solicitações de cadastro.
              </p>
            </div>
          </div>
          <Link href="/admin/usuarios">
            <Button variant="primary" size="sm">
              Analisar Cadastros &rarr;
            </Button>
          </Link>
        </div>
      )}

      {/* Financial & Order Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric Card 1: Pedidos Pendentes (Âmbar - Alerta / Fluxo) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pedidos Pendentes
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
            {pedidosPendentes}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-2">
            Aguardando aprovação ou fila
          </p>
        </div>

        {/* Metric Card 2: Em Produção (Ciano - Equipamento / Operação) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Em Produção
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20 shrink-0">
              <Printer className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-cyan-600 dark:text-cyan-400 tracking-tight">
            {pedidosEmProducao}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-2">
            Imprimindo ou em pintura
          </p>
        </div>

        {/* Metric Card 3: Custo Total de Produção (Rose - Saída Financeira / Custos) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Custo Total de Produção
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
            {formatarMoeda(custoTotalMes)}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-2">
            Materiais, energia, depreciação e acabamento
          </p>
        </div>

        {/* Metric Card 4: Lucro Estimado Total (Emerald - Resultado Financeiro) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Lucro Estimado Total
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatarMoeda(lucroEstimadoMes)}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-2">
            Baseado em margem de 100%
          </p>
        </div>
      </div>

      {/* Financial Chart Section */}
      <FinancialChart data={chartData} />

      {/* Quick Navigation Shortcut Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Shortcut 1: Pedidos & Kanban (Âmbar) */}
        <Link href="/admin/pedidos" className="block group">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-amber-500/5 hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalPedidos}</span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              Pedidos & Kanban
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
              Kanban de encomendas, prazos e clientes.
            </p>
          </div>
        </Link>

        {/* Shortcut 2: Impressoras (Ciano) */}
        <Link href="/admin/impressoras" className="block group">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-cyan-500/5 hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalImpressoras}</span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
              Impressoras
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
              Consumo (Watts), preço e depreciação.
            </p>
          </div>
        </Link>

        {/* Shortcut 3: Filamentos & Resinas (Índigo) */}
        <Link href="/admin/filamentos" className="block group">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Boxes className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalFilamentos}</span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Filamentos & Resinas
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
              PLA, PETG, Resina por kg e cores.
            </p>
          </div>
        </Link>

        {/* Shortcut 4: Tintas & Pintura (Pink) */}
        <Link href="/admin/tintas" className="block group">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-pink-500/50 rounded-2xl p-5 transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-pink-500/5 hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center border border-pink-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Palette className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalTintas}</span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
              Tintas & Pintura
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
              Primers, acrílicas, sprays e insumos.
            </p>
          </div>
        </Link>

        {/* Shortcut 5: Peças & Custos (Roxo) */}
        <Link href="/admin/pecas" className="block group">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-purple-500/5 hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalPecas}</span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Peças & Custos
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
              Cálculo completo e controle do catálogo.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
