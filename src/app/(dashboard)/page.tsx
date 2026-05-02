import { Header } from "@/components/layout/header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

async function getStats() {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [total, newThisWeek, qualified, topCountries, bySource] = await Promise.all([
    prisma.company.count(),
    prisma.company.count({ where: { createdAt: { gte: oneWeekAgo } } }),
    prisma.company.count({ where: { status: { in: ["QUALIFIED", "PROPOSAL_SENT", "NEGOTIATION", "WON"] } } }),
    prisma.company.groupBy({ by: ["country"], _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 5 }),
    prisma.company.groupBy({ by: ["source"], _count: { id: true }, orderBy: { _count: { id: "desc" } } }),
  ]);

  return { total, newThisWeek, qualified, topCountries, bySource };
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="flex flex-col">
      <Header
        title="Dashboard"
        description="Resumen general de tu base de leads FMCG"
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <StatsCard label="Total leads" value={stats.total} />
          <StatsCard
            label="Nuevos esta semana"
            value={stats.newThisWeek}
            delta={stats.newThisWeek > 0 ? `+${stats.newThisWeek} nuevos` : "Sin cambios"}
            positive={stats.newThisWeek > 0}
          />
          <StatsCard label="Cualificados" value={stats.qualified} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="mb-4 text-sm font-medium text-zinc-300">Top países</h2>
            {stats.topCountries.length === 0 ? (
              <p className="text-sm text-zinc-500">Sin datos todavía</p>
            ) : (
              <ul className="space-y-2">
                {stats.topCountries.map((c) => (
                  <li key={c.country} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-200">{c.country}</span>
                    <span className="text-sm font-medium text-indigo-400">{c._count.id}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="mb-4 text-sm font-medium text-zinc-300">Por fuente</h2>
            {stats.bySource.length === 0 ? (
              <p className="text-sm text-zinc-500">Sin datos todavía</p>
            ) : (
              <ul className="space-y-2">
                {stats.bySource.map((s) => (
                  <li key={s.source} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-200">{s.source}</span>
                    <span className="text-sm font-medium text-indigo-400">{s._count.id}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
