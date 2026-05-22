import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useCreateTransaction } from '@/hooks/useFinTrack'
import { useAccounts } from '@/hooks/useFinTrack'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface NewTransactionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewTransactionModal({ isOpen, onClose }: NewTransactionModalProps) {
  const { data: accounts = [] } = useAccounts()
  const { mutate, isPending } = useCreateTransaction()

  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [form, setForm] = useState({
    account_id: '',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.account_id || !form.amount || !form.category) return

    mutate(
      {
        account_id: Number(form.account_id),
        type,
        amount: Number(form.amount),
        category: form.category,
        description: form.description,
        date: form.date,
      },
      {
        onSuccess: () => {
          onClose()
          setForm({ account_id: '', amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0] })
        },
      }
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Transação">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-surface rounded-xl">
          {(['expense', 'income'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setType(t); setForm(f => ({ ...f, category: '' })) }}
              className={cn(
                'py-2 rounded-lg text-sm font-medium transition-all',
                type === t
                  ? t === 'expense'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              {t === 'expense' ? '↓ Despesa' : '↑ Receita'}
            </button>
          ))}
        </div>

        {/* Conta */}
        <div>
          <label className="label">Conta</label>
          <select
            className="input"
            value={form.account_id}
            onChange={e => setForm(f => ({ ...f, account_id: e.target.value }))}
            required
          >
            <option value="">Selecione uma conta</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        {/* Valor e Data */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              className="input"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Data</label>
            <input
              type="date"
              className="input"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              required
            />
          </div>
        </div>

        {/* Categoria */}
        <div>
          <label className="label">Categoria</label>
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setForm(f => ({ ...f, category: cat }))}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                  form.category === cat
                    ? 'bg-brand-500/20 border-brand-500/40 text-brand-300'
                    : 'border-surface-border text-slate-400 hover:border-surface-muted hover:text-slate-200'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label className="label">Descrição (opcional)</label>
          <input
            type="text"
            placeholder="Ex: Supermercado da semana"
            className="input"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>

        <button type="submit" disabled={isPending} className="btn-primary w-full mt-2">
          {isPending ? 'Salvando...' : 'Registrar Transação'}
        </button>
      </form>
    </Modal>
  )
}
