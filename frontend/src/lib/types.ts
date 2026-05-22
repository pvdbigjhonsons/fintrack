export interface Account {
  id: number
  name: string
  type: 'checking' | 'savings' | 'cash' | 'investment'
  balance: number
  currency: string
  color: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: number
  account_id: number
  account_name?: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
  created_at: string
}

export interface Debt {
  id: number
  name: string
  type: 'credit_card' | 'loan' | 'financing' | 'other'
  total_amount: number
  paid_amount: number
  remaining_amount: number
  installments: number
  paid_installments: number
  interest_rate: number
  due_day: number
  next_due_date: string
  status: 'active' | 'paid' | 'overdue'
  created_at: string
  updated_at: string
}

export interface CategorySummary {
  category: string
  amount: number
  color: string
}

export interface MonthlyData {
  month: string
  income: number
  expenses: number
}

export interface DashboardData {
  total_balance: number
  monthly_income: number
  monthly_expenses: number
  total_debt: number
  active_debts: number
  accounts: Account[]
  recent_transactions: Transaction[]
  active_debts_list: Debt[]
  expenses_by_category: CategorySummary[]
  monthly_evolution: MonthlyData[]
}

// --- Request types ---

export interface CreateAccountPayload {
  name: string
  type: string
  balance: number
  currency: string
  color: string
}

export interface CreateTransactionPayload {
  account_id: number
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
}

export interface CreateDebtPayload {
  name: string
  type: string
  total_amount: number
  paid_amount: number
  installments: number
  paid_installments: number
  interest_rate: number
  due_day: number
  next_due_date: string
}
