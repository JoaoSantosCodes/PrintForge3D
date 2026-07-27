"use client";

import { useState } from "react";
import {
  createPedidoAction,
  updatePedidoStatusAction,
  updatePedidoAction,
  deletePedidoAction,
} from "@/app/actions/pedidos";
import { formatarMoeda } from "@/lib/custos";
import { Button } from "@/components/ui/button";
import { PDFModal } from "@/components/admin/pdf-modal";
import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";
import { exportToCSV } from "@/lib/csv";
import { gerarLinkWhatsApp } from "@/lib/whatsapp";
import {
  ShoppingBag,
  Plus,
  Search,
  X,
  ChevronRight,
  ChevronLeft,
  User,
  Phone,
  Box,
  Calendar,
  DollarSign,
  FileText,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Printer,
  Palette,
  Truck,
  Sparkles,
  Download,
  MessageCircle,
  XCircle,
} from "lucide-react";

interface Peca {
  id: string;
  nome: string;
  descricao?: string | null;
  categoria?: string | null;
  fotoUrl: string | null;
}

interface Pedido {
  id: string;
  clienteNome: string;
  clienteContato: string | null;
  status: string;
  pago?: boolean;
  cupomCodigo?: string | null;
  pecaId: string;
  peca: Peca;
  quantidade: number;
  precoAcordado: number | null;
  observacoes: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

const STATUS_COLUMNS = [
  { id: "pendente", label: "Aguardando", color: "border-slate-300 dark:border-slate-700/70 bg-slate-100/90 dark:bg-slate-900/80 text-slate-800 dark:text-slate-300", badge: "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300", icon: Clock },
  { id: "em_impressao", label: "Em Impressão", color: "border-cyan-500/30 bg-cyan-500/10 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-400", badge: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20", icon: Printer },
  { id: "pintando", label: "Pintura / Acabamento", color: "border-pink-500/30 bg-pink-500/10 dark:bg-pink-950/20 text-pink-700 dark:text-pink-400", badge: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border border-pink-500/20", icon: Palette },
  { id: "pronto", label: "Pronto", color: "border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400", badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20", icon: CheckCircle2 },
  { id: "enviado", label: "Enviado", color: "border-indigo-500/30 bg-indigo-500/10 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400", badge: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20", icon: Truck },
  { id: "entregue", label: "Entregue", color: "border-teal-500/30 bg-teal-500/10 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400", badge: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/20", icon: Sparkles },
  { id: "cancelado", label: "Cancelados", color: "border-rose-500/30 bg-rose-500/10 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400", badge: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20", icon: XCircle },
];

export default function PedidosClientPage({
  initialPedidos,
  pecas,
  chavePix,
}: {
  initialPedidos: Pedido[];
  pecas: Peca[];
  chavePix?: string | null;
}) {
  const [pedidos, setPedidos] = useState<Pedido[]>(initialPedidos);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPedido, setEditingPedido] = useState<Pedido | null>(null);
  const [selectedPedidoPDF, setSelectedPedidoPDF] = useState<Pedido | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter orders
  const filteredPedidos = pedidos.filter((pedido) => {
    const matchesSearch =
      pedido.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pedido.clienteContato && pedido.clienteContato.toLowerCase().includes(searchTerm.toLowerCase())) ||
      pedido.peca.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatusFilter === "todos" || pedido.status === selectedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  function handleOpenModal(pedido?: Pedido) {
    if (pedido) {
      setEditingPedido(pedido);
    } else {
      setEditingPedido(null);
    }
    setErrorMsg("");
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditingPedido(null);
    setErrorMsg("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);

    let res;
    if (editingPedido) {
      res = await updatePedidoAction(editingPedido.id, formData);
    } else {
      res = await createPedidoAction(formData);
    }

    if (res?.error) {
      setErrorMsg(res.error);
      setLoading(false);
    } else {
      setLoading(false);
      handleCloseModal();
      window.location.reload();
    }
  }

  async function handleAdvanceStatus(pedidoId: string, currentStatus: string, direction: "next" | "prev") {
    const statusOrder = STATUS_COLUMNS.map((c) => c.id);
    const currentIndex = statusOrder.indexOf(currentStatus);
    if (currentIndex === -1) return;

    const nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= statusOrder.length) return;

    const newStatus = statusOrder[nextIndex];

    // Optimistic UI update
    setPedidos((prev) =>
      prev.map((p) => (p.id === pedidoId ? { ...p, status: newStatus } : p))
    );

    const res = await updatePedidoStatusAction(pedidoId, newStatus);
    if (res.error) {
      alert(res.error);
      window.location.reload();
    }
  }

  async function handleDelete(id: string) {
    const res = await deletePedidoAction(id);
    if (!res.error) {
      setPedidos(pedidos.filter((p) => p.id !== id));
      setDeleteConfirmId(null);
    } else {
      alert(res.error);
    }
  }

  const handleExportCSV = () => {
    const headers = [
      "ID Pedido",
      "Cliente",
      "Contato",
      "Peça Solicitada",
      "Quantidade",
      "Preço Acordado (R$)",
      "Status",
      "Data do Pedido",
    ];

    const rows = filteredPedidos.map((p) => [
      p.id,
      p.clienteNome,
      p.clienteContato || "—",
      p.peca.nome,
      p.quantidade,
      p.precoAcordado ? p.precoAcordado.toFixed(2) : "A combinar",
      p.status,
      new Date(p.createdAt).toLocaleDateString("pt-BR"),
    ]);

    exportToCSV("printforge_pedidos.csv", headers, rows);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-teal-500 dark:text-teal-400" />
            Gestão de Pedidos & Encomendas
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Quadro Kanban para acompanhamento de produção, prazos e clientes.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="text-xs">
            <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Exportar </span>CSV
          </Button>
          <Button onClick={() => handleOpenModal()} variant="primary" size="sm" className="text-xs">
            <Plus className="w-3.5 h-3.5" /> Novo Pedido
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="relative w-full lg:w-80 shrink-0">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, telefone ou peça..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>

        {/* Mobile & Desktop Status Tab Filters */}
        <div className="flex items-center gap-1.5 sm:gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedStatusFilter("todos")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedStatusFilter === "todos"
                ? "bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30"
                : "bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Todos ({pedidos.length})
          </button>
          {STATUS_COLUMNS.map((col) => {
            const count = pedidos.filter((p) => p.status === col.id).length;
            return (
              <button
                type="button"
                key={col.id}
                onClick={() => setSelectedStatusFilter(col.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedStatusFilter === col.id
                    ? "bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30"
                    : "bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {col.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Scroll Indicator Cue for Intermediate Viewports */}
      {selectedStatusFilter === "todos" && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 2xl:hidden">
          <span className="flex items-center gap-1.5 font-medium text-[11px] sm:text-xs">
            <ChevronLeft className="w-4 h-4 text-teal-500 animate-pulse" /> Deslize horizontalmente para navegar pelas colunas do Kanban <ChevronRight className="w-4 h-4 text-teal-500 animate-pulse" />
          </span>
        </div>
      )}

      {/* Kanban Board Container */}
      <div className={`gap-4 ${
        selectedStatusFilter === "todos"
          ? "flex overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700"
          : "grid grid-cols-1"
      }`}>
        {STATUS_COLUMNS.filter((col) => selectedStatusFilter === "todos" || selectedStatusFilter === col.id).map((col) => {
          const colPedidos = filteredPedidos.filter((p) => p.status === col.id);
          const ColIcon = col.icon;
          return (
            <div
              key={col.id}
              className={`flex flex-col bg-white dark:bg-slate-900/70 border rounded-2xl p-4 min-h-[500px] ${
                selectedStatusFilter === "todos" ? "w-full min-w-[280px] sm:min-w-[300px] flex-1 flex-shrink-0 snap-start" : "w-full"
              } shadow-sm transition-colors ${col.color}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <ColIcon className="w-4 h-4" />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {col.label}
                  </h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${col.badge}`}>
                  {colPedidos.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {colPedidos.length === 0 ? (
                  <div className="h-32 flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-800/80 rounded-xl text-slate-500 dark:text-slate-400 text-xs text-center p-4">
                    Nenhum pedido nesta fase
                  </div>
                ) : (
                  colPedidos.map((pedido) => {
                    const statusIndex = STATUS_COLUMNS.findIndex((c) => c.id === pedido.status);
                    return (
                      <div
                        key={pedido.id}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/90 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all group relative"
                      >
                        {/* Piece & Client Info */}
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate" title={pedido.clienteNome}>
                              {pedido.clienteNome}
                            </span>
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
                              {(() => {
                                const waUrl = gerarLinkWhatsApp(
                                  pedido.clienteContato,
                                  pedido.clienteNome,
                                  pedido.peca.nome,
                                  pedido.status
                                );
                                if (!waUrl) return null;
                                return (
                                  <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 rounded-lg hover:bg-emerald-500/10 transition-colors"
                                    title="Notificar via WhatsApp"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </a>
                                );
                              })()}
                              <button
                                onClick={() => setSelectedPedidoPDF(pedido)}
                                className="p-1 text-teal-600 dark:text-teal-400 hover:text-teal-500 rounded-lg hover:bg-teal-500/10"
                                title="Gerar Orçamento PDF"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenModal(pedido)}
                                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
                                title="Editar Pedido"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(pedido.id)}
                                className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10"
                                title="Excluir"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {pedido.clienteContato && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400" title={pedido.clienteContato}>
                              <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                              <span className="truncate">{pedido.clienteContato}</span>
                            </div>
                          )}

                          {/* Item Card Details */}
                          <div className="bg-white dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/70 mt-2 space-y-1.5 transition-colors">
                            <div className="flex items-center gap-2">
                              <Box className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                              <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate" title={pedido.peca.nome}>
                                {pedido.peca.nome}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                              <span>Qtd: <strong className="text-slate-900 dark:text-slate-200">{pedido.quantidade}x</strong></span>
                              <span className="font-bold text-teal-600 dark:text-teal-400">
                                {pedido.precoAcordado ? formatarMoeda(pedido.precoAcordado) : "A combinar"}
                              </span>
                            </div>

                            {/* Payment Status Badge & Admin Toggle */}
                            <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                pedido.pago
                                  ? "bg-teal-500/10 border-teal-500/20 text-teal-700 dark:text-teal-300"
                                  : "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300"
                              }`}>
                                {pedido.pago ? "Pago ✅" : "Aguardando Pagamento ⏳"}
                              </span>

                              <button
                                type="button"
                                onClick={async () => {
                                  const { confirmarPagamentoAction } = await import("@/app/actions/pedidos");
                                  await confirmarPagamentoAction(pedido.id, !pedido.pago);
                                  setPedidos(prev => prev.map(p => p.id === pedido.id ? { ...p, pago: !p.pago } : p));
                                }}
                                className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                              >
                                {pedido.pago ? "Marcar Pendente" : "Confirmar Pagamento"}
                              </button>
                            </div>
                          </div>

                          {pedido.observacoes && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 italic line-clamp-2 pt-1 border-t border-slate-200 dark:border-slate-900" title={pedido.observacoes}>
                              "{pedido.observacoes}"
                            </p>
                          )}
                        </div>

                        {/* Delete confirmation inline */}
                        {deleteConfirmId === pedido.id && (
                          <div className="mt-3 p-2 bg-rose-500/20 border border-rose-500/30 rounded-xl text-center space-y-2 animate-in fade-in">
                            <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-300">Excluir este pedido?</p>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleDelete(pedido.id)}
                                className="px-2.5 py-1 bg-rose-500 text-white rounded-lg text-xs font-bold"
                              >
                                Sim
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs"
                              >
                                Não
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Status Advancement Controls */}
                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200 dark:border-slate-900">
                          <button
                            disabled={statusIndex === 0}
                            onClick={() => handleAdvanceStatus(pedido.id, pedido.status, "prev")}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Voltar status"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>

                          <span className="text-[10px] text-slate-500 font-semibold uppercase">
                            Mover
                          </span>

                          <button
                            disabled={statusIndex === STATUS_COLUMNS.length - 1}
                            onClick={() => handleAdvanceStatus(pedido.id, pedido.status, "next")}
                            className="p-1 rounded-lg text-teal-600 dark:text-teal-400 hover:text-teal-500 hover:bg-teal-500/10 disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Avançar status"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Pedido */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={handleCloseModal}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-100 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-teal-500/10 text-teal-400 rounded-2xl">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">
                  {editingPedido ? "Editar Pedido / Encomenda" : "Novo Pedido / Encomenda"}
                </h2>
                <p className="text-xs text-slate-400">
                  Selecione a peça e informe os dados do cliente e valor.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <X className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Selecione a Peça *
                </label>
                <select
                  name="pecaId"
                  required
                  defaultValue={editingPedido?.pecaId || pecas[0]?.id || ""}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                >
                  {pecas.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    name="clienteNome"
                    required
                    defaultValue={editingPedido?.clienteNome || ""}
                    placeholder="Ex: João da Silva"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contato (Telefone / WhatsApp)
                  </label>
                  <input
                    type="text"
                    name="clienteContato"
                    defaultValue={editingPedido?.clienteContato || ""}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Quantidade *
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="quantidade"
                    required
                    defaultValue={editingPedido?.quantidade || 1}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Preço Acordado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="precoAcordado"
                    defaultValue={editingPedido?.precoAcordado || ""}
                    placeholder="Ex: 150.00"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status Inicial
                  </label>
                  <select
                    name="status"
                    defaultValue={editingPedido?.status || "pendente"}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                  >
                    {STATUS_COLUMNS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Observações / Especificações do Cliente
                </label>
                <textarea
                  name="observacoes"
                  rows={3}
                  defaultValue={editingPedido?.observacoes || ""}
                  placeholder="Ex: Detalhes de cor, prazo negociado, acabamento..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button type="button" variant="secondary" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading
                    ? "Salvando..."
                    : editingPedido
                    ? "Atualizar Pedido"
                    : "Criar Pedido"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Modal for Pedido */}
      {selectedPedidoPDF && (
        <PDFModal
          isOpen={!!selectedPedidoPDF}
          onClose={() => setSelectedPedidoPDF(null)}
          pecaNome={selectedPedidoPDF.peca.nome}
          pecaDescricao={selectedPedidoPDF.peca.descricao}
          pecaCategoria={selectedPedidoPDF.peca.categoria}
          fotoUrl={selectedPedidoPDF.peca.fotoUrl}
          precoPadrao={selectedPedidoPDF.precoAcordado || 0}
          clienteNome={selectedPedidoPDF.clienteNome}
          clienteContato={selectedPedidoPDF.clienteContato || undefined}
          quantidade={selectedPedidoPDF.quantidade}
          observacoes={selectedPedidoPDF.observacoes}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteConfirmId}
        itemName={pedidos.find((p) => p.id === deleteConfirmId)?.clienteNome}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={async () => {
          if (deleteConfirmId) {
            await deletePedidoAction(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
      />
    </div>
  );
}

