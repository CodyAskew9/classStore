export interface ChecklistPayItem {
  basePay: number;
  penalty: number;
  isCompleted: boolean;
}

export interface PayrollResult {
  grossPay: number;
  penalties: number;
  netPay: number;
}

/**
 * Weekly payroll — penalties reduce this week's paycheck only.
 * Net Pay = max(0, gross from completed tasks − penalties from incomplete tasks).
 * Never writes negative ledger entries; callers skip debit when netPay is 0.
 */
export function calculateNetPay(items: ChecklistPayItem[]): PayrollResult {
  const grossPay = items
    .filter((item) => item.isCompleted)
    .reduce((sum, item) => sum + item.basePay, 0);

  const penalties = items
    .filter((item) => !item.isCompleted)
    .reduce((sum, item) => sum + item.penalty, 0);

  const netPay = Math.max(0, grossPay - penalties);

  return { grossPay, penalties, netPay };
}
