import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchDashboard, fetchAccounts, createAccount, deleteAccount,
  fetchTransactions, createTransaction, deleteTransaction,
  fetchDebts, createDebt, payInstallment, deleteDebt,
} from '@/lib/api'
import type {
  CreateAccountPayload, CreateTransactionPayload, CreateDebtPayload,
} from '@/lib/types'

// ─── Dashboard ────────────────────────────────────────────────
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    staleTime: 30_000,   // 30s
    refetchInterval: 60_000,
  })
}

// ─── Accounts ─────────────────────────────────────────────────
export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: fetchAccounts,
  })
}

export function useCreateAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAccountPayload) => createAccount(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteAccount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteAccount(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['accounts'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

// ─── Transactions ─────────────────────────────────────────────
export function useTransactions(params?: { account_id?: number; type?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => fetchTransactions(params),
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) => createTransaction(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteTransaction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

// ─── Debts ────────────────────────────────────────────────────
export function useDebts(status?: string) {
  return useQuery({
    queryKey: ['debts', status],
    queryFn: () => fetchDebts(status),
  })
}

export function useCreateDebt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateDebtPayload) => createDebt(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['debts'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function usePayInstallment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) => payInstallment(id, amount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['debts'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteDebt() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteDebt(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['debts'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
