import { NextResponse } from "next/server";
import { getAvatarRenderPaths, normalizeAvatarConfig } from "@/lib/avatar/avatar";
import { prisma } from "@/lib/prisma";
import { getWalletBalance } from "@/lib/wallet/queries";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const student = await prisma.user.findUnique({
    where: { id },
    include: {
      class: { select: { id: true, name: true } },
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { storeItem: { select: { name: true } } },
      },
    },
  });

  if (!student || student.role !== "STUDENT") {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const balance = await getWalletBalance(student.id, "school");
  const avatarConfig = normalizeAvatarConfig(student.avatarConfig);

  return NextResponse.json({
    id: student.id,
    name: student.name,
    avatarConfig,
    avatarRenderPaths: getAvatarRenderPaths(avatarConfig),
    balance,
    class: student.class,
    recentTransactions: student.transactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      type: t.type,
      description: t.description ?? t.storeItem?.name ?? null,
      createdAt: t.createdAt,
    })),
  });
}
