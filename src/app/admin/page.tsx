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
              <ShoppingBag className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Ver Pedidos ({totalPedidos})
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
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-amber-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden group shadow-md dark:shadow-lg">
          <div className="absolute top-0 right-0 p-4 text-amber-500/10 group-hover:text-amber-500/20 transition-colors">
            <Clock className="w-16 h-16" />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Pedidos Pendentes
          </p>
          <div className="text-4xl font-extrabold text-amber-600 dark:text-amber-400">{pedidosPendentes}</div>
          <p className="text-xs text-slate-500 mt-2">
            Aguardando aprovação ou fila
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden group shadow-md dark:shadow-lg">
          <div className="absolute top-0 right-0 p-4 text-cyan-500/10 group-hover:text-cyan-500/20 transition-colors">
            <Printer className="w-16 h-16" />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Em Produção
          </p>
          <div className="text-4xl font-extrabold text-cyan-600 dark:text-cyan-400">{pedidosEmProducao}</div>
          <p className="text-xs text-slate-500 mt-2">
            Imprimindo ou em pintura
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden group shadow-md dark:shadow-lg">
          <div className="absolute top-0 right-0 p-4 text-teal-500/10 group-hover:text-teal-500/20 transition-colors">
            <DollarSign className="w-16 h-16" />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Custo Total de Produção
          </p>
          <div className="text-4xl font-extrabold text-teal-600 dark:text-teal-400">
            {formatarMoeda(custoTotalMes)}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Materiais, energia, depreciação e acabamento
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden group shadow-md dark:shadow-lg">
          <div className="absolute top-0 right-0 p-4 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
            <TrendingUp className="w-16 h-16" />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Lucro Estimado Total
          </p>
          <div className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatarMoeda(lucroEstimadoMes)}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Baseado em margem de 100%
          </p>
        </div>
      </div>

      {/* Financial Chart Recharts Section */}
      <FinancialChart data={chartData} />

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <Link href="/admin/pedidos" className="block group">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 transition-all shadow-sm hover:shadow-xl hover:shadow-amber-500/5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-200">{totalPedidos}</span>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              Pedidos & Kanban
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Kanban de encomendas, prazos e clientes.
            </p>
          </div>
        </Link>

        <Link href="/admin/impressoras" className="block group">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500/40 rounded-2xl p-6 transition-all shadow-sm hover:shadow-xl hover:shadow-teal-500/5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Printer className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-200">{totalImpressoras}</span>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              Impressoras
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Consumo (Watts), preço e depreciação.
            </p>
          </div>
        </Link>

        <Link href="/admin/filamentos" className="block group">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 rounded-2xl p-6 transition-all shadow-sm hover:shadow-xl hover:shadow-cyan-500/5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <Boxes className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-200">{totalFilamentos}</span>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
              Filamentos & Resinas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              PLA, PETG, Resina por kg e cores.
            </p>
          </div>
        </Link>

        <Link href="/admin/tintas" className="block group">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-pink-500/40 rounded-2xl p-6 transition-all shadow-sm hover:shadow-xl hover:shadow-pink-500/5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400">
                <Palette className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-200">{totalTintas}</span>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
              Tintas & Pintura
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Primers, acrílicas, sprays e insumos.
            </p>
          </div>
        </Link>

        <Link href="/admin/pecas" className="block group">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500/40 rounded-2xl p-6 transition-all shadow-sm hover:shadow-xl hover:shadow-purple-500/5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Layers className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-200">{totalPecas}</span>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Peças & Custos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Cálculo completo e controle do catálogo.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
