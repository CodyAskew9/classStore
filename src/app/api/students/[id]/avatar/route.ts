import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  applyBodyType,
  applyFantasyOutfit,
  applySlotSelection,
  getAvatarRenderPaths,
  normalizeAvatarConfig,
  type AvatarConfig,
  type AvatarSlot,
  type BodyType,
} from "@/lib/avatar/avatar";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await req.json()) as {
    slot?: AvatarSlot;
    asset?: string;
    bodyType?: BodyType;
    fantasyOutfit?: string;
    avatarConfig?: AvatarConfig;
  };

  const student = await prisma.user.findUnique({ where: { id } });

  if (!student || student.role !== "STUDENT") {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  let nextConfig: AvatarConfig;

  if (body.bodyType) {
    nextConfig = applyBodyType(normalizeAvatarConfig(student.avatarConfig), body.bodyType);
  } else if (body.fantasyOutfit) {
    nextConfig = applyFantasyOutfit(
      normalizeAvatarConfig(student.avatarConfig),
      body.fantasyOutfit,
    );
  } else if (body.slot && body.asset) {
    nextConfig = applySlotSelection(
      normalizeAvatarConfig(student.avatarConfig),
      body.slot,
      body.asset,
    );
  } else if (body.avatarConfig) {
    nextConfig = normalizeAvatarConfig(body.avatarConfig);
  } else {
    return NextResponse.json(
      { error: "Provide slot+asset, bodyType, fantasyOutfit, or avatarConfig" },
      { status: 400 },
    );
  }

  const updated = await prisma.user.update({
    where: { id: student.id },
    data: { avatarConfig: nextConfig as unknown as Prisma.InputJsonValue },
    select: { id: true, avatarConfig: true },
  });

  const avatarConfig = normalizeAvatarConfig(updated.avatarConfig);

  return NextResponse.json({
    id: updated.id,
    avatarConfig,
    avatarRenderPaths: getAvatarRenderPaths(avatarConfig),
  });
}
