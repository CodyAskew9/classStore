import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const classroom = await prisma.class.findFirst({
    include: { items: { orderBy: { name: "asc" } } },
  });

  const supplyCatalog = await prisma.supplyItem.findMany({ orderBy: { title: "asc" } });

  return NextResponse.json({
    storeItems: (classroom?.items ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      stock: item.stock,
    })),
    supplyCatalog: supplyCatalog.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      priceCents: item.priceCents,
    })),
  });
}
