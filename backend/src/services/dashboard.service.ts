import { financialRecordRepository } from '../repositories/financial-record.repository.js';

export type DashboardSummary = {
  totalIncome: string;
  totalExpenses: string;
  netBalance: string;
  categoryTotals: Record<string, number>;
  /** Expense-only amounts per category (for dashboard charts). */
  expenseCategoryTotals: Record<string, number>;
  recentActivity: Awaited<ReturnType<typeof financialRecordRepository.findAllActiveOrderByDateDesc>>;
};

/**
 * Aggregates non-deleted records in the service layer so SQLite string amounts are not summed via SQL casts.
 */
export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const records = await financialRecordRepository.findAllActiveOrderByDateDesc();

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryTotals: Record<string, number> = {};
    const expenseCategoryTotals: Record<string, number> = {};

    for (const record of records) {
      const amount = parseFloat(record.amount);

      if (record.type === 'INCOME') {
        totalIncome += amount;
      } else if (record.type === 'EXPENSE') {
        totalExpenses += amount;
      }

      if (!categoryTotals[record.category]) {
        categoryTotals[record.category] = 0;
      }
      categoryTotals[record.category] += amount;

      if (record.type === 'EXPENSE') {
        if (!expenseCategoryTotals[record.category]) {
          expenseCategoryTotals[record.category] = 0;
        }
        expenseCategoryTotals[record.category] += amount;
      }
    }

    const netBalance = totalIncome - totalExpenses;
    const recentActivity = records.slice(0, 5);

    return {
      totalIncome: totalIncome.toFixed(2),
      totalExpenses: totalExpenses.toFixed(2),
      netBalance: netBalance.toFixed(2),
      categoryTotals,
      expenseCategoryTotals,
      recentActivity,
    };
  },
};
