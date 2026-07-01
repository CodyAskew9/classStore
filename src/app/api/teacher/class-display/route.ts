import { NextResponse } from "next/server";
import { getAvatarRenderPaths, normalizeAvatarConfig } from "@/lib/avatar/avatar";
import { prisma } from "@/lib/prisma";
import { getWalletBalance } from "@/lib/wallet/queries";

export async function GET() {
  const classroom = await prisma.class.findFirst({
    include: {
      settings: true,
      users: { where: { role: "STUDENT" }, orderBy: { name: "asc" } },
    },
  });

  const students = await Promise.all(
    (classroom?.users ?? []).map(async (student) => {
      const avatarConfig = normalizeAvatarConfig(student.avatarConfig);
      return {
        id: student.id,
        name: student.name,
        schoolBalance: await getWalletBalance(student.id, "school"),
        avatarRenderPaths: getAvatarRenderPaths(avatarConfig),
      };
    }),
  );

  return NextResponse.json({
    className: classroom?.name ?? null,
    enableBehavior: classroom?.settings?.enableBehavior ?? false,
    bonusAmount: 5,
    deductAmount: 5,
    students,
  });
}
