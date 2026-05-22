import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  // dateStr pode ser "2024-05-10" ou ISO completo
  const [y, m, d] = dateStr.split('T')[0].split('-')
  return `${d}/${m}/${y}`
}

export function progressPercent(paid: number, total: number): number {
  if (total <= 0) return 0
  return Math.min(100, Math.round((paid / total) * 100))
}

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  checking:   'Conta Corrente',
  savings:    'Poupança',
  cash:       'Dinheiro',
  investment: 'Investimentos',
}

export const DEBT_TYPE_LABELS: Record<string, string> = {
  credit_card: 'Cartão de Crédito',
  loan:        'Empréstimo',
  financing:   'Financiamento',
  other:       'Outro',
}

export const EXPENSE_CATEGORIES = [
  'Moradia', 'Alimentação', 'Transporte', 'Saúde',
  'Lazer', 'Educação', 'Assinaturas', 'Vestuário', 'Outros',
]

export const INCOME_CATEGORIES = [
  'Salário', 'Freelance', 'Investimentos', 'Vendas', 'Presente', 'Outros',
]
