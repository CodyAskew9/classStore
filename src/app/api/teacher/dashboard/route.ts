import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWalletBalance } from "@/lib/wallet/queries";

export async function GET() {
  const classroom = await prisma.class.findFirst({
    include: {
      settings: true,
      users: { where: { role: "STUDENT" }, orderBy: { name: "asc" } },
    },
  });

  const roster = await Promise.all(
    (classroom?.users ?? []).map(async (student) => ({
      id: student.id,
      name: student.name,
      schoolBalance: await getWalletBalance(student.id, "school"),
    })),
  );

  return NextResponse.json({
    className: classroom?.name ?? null,
    enableBehavior: classroom?.settings?.enableBehavior ?? false,
    roster,
  });
}
