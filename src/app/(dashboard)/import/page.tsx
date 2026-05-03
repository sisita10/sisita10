"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Search, Sparkles, Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";

type Status = { type: "success" | "error"; message: string } | null;

function GoogleMapsSection() {
  const [query, setQuery] = useState("FMCG importer");
  const [location, setLocation] = useState("");
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/scrape/google-maps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, location, limit }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus({
        type: "success",
        message: `${data.created} empresas añadidas, ${data.skipped} ya existían (de ${data.total} resultados)`,
      });
    } catch (err) {
      setStatus({ type: "error", message: String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Search className="h-4 w-4 text-indigo-400" />
        <h2 className="text-sm font-semibold text-white">Google Maps · Outscraper</h2>
      </div>
      <p className="mb-4 text-xs text-zinc-400">
        Busca importadores/exportadores FMCG en Google Maps por país o ciudad. Requiere{" "}
        <code className="text-indigo-300">OUTSCRAPER_API_KEY</code>.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-zinc-400">Qué buscar</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="FMCG importer, food distributor, cosmetics importer…"
            className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-zinc-400">País o ciudad</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="Spain, Mexico City, UAE…"
              className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500"
            />
          </div>
          <div className="w-24">
            <label className="mb-1 block text-xs text-zinc-400">Límite</label>
            <input
              type="number"
              value={limit}
              min={1}
              max={100}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {status && (
          <div className={`flex items-start gap-2 rounded p-3 text-xs ${status.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            {status.type === "success" ? <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />}
            {status.message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {loading ? "Buscando…" : "Buscar leads"}
        </button>
      </form>
    </section>
  );
}

function ApolloSection() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function handleEnrich() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/scrape/apollo", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus({
        type: "success",
        message: data.enriched
          ? `${data.enriched} de ${data.companies} empresas enriquecidas con contactos de Apollo`
          : data.message ?? "Sin novedades",
      });
    } catch (err) {
      setStatus({ type: "error", message: String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-indigo-400" />
        <h2 className="text-sm font-semibold text-white">Enriquecimiento · Apollo.io</h2>
      </div>
      <p className="mb-4 text-xs text-zinc-400">
        Añade contactos (nombre, email, cargo) a las empresas que ya tienes en base de datos pero sin email de contacto.
        Requiere <code className="text-indigo-300">APOLLO_API_KEY</code>.
      </p>

      <div className="mb-4 rounded border border-zinc-800 p-3 text-xs text-zinc-400 space-y-1">
        <p className="font-medium text-zinc-300">Cómo funciona:</p>
        <p>1. Toma hasta 10 empresas con web pero sin email de contacto</p>
        <p>2. Busca en Apollo decisores: CEO, Director, Sales, Export…</p>
        <p>3. Guarda los contactos en tu base de datos</p>
        <p>4. Repite hasta enriquecer todas las empresas</p>
      </div>

      {status && (
        <div className={`mb-3 flex items-start gap-2 rounded p-3 text-xs ${status.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
          {status.type === "success" ? <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />}
          {status.message}
        </div>
      )}

      <button
        onClick={handleEnrich}
        disabled={loading}
        className="flex items-center gap-2 rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? "Enriqueciendo…" : "Enriquecer ahora (10 empresas)"}
      </button>
    </section>
  );
}

function CsvSection() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setStatus(null);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/import/csv", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus({ type: "success", message: `${data.created} empresas importadas del CSV` });
    } catch (err) {
      setStatus({ type: "error", message: String(err) });
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Upload className="h-4 w-4 text-indigo-400" />
        <h2 className="text-sm font-semibold text-white">CSV · Tendata / Volza / Apollo export</h2>
      </div>
      <p className="mb-3 text-xs text-zinc-400">
        Sube un CSV exportado de cualquier fuente de datos de aduanas.
      </p>
      <p className="mb-4 text-xs text-zinc-500">
        Columnas: <code className="text-indigo-300">name, country, city, website, type, hsCodes, annualVolumeUsd, contactName, contactEmail, contactTitle</code>
      </p>

      {status && (
        <div className={`mb-3 flex items-start gap-2 rounded p-3 text-xs ${status.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
          {status.type === "success" ? <CheckCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />}
          {status.message}
        </div>
      )}

      <label className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 p-8 text-center transition-colors hover:border-indigo-500 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
        {loading ? (
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-2" />
        ) : (
          <Upload className="h-8 w-8 text-zinc-500 mb-2" />
        )}
        <span className="text-sm text-zinc-300">
          {loading ? "Importando…" : "Haz clic para seleccionar un CSV"}
        </span>
        <span className="mt-1 text-xs text-zinc-500">o arrastra y suelta aquí</span>
        <input type="file" accept=".csv" className="hidden" disabled={loading} onChange={handleFile} />
      </label>
    </section>
  );
}

const HS_CODES = [
  ["16xx", "Carne/pescado preparado"],
  ["17xx", "Azúcares y confitería"],
  ["18xx", "Cacao y chocolate"],
  ["19xx", "Cereales preparados"],
  ["20xx", "Conservas vegetales/frutas"],
  ["21xx", "Preparados alimenticios"],
  ["22xx", "Bebidas"],
  ["33xx", "Perfumería y cosmética"],
];

export default function ImportPage() {
  return (
    <div className="flex flex-col">
      <Header
        title="Importar datos"
        description="Captura leads desde Google Maps, enriquece con Apollo o importa desde CSV"
      />

      <div className="grid grid-cols-2 gap-6 p-6">
        <GoogleMapsSection />
        <ApolloSection />
        <CsvSection />

        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-1 text-sm font-semibold text-white">HS Codes FMCG de referencia</h2>
          <p className="mb-4 text-xs text-zinc-400">
            Usa estos códigos en Tendata/Seair para filtrar importadores/exportadores.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {HS_CODES.map(([code, desc]) => (
              <div key={code} className="rounded border border-zinc-800 p-2">
                <span className="font-mono font-bold text-indigo-300">{code}</span>
                <p className="mt-0.5 text-zinc-400">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
