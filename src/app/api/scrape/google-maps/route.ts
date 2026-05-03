import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

interface GooglePlace {
  displayName?: { text: string };
  formattedAddress?: string;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  addressComponents?: Array<{ longText: string; types: string[] }>;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY no configurada" }, { status: 400 });
  }

  const { query, location, limit = 20 } = await req.json();
  if (!query || !location) {
    return NextResponse.json({ error: "query y location son requeridos" }, { status: 400 });
  }

  const resp = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": [
        "places.displayName",
        "places.formattedAddress",
        "places.websiteUri",
        "places.nationalPhoneNumber",
        "places.internationalPhoneNumber",
        "places.addressComponents",
      ].join(","),
    },
    body: JSON.stringify({
      textQuery: `${query} ${location}`,
      maxResultCount: Math.min(limit, 20),
      languageCode: "en",
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    return NextResponse.json({ error: `Google Places error: ${text}` }, { status: resp.status });
  }

  const json = await resp.json();
  const places: GooglePlace[] = json.places ?? [];

  let created = 0;
  let skipped = 0;

  for (const place of places) {
    const name = place.displayName?.text;
    if (!name) continue;

    const country = place.addressComponents?.find((c) => c.types.includes("country"))?.longText ?? location;
    const city = place.addressComponents?.find((c) => c.types.includes("locality"))?.longText ?? null;
    const phone = place.internationalPhoneNumber ?? place.nationalPhoneNumber ?? null;

    const existing = await prisma.company.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        country: { equals: country, mode: "insensitive" },
      },
    });

    if (existing) { skipped++; continue; }

    await prisma.company.create({
      data: {
        name,
        website: place.websiteUri ?? null,
        country,
        city,
        type: "BOTH",
        source: "GOOGLE_MAPS",
        hsCodes: [],
        contacts: phone
          ? { create: { firstName: "Contacto", lastName: name, phone, isPrimary: true } }
          : undefined,
      },
    });
    created++;
  }

  return NextResponse.json({ created, skipped, total: places.length });
}
