import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const devRouter = Router();

devRouter.get("/student", async (_req, res) => {
  if (process.env.NODE_ENV === "production") {
    res.status(404).end();
    return;
  }

  const student = await prisma.user.findFirst({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "asc" },
  });

  if (!student) {
    res.status(404).json({ error: "No student found. Run: npm run db:seed" });
    return;
  }

  res.json({ id: student.id });
});
