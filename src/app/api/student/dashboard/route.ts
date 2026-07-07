import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { getAvatarRenderPaths, normalizeAvatarConfig } from "@/lib/avatar/avatar";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getWalletBalance, getWalletTransactions } from "@/lib/wallet/queries";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== Role.STUDENT) {
    return NextResponse.json({ error: "Sign in as a student first" }, { status: 401 });
  }

  const student = await prisma.user.findFirst({
    where: { id: session.userId, role: Role.STUDENT },
    include: { class: { select: { name: true } } },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const [schoolBalance, homeBalance, recentSchool, pendingChecklist] = await Promise.all([
    getWalletBalance(student.id, "school"),
    getWalletBalance(student.id, "home"),
    getWalletTransactions(student.id, "school", 5),
    prisma.weeklyChecklist.findFirst({
      where: { studentId: student.id, processed: false },
      include: { items: true },
    }),
  ]);

  const avatarConfig = normalizeAvatarConfig(student.avatarConfig);

  return NextResponse.json({
    id: student.id,
    name: student.name,
    className: student.class?.name ?? null,
    avatarRenderPaths: getAvatarRenderPaths(avatarConfig),
    schoolBalance,
    homeBalance,
    checklist: pendingChecklist
      ? {
          done: pendingChecklist.items.filter((i) => i.isCompleted).length,
          total: pendingChecklist.items.length,
        }
      : null,
    recentSchool: recentSchool.map((tx) => ({
      id: tx.id,
      amount: tx.amount,
      type: tx.type,
      description: tx.description ?? tx.storeItem?.name ?? null,
    })),
  });
}
