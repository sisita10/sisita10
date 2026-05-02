import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CompanyType, LeadStatus, LeadSource } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? undefined;
  const country = searchParams.get("country") ?? undefined;
  const type = searchParams.get("type") as CompanyType | null;
  const status = searchParams.get("status") as LeadStatus | null;
  const source = searchParams.get("source") as LeadSource | null;
  const hsCode = searchParams.get("hsCode") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Number(searchParams.get("limit") ?? 25));
  const skip = (page - 1) * limit;

  const where = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { website: { contains: search, mode: "insensitive" as const } },
        { city: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(country && { country }),
    ...(type && { type }),
    ...(status && { status }),
    ...(source && { source }),
    ...(hsCode && { hsCodes: { has: hsCode } }),
  };

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        contacts: { where: { isPrimary: true }, take: 1 },
        tags: { include: { tag: true } },
        _count: { select: { shipments: true, activities: true } },
      },
    }),
    prisma.company.count({ where }),
  ]);

  return NextResponse.json({ companies, total, page, limit });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const company = await prisma.company.create({ data: body });
  return NextResponse.json(company, { status: 201 });
}
