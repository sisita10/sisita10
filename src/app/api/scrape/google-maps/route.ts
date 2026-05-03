import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

interface OutscraperPlace {
  name?: string;
  site?: string;
  phone?: string;
  full_address?: string;
  city?: string;
  country?: string;
  email?: string;
  category?: string;
  description?: string;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.OUTSCRAPER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OUTSCRAPER_API_KEY no configurada" }, { status: 400 });
  }

  const { query, location, limit = 20 } = await req.json();
  if (!query || !location) {
    return NextResponse.json({ error: "query y location son requeridos" }, { status: 400 });
  }

  const fullQuery = `${query} ${location}`;
  const url = new URL("https://api.app.outscraper.com/maps/search-v3");
  url.searchParams.set("query", fullQuery);
  url.searchParams.set("limit", String(Math.min(limit, 100)));
  url.searchParams.set("async", "false");
  url.searchParams.set("language", "en");

  const resp = await fetch(url.toString(), {
    headers: { "X-API-KEY": apiKey },
  });

  if (!resp.ok) {
    const text = await resp.text();
    return NextResponse.json({ error: `Outscraper error: ${text}` }, { status: resp.status });
  }

  const json = await resp.json();
  const places: OutscraperPlace[] = (json.data ?? []).flat();

  let created = 0;
  let skipped = 0;

  for (const place of places) {
    if (!place.name) continue;

    const country = place.country ?? location;

    const existing = await prisma.company.findFirst({
      where: {
        name: { equals: place.name, mode: "insensitive" },
        country: { equals: country, mode: "insensitive" },
      },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.company.create({
      data: {
        name: place.name,
        website: place.site ?? null,
        country,
        city: place.city ?? null,
        type: "BOTH",
        source: "GOOGLE_MAPS",
        hsCodes: [],
        description: place.description ?? place.category ?? null,
        contacts: place.email || place.phone
          ? {
              create: {
                firstName: "Contacto",
                lastName: place.name,
                email: place.email ?? null,
                phone: place.phone ?? null,
                isPrimary: true,
              },
            }
          : undefined,
      },
    });
    created++;
  }

  return NextResponse.json({ created, skipped, total: places.length });
}
