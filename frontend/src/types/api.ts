export type RecordType = 'INCOME' | 'EXPENSE'

export interface FinancialRecord {
  id: string
  user_id: string
  amount: string
  type: RecordType
  category: string
  date: string
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface DashboardSummary {
  totalIncome: string
  totalExpenses: string
  netBalance: string
  categoryTotals: Record<string, number>
  expenseCategoryTotals: Record<string, number>
  recentActivity: FinancialRecord[]
}

export interface UserSummary {
  id: string
  email: string
  role: string
  status: string
}
