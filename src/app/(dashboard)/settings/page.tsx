import { Header } from "@/components/layout/header";

export default function SettingsPage() {
  return (
    <div className="flex flex-col">
      <Header title="Configuración" description="API keys y preferencias de la plataforma" />

      <div className="space-y-6 p-6">
        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-sm font-semibold text-white">Variables de entorno necesarias</h2>
          <p className="mb-3 text-xs text-zinc-400">
            Configura estas variables en tu proyecto de Vercel o en el archivo <code className="text-indigo-300">.env.local</code>.
          </p>
          <ul className="space-y-2 text-xs font-mono">
            {[
              ["DATABASE_URL", "postgresql://user:pass@host/db (Supabase)"],
              ["OUTSCRAPER_API_KEY", "API key de Outscraper para Google Maps"],
              ["APOLLO_API_KEY", "API key de Apollo.io para enriquecimiento"],
              ["TENDATA_API_KEY", "API key de Tendata para datos de aduanas"],
            ].map(([key, desc]) => (
              <li key={key} className="flex items-start gap-4 rounded border border-zinc-800 px-3 py-2">
                <span className="text-indigo-300 w-48 shrink-0">{key}</span>
                <span className="text-zinc-500">{desc}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-1 text-sm font-semibold text-white">Base de datos</h2>
          <p className="text-xs text-zinc-400 mb-3">
            Recomendamos Supabase (PostgreSQL gratuito hasta 500MB). Una vez creado el proyecto, copia la connection string y ejecútalo:
          </p>
          <pre className="rounded bg-zinc-950 p-3 text-xs text-indigo-300">
            npx prisma migrate deploy
          </pre>
        </section>
      </div>
    </div>
  );
}
