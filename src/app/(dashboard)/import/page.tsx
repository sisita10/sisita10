import { Header } from "@/components/layout/header";

export default function ImportPage() {
  return (
    <div className="flex flex-col">
      <Header
        title="Importar datos"
        description="Carga leads desde CSV, APIs de datos de aduanas o conecta fuentes externas"
      />

      <div className="grid grid-cols-2 gap-6 p-6">
        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-1 text-sm font-semibold text-white">CSV Import</h2>
          <p className="mb-4 text-xs text-zinc-400">
            Sube un archivo CSV exportado de Tendata, Seair, ImportGenius, Apollo.io u otras fuentes.
          </p>
          <p className="mb-3 text-xs text-zinc-500">
            Columnas esperadas: <code className="text-indigo-300">name, country, city, website, type, hsCodes, annualVolumeUsd, contactName, contactEmail, contactTitle</code>
          </p>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 p-8 text-center hover:border-indigo-500 transition-colors">
            <span className="text-2xl mb-2">📂</span>
            <span className="text-sm text-zinc-300">Haz clic para seleccionar un CSV</span>
            <span className="mt-1 text-xs text-zinc-500">o arrastra y suelta aquí</span>
            <input type="file" accept=".csv" className="hidden" />
          </label>
        </section>

        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-1 text-sm font-semibold text-white">Fuentes de datos recomendadas</h2>
          <p className="mb-4 text-xs text-zinc-400">
            Conecta con plataformas especializadas en comercio internacional FMCG.
          </p>
          <ul className="space-y-3 text-sm">
            {[
              { name: "Tendata", desc: "Datos de aduanas, 200+ países", tag: "Aduanas" },
              { name: "Seair Exim", desc: "FMCG específico, precios asequibles", tag: "Aduanas" },
              { name: "Volza", desc: "3B+ envíos, sección FMCG dedicada", tag: "Aduanas" },
              { name: "Apollo.io", desc: "Enriquecimiento de emails y decisores", tag: "Enriquecimiento" },
              { name: "Outscraper", desc: "Google Maps scraping pay-as-you-go", tag: "Mapas" },
            ].map((s) => (
              <li key={s.name} className="flex items-center justify-between rounded border border-zinc-800 px-3 py-2">
                <div>
                  <span className="font-medium text-zinc-200">{s.name}</span>
                  <p className="text-xs text-zinc-500">{s.desc}</p>
                </div>
                <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-300">
                  {s.tag}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="col-span-2 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-1 text-sm font-semibold text-white">HS Codes FMCG de referencia</h2>
          <p className="mb-4 text-xs text-zinc-400">
            Usa estos códigos en Tendata/Seair para filtrar importadores/exportadores de FMCG.
          </p>
          <div className="grid grid-cols-4 gap-2 text-xs">
            {[
              ["16xx", "Carne/pescado preparado"],
              ["17xx", "Azúcares y confitería"],
              ["18xx", "Cacao y chocolate"],
              ["19xx", "Cereales preparados"],
              ["20xx", "Conservas vegetales/frutas"],
              ["21xx", "Preparados alimenticios"],
              ["22xx", "Bebidas"],
              ["33xx", "Perfumería y cosmética"],
            ].map(([code, desc]) => (
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
