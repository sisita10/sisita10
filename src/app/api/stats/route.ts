import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [total, newThisWeek, qualified, byCountry, bySource, byStatus] =
    await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.company.count({
        where: { status: { in: ["QUALIFIED", "PROPOSAL_SENT", "NEGOTIATION", "WON"] } },
      }),
      prisma.company.groupBy({
        by: ["country"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      prisma.company.groupBy({
        by: ["source"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
      prisma.company.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ]);

  return NextResponse.json({ total, newThisWeek, qualified, byCountry, bySource, byStatus });
}
