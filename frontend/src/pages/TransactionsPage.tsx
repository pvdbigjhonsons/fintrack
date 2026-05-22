import { useState } from 'react'
import { Plus, Filter } from 'lucide-react'
import { useTransactions, useDeleteTransaction } from '@/hooks/useFinTrack'
import { TransactionRow } from '@/components/transactions/TransactionRow'
import { NewTransactionModal } from '@/components/transactions/NewTransactionModal'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

type FilterType = 'all' | 'income' | 'expense'

export function TransactionsPage() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [isOpen, setIsOpen] = useState(false)

  const { data = [], isLoading } = useTransactions(
    filter !== 'all' ? { type: filter } : undefined
  )
  const { mutate: deleteTx } = useDeleteTransaction()

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Transações</h1>
          <p className="text-sm text-slate-500 mt-0.5">{data.length} registro{data.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setIsOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={14} />Nova Transação
        </button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2">
        <Filter size={14} className="text-slate-500" />
        {(['all', 'income', 'expense'] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-medium border transition-all',
              filter === f
                ? 'bg-brand-500/20 border-brand-500/40 text-brand-300'
                : 'border-surface-border text-slate-500 hover:text-slate-200'
            )}
          >
            {{ all: 'Todas', income: 'Receitas', expense: 'Despesas' }[f]}
          </button>
        ))}
      </div>

      <Card>
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-16">Nenhuma transação encontrada</p>
        ) : (
          <div className="divide-y divide-surface-border">
            {data.map(tx => (
              <TransactionRow key={tx.id} transaction={tx} onDelete={id => deleteTx(id)} />
            ))}
          </div>
        )}
      </Card>

      <NewTransactionModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  )
}
