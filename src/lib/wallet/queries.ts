import type { Prisma, TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { transactionTypesForScope, type WalletScope } from "./types";

/** Isolated ledger filter — school and home balances never mix in queries */
export function walletWhere(
  studentId: string,
  scope: WalletScope,
): Prisma.TransactionWhereInput {
  return {
    studentId,
    type: { in: [...transactionTypesForScope(scope)] },
  };
}

export async function getWalletBalance(studentId: string, scope: WalletScope): Promise<number> {
  const result = await prisma.transaction.aggregate({
    where: walletWhere(studentId, scope),
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

export async function getWalletTransactions(
  studentId: string,
  scope: WalletScope,
  take = 20,
) {
  return prisma.transaction.findMany({
    where: walletWhere(studentId, scope),
    orderBy: { createdAt: "desc" },
    take,
    include: { storeItem: { select: { name: true } } },
  });
}

export async function createSchoolTransaction(input: {
  studentId: string;
  amount: number;
  type: Extract<TransactionType, "JOB_PAYOUT" | "BEHAVIOR_BONUS" | "STORE_PURCHASE" | "TEACHER_ADJUSTMENT">;
  description?: string;
  itemId?: string;
}) {
  return prisma.transaction.create({ data: input });
}

export async function createHomeTransaction(input: {
  studentId: string;
  amount: number;
  type: Extract<TransactionType, "HOME_CHORE_PAYOUT" | "HOME_ALLOWANCE">;
  description?: string;
}) {
  return prisma.transaction.create({ data: input });
}
