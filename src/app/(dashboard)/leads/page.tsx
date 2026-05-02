import Link from "next/link";
import { Header } from "@/components/layout/header";
import { StatusBadge } from "@/components/leads/status-badge";
import { SourceBadge } from "@/components/leads/source-badge";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { CompanyType, LeadStatus, LeadSource } from "@prisma/client";

interface SearchParams {
  search?: string;
  country?: string;
  type?: string;
  status?: string;
  source?: string;
  page?: string;
}

async function getLeads(params: SearchParams) {
  const page = Math.max(1, Number(params.page ?? 1));
  const limit = 25;
  const skip = (page - 1) * limit;

  const where = {
    ...(params.search && {
      OR: [
        { name: { contains: params.search, mode: "insensitive" as const } },
        { country: { contains: params.search, mode: "insensitive" as const } },
      ],
    }),
    ...(params.country && { country: params.country }),
    ...(params.type && { type: params.type as CompanyType }),
    ...(params.status && { status: params.status as LeadStatus }),
    ...(params.source && { source: params.source as LeadSource }),
  };

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        contacts: { where: { isPrimary: true }, take: 1 },
        _count: { select: { shipments: true } },
      },
    }),
    prisma.company.count({ where }),
  ]);

  return { companies, total, page, pages: Math.ceil(total / limit) };
}

export default async function LeadsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const { companies, total, page, pages } = await getLeads(params);

  return (
    <div className="flex flex-col">
      <Header
        title="Leads"
        description={`${total} empresas en base de datos`}
        actions={
          <Link
            href="/import"
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            + Importar
          </Link>
        }
      />

      <div className="p-6">
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Empresa</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">País</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Fuente</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Volumen</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Envíos</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Contacto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-950">
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-zinc-500">
                    No hay leads todavía.{" "}
                    <Link href="/import" className="text-indigo-400 hover:underline">
                      Importa tu primer dataset
                    </Link>
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.id} className="hover:bg-zinc-900/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/leads/${company.id}`}
                        className="font-medium text-white hover:text-indigo-300"
                      >
                        {company.name}
                      </Link>
                      {company.website && (
                        <p className="text-xs text-zinc-500">{company.website}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{company.country}</td>
                    <td className="px-4 py-3 text-zinc-300">{company.type}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={company.status} />
                    </td>
                    <td className="px-4 py-3">
                      <SourceBadge source={company.source} />
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {formatCurrency(company.annualVolumeUsd)}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{company._count.shipments}</td>
                    <td className="px-4 py-3 text-zinc-300">
                      {company.contacts[0]
                        ? `${company.contacts[0].firstName} ${company.contacts[0].lastName ?? ""}`
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-zinc-400">
            <span>
              Página {page} de {pages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`?page=${page - 1}`}
                  className="rounded border border-zinc-700 px-3 py-1 hover:border-zinc-500"
                >
                  Anterior
                </Link>
              )}
              {page < pages && (
                <Link
                  href={`?page=${page + 1}`}
                  className="rounded border border-zinc-700 px-3 py-1 hover:border-zinc-500"
                >
                  Siguiente
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
