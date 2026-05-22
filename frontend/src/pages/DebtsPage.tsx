import { useState } from 'react'
import { Plus, Trash2, DollarSign } from 'lucide-react'
import { useDebts, useDeleteDebt, usePayInstallment } from '@/hooks/useFinTrack'
import { NewDebtModal } from '@/components/debts/NewDebtModal'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency, formatDate, progressPercent, DEBT_TYPE_LABELS } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Debt } from '@/lib/types'

function DebtCard({ debt, onDelete, onPay }: { debt: Debt; onDelete: () => void; onPay: () => void }) {
  const progress = progressPercent(debt.paid_amount, debt.total_amount)

  return (
    <Card hover className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-slate-200">{debt.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{DEBT_TYPE_LABELS[debt.type] ?? debt.type}</p>
        </div>
        <span className={cn(
          'text-xs px-2 py-0.5 rounded-full font-medium',
          debt.status === 'active' ? 'bg-orange-400/10 text-orange-300' :
          debt.status === 'overdue' ? 'bg-red-400/10 text-red-300' :
          'bg-brand-400/10 text-brand-300'
        )}>
          {debt.status === 'active' ? 'Ativa' : debt.status === 'paid' ? 'Paga' : 'Vencida'}
        </span>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-500">{debt.paid_installments}/{debt.installments} parcelas pagas</span>
          <span className="text-slate-400 font-medium">{progress}%</span>
        </div>
        <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-700',
              debt.status === 'paid' ? 'bg-brand-500' : 'bg-orange-500'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Valores */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="bg-surface rounded-lg p-2.5">
          <p className="text-xs text-slate-500">Total</p>
          <p className="font-mono font-medium text-slate-200">{formatCurrency(debt.total_amount)}</p>
        </div>
        <div className="bg-surface rounded-lg p-2.5">
          <p className="text-xs text-slate-500">Restante</p>
          <p className="font-mono font-medium text-red-400">{formatCurrency(debt.remaining_amount)}</p>
        </div>
      </div>

      {/* Detalhes */}
      <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
        {debt.interest_rate > 0 && <span>Juros: {debt.interest_rate}% a.m.</span>}
        {debt.next_due_date && <span>Vence: {formatDate(debt.next_due_date)}</span>}
        <span>Dia {debt.due_day} todo mês</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {debt.status === 'active' && (
          <button
            onClick={onPay}
            className="flex-1 btn-primary text-xs flex items-center justify-center gap-1.5 py-1.5"
          >
            <DollarSign size={12} />Pagar parcela
          </button>
        )}
        <button
          onClick={onDelete}
          className="p-1.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all border border-surface-border"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </Card>
  )
}

export function DebtsPage() {
  const { data = [], isLoading } = useDebts()
  const { mutate: deleteDebt } = useDeleteDebt()
  const { mutate: payInstallment, isPending: isPaying } = usePayInstallment()

  const [isNewOpen, setIsNewOpen] = useState(false)
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null)
  const [payAmount, setPayAmount] = useState('')

  const activeDebts = data.filter(d => d.status === 'active')
  const paidDebts = data.filter(d => d.status === 'paid')

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Dívidas</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {activeDebts.length} ativa{activeDebts.length !== 1 ? 's' : ''}
            {paidDebts.length > 0 && `, ${paidDebts.length} quitada${paidDebts.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={() => setIsNewOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={14} />Nova Dívida
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : data.length === 0 ? (
        <Card className="py-16 text-center">
          <p className="text-slate-500 text-sm">Nenhuma dívida registrada 🎉</p>
        </Card>
      ) : (
        <>
          {activeDebts.length > 0 && (
            <section>
              <h2 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Dívidas Ativas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeDebts.map(debt => (
                  <DebtCard
                    key={debt.id}
                    debt={debt}
                    onDelete={() => deleteDebt(debt.id)}
                    onPay={() => {
                      setPayingDebt(debt)
                      setPayAmount(String((debt.total_amount / debt.installments).toFixed(2)))
                    }}
                  />
                ))}
              </div>
            </section>
          )}
          {paidDebts.length > 0 && (
            <section>
              <h2 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Quitadas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paidDebts.map(debt => (
                  <DebtCard
                    key={debt.id}
                    debt={debt}
                    onDelete={() => deleteDebt(debt.id)}
                    onPay={() => {}}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <NewDebtModal isOpen={isNewOpen} onClose={() => setIsNewOpen(false)} />

      {/* Pay installment modal */}
      <Modal isOpen={!!payingDebt} onClose={() => setPayingDebt(null)} title="Pagar Parcela" size="sm">
        {payingDebt && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Registrar pagamento de <strong className="text-slate-200">{payingDebt.name}</strong>
            </p>
            <div>
              <label className="label">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
              />
            </div>
            <button
              disabled={isPaying}
              className="btn-primary w-full"
              onClick={() => {
                payInstallment(
                  { id: payingDebt.id, amount: Number(payAmount) },
                  { onSuccess: () => setPayingDebt(null) }
                )
              }}
            >
              {isPaying ? 'Registrando...' : 'Confirmar Pagamento'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
