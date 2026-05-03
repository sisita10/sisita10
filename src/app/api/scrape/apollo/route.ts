import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

interface HunterEmail {
  value?: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  confidence?: number;
}

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "HUNTER_API_KEY no configurada" }, { status: 400 });
  }

  const companies = await prisma.company.findMany({
    where: {
      website: { not: null },
      contacts: { none: { email: { not: null } } },
    },
    take: 10,
    select: { id: true, name: true, website: true },
  });

  if (companies.length === 0) {
    return NextResponse.json({
      message: "No hay empresas que enriquecer (necesitan tener web y no tener email de contacto)",
      enriched: 0,
    });
  }

  let enriched = 0;

  for (const company of companies) {
    const domain = extractDomain(company.website!);
    if (!domain) continue;

    const url = new URL("https://api.hunter.io/v2/domain-search");
    url.searchParams.set("domain", domain);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("limit", "5");

    const resp = await fetch(url.toString());
    if (!resp.ok) continue;

    const json = await resp.json();
    const emails: HunterEmail[] = json.data?.emails ?? [];

    const topEmails = emails
      .filter((e) => e.value && (e.confidence ?? 0) >= 70)
      .slice(0, 3);

    for (const email of topEmails) {
      if (!email.value) continue;
      await prisma.contact.create({
        data: {
          companyId: company.id,
          firstName: email.first_name ?? "Contacto",
          lastName: email.last_name ?? null,
          email: email.value,
          title: email.position ?? null,
          isPrimary: topEmails.indexOf(email) === 0,
        },
      });
    }

    if (topEmails.length > 0) enriched++;
  }

  return NextResponse.json({ enriched, companies: companies.length });
}

function extractDomain(url: string): string | null {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
