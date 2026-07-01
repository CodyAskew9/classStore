import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWalletBalance, getWalletTransactions } from "@/lib/wallet/queries";

export async function GET() {
  const parent = await prisma.user.findFirst({
    where: { role: "PARENT" },
    include: {
      children: {
        include: {
          student: { include: { class: { select: { name: true } } } },
        },
      },
    },
  });

  const children = await Promise.all(
    (parent?.children ?? []).map(async ({ student }) => ({
      id: student.id,
      name: student.name,
      className: student.class?.name ?? null,
      homeBalance: await getWalletBalance(student.id, "home"),
      homeActivity: (
        await getWalletTransactions(student.id, "home", 5)
      ).map((tx) => ({
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        description: tx.description ?? null,
      })),
    })),
  );

  return NextResponse.json({ children });
}
