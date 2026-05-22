import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useAccounts, useCreateAccount, useDeleteAccount } from '@/hooks/useFinTrack'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency, ACCOUNT_TYPE_LABELS } from '@/lib/utils'

const ACCOUNT_COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6']

export function AccountsPage() {
  const { data: accounts = [], isLoading } = useAccounts()
  const { mutate: createAccount, isPending } = useCreateAccount()
  const { mutate: deleteAccount } = useDeleteAccount()
  const [isOpen, setIsOpen] = useState(false)

  const [form, setForm] = useState({
    name: '',
    type: 'checking',
    balance: '',
    currency: 'BRL',
    color: ACCOUNT_COLORS[0],
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createAccount(
      { ...form, balance: Number(form.balance) },
      {
        onSuccess: () => {
          setIsOpen(false)
          setForm({ name: '', type: 'checking', balance: '', currency: 'BRL', color: ACCOUNT_COLORS[0] })
        },
      }
    )
  }

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Contas</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {accounts.length} conta{accounts.length !== 1 ? 's' : ''} · total {formatCurrency(totalBalance)}
          </p>
        </div>
        <button onClick={() => setIsOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={14} />Nova Conta
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(acc => (
            <Card key={acc.id} hover className="group relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                    style={{ background: acc.color }}>
                    {acc.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200">{acc.name}</p>
                    <p className="text-xs text-slate-500">{ACCOUNT_TYPE_LABELS[acc.type] ?? acc.type}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteAccount(acc.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="mt-2">
                <p className="text-xs text-slate-500 mb-1">Saldo disponível</p>
                <p className="font-display text-2xl font-bold text-slate-100">
                  {formatCurrency(acc.balance, acc.currency)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Nova Conta">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nome da conta</label>
            <input className="input" placeholder="Ex: Nubank Conta Corrente" value={form.name} onChange={set('name')} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Tipo</label>
              <select className="input" value={form.type} onChange={set('type')}>
                {Object.entries(ACCOUNT_TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Moeda</label>
              <select className="input" value={form.currency} onChange={set('currency')}>
                <option value="BRL">BRL (R$)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Saldo inicial (R$)</label>
            <input type="number" step="0.01" placeholder="0,00" className="input" value={form.balance} onChange={set('balance')} />
          </div>
          <div>
            <label className="label">Cor</label>
            <div className="flex gap-2 flex-wrap">
              {ACCOUNT_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color }))}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                  style={{
                    background: color,
                    outline: form.color === color ? `2px solid ${color}` : 'none',
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
          </div>
          <button type="submit" disabled={isPending} className="btn-primary w-full mt-2">
            {isPending ? 'Criando...' : 'Criar Conta'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
