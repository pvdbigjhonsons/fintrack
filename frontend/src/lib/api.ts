import axios from 'axios'
import type {
  Account, Transaction, Debt, DashboardData,
  CreateAccountPayload, CreateTransactionPayload, CreateDebtPayload,
} from './types'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// ─── Dashboard ────────────────────────────────────────────────
export const fetchDashboard = async (): Promise<DashboardData> => {
  const { data } = await api.get('/dashboard')
  return data
}

// ─── Accounts ─────────────────────────────────────────────────
export const fetchAccounts = async (): Promise<Account[]> => {
  const { data } = await api.get('/accounts')
  return data
}

export const createAccount = async (payload: CreateAccountPayload) => {
  const { data } = await api.post('/accounts', payload)
  return data
}

export const deleteAccount = async (id: number) => {
  const { data } = await api.delete(`/accounts/${id}`)
  return data
}

// ─── Transactions ─────────────────────────────────────────────
export const fetchTransactions = async (params?: {
  account_id?: number
  type?: string
  from?: string
  to?: string
}): Promise<Transaction[]> => {
  const { data } = await api.get('/transactions', { params })
  return data
}

export const createTransaction = async (payload: CreateTransactionPayload) => {
  const { data } = await api.post('/transactions', payload)
  return data
}

export const deleteTransaction = async (id: number) => {
  const { data } = await api.delete(`/transactions/${id}`)
  return data
}

// ─── Debts ────────────────────────────────────────────────────
export const fetchDebts = async (status?: string): Promise<Debt[]> => {
  const { data } = await api.get('/debts', { params: status ? { status } : {} })
  return data
}

export const createDebt = async (payload: CreateDebtPayload) => {
  const { data } = await api.post('/debts', payload)
  return data
}

export const payInstallment = async (id: number, amount: number) => {
  const { data } = await api.post(`/debts/${id}/pay`, { amount })
  return data
}

export const deleteDebt = async (id: number) => {
  const { data } = await api.delete(`/debts/${id}`)
  return data
}
