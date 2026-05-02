import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LeadSource, CompanyType } from "@prisma/client";

// Esperamos CSV con columnas: name,country,city,website,type,hsCodes,annualVolumeUsd,contactName,contactEmail,contactTitle
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const text = await file.text();
  const lines = text.split("\n").filter(Boolean);
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows = lines.slice(1);

  const created: string[] = [];
  const errors: string[] = [];

  for (const row of rows) {
    const cols = row.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const record: Record<string, string> = {};
    headers.forEach((h, i) => { record[h] = cols[i] ?? ""; });

    try {
      const company = await prisma.company.create({
        data: {
          name: record.name,
          country: record.country ?? "Unknown",
          city: record.city || null,
          website: record.website || null,
          type: (record.type?.toUpperCase() as CompanyType) ?? "IMPORTER",
          source: LeadSource.CSV_IMPORT,
          hsCodes: record.hscodes ? record.hscodes.split("|") : [],
          annualVolumeUsd: record.annualvolumeusd ? Number(record.annualvolumeusd) : null,
          contacts: record.contactname
            ? {
                create: {
                  firstName: record.contactname,
                  email: record.contactemail || null,
                  title: record.contacttitle || null,
                  isPrimary: true,
                },
              }
            : undefined,
        },
      });
      created.push(company.id);
    } catch (err) {
      errors.push(`Row "${record.name}": ${String(err)}`);
    }
  }

  return NextResponse.json({ created: created.length, errors });
}
