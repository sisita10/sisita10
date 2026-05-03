import Link from "next/link";
import { Header } from "@/components/layout/header";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getShipments(page: number) {
  const limit = 50;
  const skip = (page - 1) * limit;

  const [shipments, total] = await Promise.all([
    prisma.shipment.findMany({
      skip,
      take: limit,
      orderBy: { date: "desc" },
      include: { company: { select: { id: true, name: true, country: true } } },
    }),
    prisma.shipment.count(),
  ]);

  return { shipments, total, page, pages: Math.ceil(total / limit) };
}

export default async function ShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const { shipments, total, pages } = await getShipments(page);

  return (
    <div className="flex flex-col">
      <Header
        title="Envíos"
        description={`${total} registros de importación/exportación`}
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
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Producto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">HS Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Cantidad</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Valor USD</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">Origen → Destino</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-950">
              {shipments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-zinc-500">
                    No hay envíos todavía.{" "}
                    <Link href="/import" className="text-indigo-400 hover:underline">
                      Importa datos de aduanas
                    </Link>
                  </td>
                </tr>
              ) : (
                shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-900/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/leads/${s.company.id}`}
                        className="font-medium text-white hover:text-indigo-300"
                      >
                        {s.company.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{s.company.country}</td>
                    <td className="px-4 py-3 text-zinc-400">
                      {new Date(s.date).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-4 py-3 text-zinc-300 max-w-[180px] truncate">{s.product}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs font-mono text-zinc-300">
                        {s.hsCode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {s.quantity ? `${s.quantity.toLocaleString()} ${s.unit ?? ""}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{formatCurrency(s.valueUsd)}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">
                      {s.originCountry ?? "?"} → {s.destinationCountry ?? "?"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-zinc-400">
            <span>Página {page} de {pages}</span>
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
