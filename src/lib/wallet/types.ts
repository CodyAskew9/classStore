import type { TransactionType } from "@prisma/client";

/** School wallet — classroom jobs, behavior, store (teacher ledger) */
export const SCHOOL_TRANSACTION_TYPES: readonly TransactionType[] = [
  "JOB_PAYOUT",
  "BEHAVIOR_BONUS",
  "STORE_PURCHASE",
  "TEACHER_ADJUSTMENT",
] as const;

/** Home wallet — household chores & allowance (parent ledger, premium) */
export const HOME_TRANSACTION_TYPES: readonly TransactionType[] = [
  "HOME_CHORE_PAYOUT",
  "HOME_ALLOWANCE",
] as const;

export type WalletScope = "school" | "home";

export function transactionTypesForScope(scope: WalletScope): readonly TransactionType[] {
  return scope === "school" ? SCHOOL_TRANSACTION_TYPES : HOME_TRANSACTION_TYPES;
}

export function isSchoolTransaction(type: TransactionType): boolean {
  return (SCHOOL_TRANSACTION_TYPES as readonly string[]).includes(type);
}

export function isHomeTransaction(type: TransactionType): boolean {
  return (HOME_TRANSACTION_TYPES as readonly string[]).includes(type);
}
