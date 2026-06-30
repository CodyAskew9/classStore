import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import {
  AVATAR_DEFAULTS,
  applyBodyType,
  applyFantasyOutfit,
  applySlotSelection,
  getAvatarCatalog,
  getAvatarRenderPaths,
  normalizeAvatarConfig,
  type AvatarConfig,
  type AvatarSlot,
  type BodyType,
} from "../lib/avatar.js";

export const studentsRouter = Router();

async function getBalance(studentId: string): Promise<number> {
  const result = await prisma.transaction.aggregate({
    where: { studentId },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

studentsRouter.get("/avatars", (req, res) => {
  const bodyType = req.query.bodyType === "female" ? "female" : "male";
  res.json(getAvatarCatalog(bodyType));
});

studentsRouter.get("/:id", async (req, res) => {
  const student = await prisma.user.findUnique({
    where: { id: req.params.id },
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
    res.status(404).json({ error: "Student not found" });
    return;
  }

  const balance = await getBalance(student.id);
  const avatarConfig = normalizeAvatarConfig(student.avatarConfig);

  res.json({
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
});

studentsRouter.patch("/:id/avatar", async (req, res) => {
  const body = req.body as {
    slot?: AvatarSlot;
    asset?: string;
    bodyType?: BodyType;
    fantasyOutfit?: string;
    avatarConfig?: AvatarConfig;
  };

  const student = await prisma.user.findUnique({
    where: { id: req.params.id },
  });

  if (!student || student.role !== "STUDENT") {
    res.status(404).json({ error: "Student not found" });
    return;
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
    res.status(400).json({ error: "Provide slot+asset, bodyType, or avatarConfig" });
    return;
  }

  const updated = await prisma.user.update({
    where: { id: student.id },
    data: { avatarConfig: nextConfig as unknown as Prisma.InputJsonValue },
    select: { id: true, avatarConfig: true },
  });

  res.json({
    id: updated.id,
    avatarConfig: normalizeAvatarConfig(updated.avatarConfig),
    avatarRenderPaths: getAvatarRenderPaths(normalizeAvatarConfig(updated.avatarConfig)),
  });
});

studentsRouter.get("/:id/transactions", async (req, res) => {
  const student = await prisma.user.findUnique({
    where: { id: req.params.id },
  });

  if (!student || student.role !== "STUDENT") {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  const transactions = await prisma.transaction.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: "desc" },
    include: { storeItem: { select: { name: true } } },
  });

  const balance = await getBalance(student.id);

  res.json({ balance, transactions });
});
