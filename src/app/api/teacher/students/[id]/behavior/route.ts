import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSchoolTransaction, getWalletBalance } from "@/lib/wallet/queries";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await req.json()) as { action?: "bonus" | "deduct"; amount?: number };

  if (body.action !== "bonus" && body.action !== "deduct") {
    return NextResponse.json({ error: "action must be bonus or deduct" }, { status: 400 });
  }

  const student = await prisma.user.findUnique({ where: { id } });

  if (!student || student.role !== "STUDENT") {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const classroom = await prisma.class.findFirst({ include: { settings: true } });
  if (!classroom?.settings?.enableBehavior) {
    return NextResponse.json({ error: "Behavior module is disabled for this class" }, { status: 403 });
  }

  const magnitude = Math.abs(body.amount ?? 5);
  if (magnitude < 1 || magnitude > 100) {
    return NextResponse.json({ error: "amount must be between 1 and 100" }, { status: 400 });
  }

  const isBonus = body.action === "bonus";
  const signedAmount = isBonus ? magnitude : -magnitude;

  await createSchoolTransaction({
    studentId: student.id,
    amount: signedAmount,
    type: isBonus ? "BEHAVIOR_BONUS" : "TEACHER_ADJUSTMENT",
    description: isBonus ? "Behavior bonus" : "Behavior deduction",
  });

  const schoolBalance = await getWalletBalance(student.id, "school");

  return NextResponse.json({
    id: student.id,
    schoolBalance,
    delta: signedAmount,
  });
}
