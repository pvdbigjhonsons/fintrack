import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useCreateDebt } from '@/hooks/useFinTrack'

interface NewDebtModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NewDebtModal({ isOpen, onClose }: NewDebtModalProps) {
  const { mutate, isPending } = useCreateDebt()
  const [form, setForm] = useState({
    name: '',
    type: 'credit_card',
    total_amount: '',
    paid_amount: '0',
    installments: '1',
    paid_installments: '0',
    interest_rate: '0',
    due_day: '10',
    next_due_date: '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutate(
      {
        name: form.name,
        type: form.type,
        total_amount: Number(form.total_amount),
        paid_amount: Number(form.paid_amount),
        installments: Number(form.installments),
        paid_installments: Number(form.paid_installments),
        interest_rate: Number(form.interest_rate),
        due_day: Number(form.due_day),
        next_due_date: form.next_due_date,
      },
      { onSuccess: onClose }
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Dívida" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="label">Nome da dívida</label>
            <input className="input" placeholder="Ex: Cartão Nubank" value={form.name} onChange={set('name')} required />
          </div>

          <div>
            <label className="label">Tipo</label>
            <select className="input" value={form.type} onChange={set('type')}>
              <option value="credit_card">Cartão de Crédito</option>
              <option value="loan">Empréstimo</option>
              <option value="financing">Financiamento</option>
              <option value="other">Outro</option>
            </select>
          </div>

          <div>
            <label className="label">Dia de vencimento</label>
            <input type="number" min="1" max="31" className="input" value={form.due_day} onChange={set('due_day')} required />
          </div>

          <div>
            <label className="label">Valor total (R$)</label>
            <input type="number" step="0.01" min="0.01" placeholder="0,00" className="input" value={form.total_amount} onChange={set('total_amount')} required />
          </div>

          <div>
            <label className="label">Valor já pago (R$)</label>
            <input type="number" step="0.01" min="0" placeholder="0,00" className="input" value={form.paid_amount} onChange={set('paid_amount')} />
          </div>

          <div>
            <label className="label">Total de parcelas</label>
            <input type="number" min="1" className="input" value={form.installments} onChange={set('installments')} required />
          </div>

          <div>
            <label className="label">Parcelas pagas</label>
            <input type="number" min="0" className="input" value={form.paid_installments} onChange={set('paid_installments')} />
          </div>

          <div>
            <label className="label">Taxa de juros (% a.m.)</label>
            <input type="number" step="0.01" min="0" placeholder="0,00" className="input" value={form.interest_rate} onChange={set('interest_rate')} />
          </div>

          <div>
            <label className="label">Próximo vencimento</label>
            <input type="date" className="input" value={form.next_due_date} onChange={set('next_due_date')} />
          </div>
        </div>

        <button type="submit" disabled={isPending} className="btn-primary w-full mt-2">
          {isPending ? 'Salvando...' : 'Registrar Dívida'}
        </button>
      </form>
    </Modal>
  )
}
