import { prisma } from "@/lib/prisma";
import { calculateNetPay } from "./calculate-net-pay";

export type ChecklistLedgerScope = "school" | "home";

const PAYOUT_TYPE: Record<ChecklistLedgerScope, "JOB_PAYOUT" | "HOME_CHORE_PAYOUT"> = {
  school: "JOB_PAYOUT",
  home: "HOME_CHORE_PAYOUT",
};

/**
 * Evaluates checklist items, marks week processed, and appends a single payout
 * to the correct wallet ledger. No entry is written when net pay is 0.
 */
export async function processWeeklyChecklist(
  checklistId: string,
  scope: ChecklistLedgerScope,
  description = "Weekly checklist payout",
) {
  const checklist = await prisma.weeklyChecklist.findUnique({
    where: { id: checklistId },
    include: { items: true },
  });

  if (!checklist) {
    throw new Error("Checklist not found");
  }

  if (checklist.processed) {
    throw new Error("Checklist already processed");
  }

  const { grossPay, penalties, netPay } = calculateNetPay(checklist.items);

  await prisma.$transaction(async (tx) => {
    await tx.weeklyChecklist.update({
      where: { id: checklistId },
      data: { processed: true },
    });

    if (netPay > 0) {
      await tx.transaction.create({
        data: {
          studentId: checklist.studentId,
          amount: netPay,
          type: PAYOUT_TYPE[scope],
          description: `${description} (gross ${grossPay}, penalties ${penalties})`,
        },
      });
    }
  });

  return { grossPay, penalties, netPay, processed: true };
}
