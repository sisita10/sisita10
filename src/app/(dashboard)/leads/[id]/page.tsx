import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { StatusBadge } from "@/components/leads/status-badge";
import { SourceBadge } from "@/components/leads/source-badge";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, FMCG_HS_CODES } from "@/lib/utils";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      contacts: true,
      shipments: { orderBy: { date: "desc" }, take: 20 },
      activities: { orderBy: { createdAt: "desc" }, take: 10 },
      tags: { include: { tag: true } },
    },
  });

  if (!company) notFound();

  return (
    <div className="flex flex-col">
      <Header
        title={company.name}
        description={`${company.country}${company.city ? ` · ${company.city}` : ""}`}
        actions={
          <Link
            href="/leads"
            className="text-sm text-zinc-400 hover:text-white"
          >
            ← Volver
          </Link>
        }
      />

      <div className="grid grid-cols-3 gap-6 p-6">
        <div className="col-span-2 space-y-6">
          <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="mb-4 text-sm font-medium text-zinc-300">Datos de la empresa</h2>
            <dl className="grid grid-cols-2 gap-4">
              {[
                ["Estado", <StatusBadge key="s" status={company.status} />],
                ["Fuente", <SourceBadge key="src" source={company.source} />],
                ["Tipo", company.type],
                ["Web", company.website ?? "—"],
                ["Volumen anual", formatCurrency(company.annualVolumeUsd)],
                ["Empleados", company.employeeCount ?? "—"],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <dt className="text-xs text-zinc-500">{label}</dt>
                  <dd className="mt-0.5 text-sm text-zinc-200">{value}</dd>
                </div>
              ))}
            </dl>

            {company.hsCodes.length > 0 && (
              <div className="mt-4">
                <dt className="text-xs text-zinc-500">HS Codes FMCG</dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {company.hsCodes.map((code) => (
                    <Badge key={code} variant="indigo">
                      {code} — {FMCG_HS_CODES[code.slice(0, 2)] ?? code}
                    </Badge>
                  ))}
                </dd>
              </div>
            )}

            {company.notes && (
              <div className="mt-4">
                <dt className="text-xs text-zinc-500">Notas</dt>
                <dd className="mt-1 text-sm text-zinc-300">{company.notes}</dd>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="mb-4 text-sm font-medium text-zinc-300">
              Historial de envíos ({company.shipments.length})
            </h2>
            {company.shipments.length === 0 ? (
              <p className="text-sm text-zinc-500">Sin envíos registrados</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-zinc-500">
                    <th className="pb-2">Fecha</th>
                    <th className="pb-2">Producto</th>
                    <th className="pb-2">HS Code</th>
                    <th className="pb-2">Valor</th>
                    <th className="pb-2">Origen → Destino</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {company.shipments.map((s) => (
                    <tr key={s.id}>
                      <td className="py-2 text-zinc-400">{formatDate(s.date)}</td>
                      <td className="py-2 text-zinc-200">{s.product}</td>
                      <td className="py-2 text-zinc-400">{s.hsCode}</td>
                      <td className="py-2 text-zinc-200">{formatCurrency(s.valueUsd)}</td>
                      <td className="py-2 text-zinc-400">
                        {s.originCountry ?? "?"} → {s.destinationCountry ?? "?"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="mb-4 text-sm font-medium text-zinc-300">Contactos</h2>
            {company.contacts.length === 0 ? (
              <p className="text-sm text-zinc-500">Sin contactos</p>
            ) : (
              <ul className="space-y-3">
                {company.contacts.map((c) => (
                  <li key={c.id} className="text-sm">
                    <p className="font-medium text-white">
                      {c.firstName} {c.lastName ?? ""}
                      {c.isPrimary && (
                        <Badge variant="indigo" className="ml-2">
                          Principal
                        </Badge>
                      )}
                    </p>
                    {c.title && <p className="text-zinc-400">{c.title}</p>}
                    {c.email && <p className="text-indigo-300">{c.email}</p>}
                    {c.phone && <p className="text-zinc-400">{c.phone}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="mb-4 text-sm font-medium text-zinc-300">Actividad reciente</h2>
            {company.activities.length === 0 ? (
              <p className="text-sm text-zinc-500">Sin actividad</p>
            ) : (
              <ul className="space-y-2">
                {company.activities.map((a) => (
                  <li key={a.id} className="text-sm">
                    <span className="text-zinc-400">{formatDate(a.createdAt)}</span>
                    <span className="mx-2 text-zinc-600">·</span>
                    <span className="text-zinc-200">{a.type}</span>
                    {a.notes && <p className="mt-0.5 text-zinc-500">{a.notes}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
