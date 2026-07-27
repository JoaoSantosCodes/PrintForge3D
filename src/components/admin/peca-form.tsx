"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Upload, Calculator, Sparkles, AlertCircle, FileCode, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatarMoeda, calcularCustoPeca, LIMIAR_MARGEM_BAIXA_PERCENTUAL } from "@/lib/custos";
import { savePecaAction } from "@/app/actions/pecas";
import { parseGCodeContent, GCodeMetadata } from "@/lib/gcode-parser";

interface PecaFormProps {
  printers: any[];
  filaments: any[];
  initialData?: any;
}

export default function PecaForm({ printers, filaments, initialData }: PecaFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [gcodeMsg, setGcodeMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [nome, setNome] = useState(initialData?.nome || "");
  const [descricao, setDescricao] = useState(initialData?.descricao || "");
  const [categoria, setCategoria] = useState(initialData?.categoria || "Colecionáveis");
  const [fotoUrl, setFotoUrl] = useState(initialData?.fotoUrl || "");
  const [publicada, setPublicada] = useState(initialData?.publicada ?? false);
  const [status, setStatus] = useState(initialData?.status || "em_producao");

  // Impressão
  const [printerId, setPrinterId] = useState(
    initialData?.custoImpressao?.printerId || (printers[0]?.id ?? "")
  );
  const [filamentId, setFilamentId] = useState(
    initialData?.custoImpressao?.filamentId || (filaments[0]?.id ?? "")
  );
  const [pesoGramas, setPesoGramas] = useState<number>(
    initialData?.custoImpressao?.pesoGramas ?? 100
  );
  const [tempoHorasImpressao, setTempoHorasImpressao] = useState<number>(
    initialData?.custoImpressao?.tempoHoras ?? 4
  );
  const [tarifaEnergiaKwh, setTarifaEnergiaKwh] = useState<number>(
    initialData?.custoImpressao?.tarifaEnergiaKwh ?? 0.85
  );

  const handleGCodeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setGcodeMsg(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseGCodeContent(text);

        if (parsed.tempoHoras > 0) setTempoHorasImpressao(parsed.tempoHoras);
        if (parsed.pesoGramas > 0) setPesoGramas(parsed.pesoGramas);

        setGcodeMsg({
          type: "success",
          text: `Metadados extraídos com sucesso de (${parsed.slicerDetectado}): ${parsed.tempoHoras}h de impressão e ${parsed.pesoGramas}g de filamento!`,
        });
      } catch (err: any) {
        setGcodeMsg({
          type: "error",
          text: err.message || "Não foi possível ler os comentários do arquivo .gcode. Você pode preencher os campos manualmente.",
        });
      }
    };
    reader.readAsText(file);
  };

  // Pintura
  const [custoTintas, setCustoTintas] = useState<number>(
    initialData?.custoPintura?.custoTintas ?? 0
  );
  const [tempoHorasPintura, setTempoHorasPintura] = useState<number>(
    initialData?.custoPintura?.tempoHoras ?? 0
  );
  const [valorHoraMaoDeObra, setValorHoraMaoDeObra] = useState<number>(
    initialData?.custoPintura?.valorHoraMaoDeObra ?? 25
  );

  // Embalagem
  const [materialEmbalagemDescricao, setMaterialEmbalagemDescricao] = useState(
    initialData?.custoEmbalagem?.materialDescricao || ""
  );
  const [custoUnitarioEmbalagem, setCustoUnitarioEmbalagem] = useState<number>(
    initialData?.custoEmbalagem?.custoUnitario ?? 0
  );

  // Margem de Lucro Desejada
  const [margemDesejadaPercentual, setMargemDesejadaPercentual] = useState<number>(100);

  // Preview de Foto Selecionada
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.fotoUrl || null);

  const selectedPrinter = useMemo(
    () => printers.find((p) => p.id === printerId),
    [printers, printerId]
  );

  const selectedFilament = useMemo(
    () => filaments.find((f) => f.id === filamentId),
    [filaments, filamentId]
  );

  // Reactive Calculation Engine Call
  const custosCalculados = useMemo(() => {
    return calcularCustoPeca({
      material: selectedFilament ? { precoPorKg: selectedFilament.precoPorKg, pesoGramas } : undefined,
      energia: { consumoWatts: selectedPrinter?.consumoWatts || 150, tempoHoras: tempoHorasImpressao, tarifaEnergiaKwh },
      depreciacao: selectedPrinter ? { precoImpressora: selectedPrinter.preco, vidaUtilHoras: selectedPrinter.vidaUtilHoras, tempoHoras: tempoHorasImpressao } : undefined,
      pintura: { tempoHoras: tempoHorasPintura, valorHoraMaoDeObra, custoTintas },
      embalagem: { custoUnitario: custoUnitarioEmbalagem },
      margemDesejadaPercentual,
    });
  }, [
    selectedFilament,
    pesoGramas,
    selectedPrinter,
    tempoHorasImpressao,
    tarifaEnergiaKwh,
    tempoHorasPintura,
    valorHoraMaoDeObra,
    custoTintas,
    custoUnitarioEmbalagem,
    margemDesejadaPercentual,
  ]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (!printerId || !filamentId) {
      setErrorMsg("Você precisa cadastrar e selecionar uma Impressora e um Filamento.");
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const fileInput = e.currentTarget.querySelector<HTMLInputElement>('input[type="file"][name="fotoFile"]');
    const rawFile = fileInput?.files?.[0];

    if (rawFile) {
      try {
        const { compressImageClient } = await import("@/lib/image-compression");
        const compressedFile = await compressImageClient(rawFile, 1200, 0.8);
        formData.set("fotoFile", compressedFile);
      } catch (compressErr) {
        console.warn("⚠️ Aviso na compressão client-side da imagem:", compressErr);
      }
    }

    const res = await savePecaAction(formData);

    setLoading(false);
    if (res?.error) {
      setErrorMsg(res.error);
    } else {
      router.push("/admin/pecas");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}
      <input type="hidden" name="fotoUrl" value={fotoUrl} />

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/pecas">
            <Button type="button" variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              {initialData ? "Editar Peça & Calculadora" : "Nova Peça & Calculadora de Custos"}
            </h1>
            <p className="text-xs text-slate-400">
              Preencha os parâmetros para calcular os custos reais de produção e definir margem.
            </p>
          </div>
        </div>
        <Button type="submit" variant="primary" disabled={loading}>
          <Save className="w-4 h-4" /> {loading ? "Salvando Peça..." : "Salvar Peça"}
        </Button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-medium flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {(printers.length === 0 || filaments.length === 0) && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 text-xs font-medium flex items-center justify-between">
          <span>
            ⚠️ Para um cálculo preciso, certifique-se de cadastrar pelo menos 1 Impressora e 1 Filamento primeiro.
          </span>
          <div className="flex gap-2">
            {printers.length === 0 && (
              <Link href="/admin/impressoras" className="underline font-bold">
                + Impressoras
              </Link>
            )}
            {filaments.length === 0 && (
              <Link href="/admin/filamentos" className="underline font-bold">
                + Filamentos
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Dados da Peça */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-100 pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>1. Informações Gerais da Peça</span>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  name="publicada"
                  value="true"
                  checked={publicada}
                  onChange={(e) => setPublicada(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-teal-500 focus:ring-teal-500"
                />
                <span className={publicada ? "text-teal-400 font-bold" : "text-slate-400"}>
                  {publicada ? "Publicar no Catálogo Público" : "Manter Oculta no Catálogo"}
                </span>
              </label>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome da Peça *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  placeholder="Ex: Bustos Cyberpunk, Vaso Espiral, Miniatura Dragão"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  name="categoria"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  placeholder="Ex: Colecionáveis, Decoração, Utilidades, Action Figures"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Descrição Detalhada
              </label>
              <textarea
                name="descricao"
                rows={3}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descrição visível aos clientes no catálogo público..."
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Foto da Peça (Upload para Supabase Storage)
                </label>
                <input
                  type="file"
                  name="fotoFile"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-teal-400 hover:file:bg-slate-700 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Status de Produção
                </label>
                <select
                  name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                >
                  <option value="em_producao">⚙️ Em Produção</option>
                  <option value="pronta">✅ Pronta</option>
                  <option value="vendida">🛍️ Vendida</option>
                </select>
              </div>
            </div>

            {imagePreview && (
              <div className="mt-2">
                <p className="text-[11px] font-semibold text-slate-400 mb-1">Pré-visualização da Imagem:</p>
                <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Custo de Impressão */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-100 pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>2. Custo de Impressão (Material + Energia + Depreciação)</span>
            </h2>

            {/* G-Code Importer Card */}
            <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-400">
                <FileCode className="w-4 h-4" />
                <span>Importador Automático de Arquivo .GCODE</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Selecione o arquivo .gcode do fatiador (Cura, PrusaSlicer, Bambu Studio ou OrcaSlicer) para preencher o tempo e o peso em gramas automaticamente.
              </p>

              <input
                type="file"
                accept=".gcode"
                onChange={handleGCodeUpload}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-500/10 file:text-teal-300 hover:file:bg-teal-500/20 cursor-pointer"
              />

              {gcodeMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 mt-2 ${
                    gcodeMsg.type === "success"
                      ? "bg-teal-500/10 border border-teal-500/20 text-teal-300"
                      : "bg-amber-500/10 border border-amber-500/20 text-amber-300"
                  }`}
                >
                  {gcodeMsg.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  )}
                  <span>{gcodeMsg.text}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Impressora Utilizada *
                </label>
                <select
                  name="printerId"
                  value={printerId}
                  onChange={(e) => setPrinterId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                >
                  {printers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} ({p.consumoWatts}W - R$ {p.preco})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Filamento / Resina Utilizado *
                </label>
                <select
                  name="filamentId"
                  value={filamentId}
                  onChange={(e) => setFilamentId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                >
                  {filaments.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.tipo} - {f.cor} ({f.marca || "Genérico"}) - R$ {f.precoPorKg}/kg
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Peso Usado (Gramas) *
                </label>
                <input
                  type="number"
                  step="any"
                  name="pesoGramas"
                  value={pesoGramas}
                  onChange={(e) => setPesoGramas(Number(e.target.value))}
                  required
                  placeholder="Ex: 150"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tempo de Impressão (Horas) *
                </label>
                <input
                  type="number"
                  step="any"
                  name="tempoHorasImpressao"
                  value={tempoHorasImpressao}
                  onChange={(e) => setTempoHorasImpressao(Number(e.target.value))}
                  required
                  placeholder="Ex: 5 flex/horas"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tarifa Energia (R$/kWh) *
                </label>
                <input
                  type="number"
                  step="any"
                  name="tarifaEnergiaKwh"
                  value={tarifaEnergiaKwh}
                  onChange={(e) => setTarifaEnergiaKwh(Number(e.target.value))}
                  required
                  placeholder="Ex: 0.85"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Custo de Pintura e Acabamento */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-100 pb-2 border-b border-slate-800">
              3. Custo de Pintura e Acabamento (Opcional)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Custo de Tintas / Primers (R$)
                </label>
                <input
                  type="number"
                  step="any"
                  name="custoTintas"
                  value={custoTintas}
                  onChange={(e) => setCustoTintas(Number(e.target.value))}
                  placeholder="Ex: 15.00"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tempo de Pintura (Horas)
                </label>
                <input
                  type="number"
                  step="any"
                  name="tempoHorasPintura"
                  value={tempoHorasPintura}
                  onChange={(e) => setTempoHorasPintura(Number(e.target.value))}
                  placeholder="Ex: 1.5"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Valor Hora Mão de Obra (R$)
                </label>
                <input
                  type="number"
                  step="any"
                  name="valorHoraMaoDeObra"
                  value={valorHoraMaoDeObra}
                  onChange={(e) => setValorHoraMaoDeObra(Number(e.target.value))}
                  placeholder="Ex: 30.00"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Custo de Embalagem */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-100 pb-2 border-b border-slate-800">
              4. Custo de Embalagem (Opcional)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descrição do Material de Embalagem
                </label>
                <input
                  type="text"
                  name="materialEmbalagemDescricao"
                  value={materialEmbalagemDescricao}
                  onChange={(e) => setMaterialEmbalagemDescricao(e.target.value)}
                  placeholder="Ex: Caixas de Papelão 20x20 + Plástico Bolha"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Custo Unitário da Embalagem (R$)
                </label>
                <input
                  type="number"
                  step="any"
                  name="custoUnitarioEmbalagem"
                  value={custoUnitarioEmbalagem}
                  onChange={(e) => setCustoUnitarioEmbalagem(Number(e.target.value))}
                  placeholder="Ex: 5.50"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Calculation Summary Card */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-2 text-teal-400 font-bold border-b border-slate-800 pb-3">
              <Calculator className="w-5 h-5" />
              <span>Resumo dos Custos em Tempo Real</span>
            </div>

            {/* Detailed Calculations List */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Filamento ({pesoGramas}g):</span>
                <span className="font-semibold">{formatarMoeda(custosCalculados.custoMaterial)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Energia Elétrica ({tempoHorasImpressao}h):</span>
                <span className="font-semibold">{formatarMoeda(custosCalculados.custoEnergia)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Depreciação Máquina:</span>
                <span className="font-semibold">{formatarMoeda(custosCalculados.custoDepreciacao)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300 pt-2 border-t border-slate-800/80 font-medium">
                <span className="text-slate-300">Subtotal Impressão:</span>
                <span className="text-cyan-400">{formatarMoeda(custosCalculados.custoImpressaoTotal)}</span>
              </div>

              {custosCalculados.custoPintura > 0 && (
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Pintura & Mão de Obra:</span>
                  <span className="font-semibold">{formatarMoeda(custosCalculados.custoPintura)}</span>
                </div>
              )}

              {custosCalculados.custoEmbalagem > 0 && (
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Embalagem:</span>
                  <span className="font-semibold">{formatarMoeda(custosCalculados.custoEmbalagem)}</span>
                </div>
              )}

              {/* Total Production Cost Highlight */}
              <div className="pt-3 border-t border-slate-800/80">
                <div className="flex justify-between items-center">
                  <span className="text-slate-200 font-bold text-sm">CUSTO TOTAL DE PRODUÇÃO:</span>
                  <span className="text-xl font-extrabold text-teal-400">
                    {formatarMoeda(custosCalculados.custoTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing Calculator Section */}
            {(() => {
              const isLowMargin = margemDesejadaPercentual < LIMIAR_MARGEM_BAIXA_PERCENTUAL;
              return (
                <div
                  className={`border rounded-xl p-4 space-y-3 transition-all ${
                    isLowMargin
                      ? "bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-500/10"
                      : "bg-slate-950/80 border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-300">
                      Margem Desejada (%)
                    </label>
                    {isLowMargin && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        ⚠️ Margem Baixa (&lt; {LIMIAR_MARGEM_BAIXA_PERCENTUAL}%)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="any"
                      value={margemDesejadaPercentual}
                      onChange={(e) => setMargemDesejadaPercentual(Number(e.target.value))}
                      className={`w-24 px-3 py-1.5 border rounded-lg text-sm font-bold text-center focus:outline-none ${
                        isLowMargin
                          ? "bg-slate-900 border-amber-500/50 text-amber-300 focus:border-amber-400"
                          : "bg-slate-900 border-slate-800 text-slate-100 focus:border-teal-500"
                      }`}
                    />
                    <span className="text-xs text-slate-400">% de lucro sobre custo</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Preço de Venda Sugerido
                    </span>
                    <div
                      className={`text-2xl font-black mt-0.5 ${
                        isLowMargin ? "text-amber-400" : "text-emerald-400"
                      }`}
                    >
                      {formatarMoeda(custosCalculados.precoSugerido)}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Lucro líquido estimado de{" "}
                      {formatarMoeda(custosCalculados.precoSugerido - custosCalculados.custoTotal)}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </form>
  );
}
