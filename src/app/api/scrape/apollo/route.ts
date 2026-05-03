import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

interface ApolloPerson {
  first_name?: string;
  last_name?: string;
  email?: string;
  title?: string;
  linkedin_url?: string;
  organization?: { website_url?: string; name?: string };
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.APOLLO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "APOLLO_API_KEY no configurada" }, { status: 400 });
  }

  // Get companies with website but no primary contact with email
  const companies = await prisma.company.findMany({
    where: {
      website: { not: null },
      contacts: { none: { email: { not: null } } },
    },
    take: 10,
    select: { id: true, name: true, website: true },
  });

  if (companies.length === 0) {
    return NextResponse.json({ message: "No hay empresas que enriquecer (necesitan tener web y no tener email de contacto)", enriched: 0 });
  }

  let enriched = 0;

  for (const company of companies) {
    const domain = extractDomain(company.website!);
    if (!domain) continue;

    const resp = await fetch("https://api.apollo.io/v1/mixed_people/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        q_organization_domains: [domain],
        page: 1,
        per_page: 5,
        person_titles: ["CEO", "Director", "Manager", "Sales", "Export", "Import", "Commercial"],
      }),
    });

    if (!resp.ok) continue;

    const json = await resp.json();
    const people: ApolloPerson[] = json.people ?? [];

    for (const person of people) {
      if (!person.first_name) continue;
      await prisma.contact.upsert({
        where: {
          id: `apollo-${company.id}-${person.email ?? person.first_name}`,
        },
        create: {
          id: `apollo-${company.id}-${person.email ?? person.first_name}`,
          companyId: company.id,
          firstName: person.first_name,
          lastName: person.last_name ?? null,
          email: person.email ?? null,
          title: person.title ?? null,
          linkedIn: person.linkedin_url ?? null,
          isPrimary: false,
        },
        update: {
          email: person.email ?? undefined,
          title: person.title ?? undefined,
        },
      });
    }

    if (people.length > 0) enriched++;
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
