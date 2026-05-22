import { Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Transaction } from '@/lib/types'
import { cn } from '@/lib/utils'

const CATEGORY_ICONS: Record<string, string> = {
  Salário: '💼', Freelance: '💻', Moradia: '🏠', Alimentação: '🛒',
  Transporte: '🚗', Saúde: '❤️', Lazer: '🎬', Educação: '📚',
  Assinaturas: '📱', Vestuário: '👕', Investimentos: '📈', Outros: '💰',
}

interface TransactionRowProps {
  transaction: Transaction
  onDelete?: (id: number) => void
}

export function TransactionRow({ transaction: tx, onDelete }: TransactionRowProps) {
  const isIncome = tx.type === 'income'
  const icon = CATEGORY_ICONS[tx.category] ?? '💰'

  return (
    <div className="flex items-center gap-4 py-3 group">
      {/* Ícone da categoria */}
      <div className="w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center text-lg flex-shrink-0">
        {icon}
      </div>

      {/* Descrição */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">
          {tx.description || tx.category}
        </p>
        <p className="text-xs text-slate-500">
          {tx.category}
          {tx.account_name && <span className="ml-1 opacity-60">· {tx.account_name}</span>}
        </p>
      </div>

      {/* Data */}
      <span className="text-xs text-slate-500 hidden sm:block flex-shrink-0">
        {formatDate(tx.date)}
      </span>

      {/* Valor */}
      <span className={cn(
        'text-sm font-semibold font-mono flex-shrink-0 tabular-nums',
        isIncome ? 'text-brand-400' : 'text-red-400'
      )}>
        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
      </span>

      {/* Delete */}
      {onDelete && (
        <button
          onClick={() => onDelete(tx.id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}
