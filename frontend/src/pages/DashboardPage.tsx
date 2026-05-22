import { useState } from 'react'
import {
  Wallet, TrendingDown, TrendingUp, CreditCard,
  Plus, ArrowUpRight, RefreshCw,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useDashboard, useDeleteTransaction } from '@/hooks/useFinTrack'
import { StatCard, Card } from '@/components/ui/Card'
import { TransactionRow } from '@/components/transactions/TransactionRow'
import { NewTransactionModal } from '@/components/transactions/NewTransactionModal'
import { NewDebtModal } from '@/components/debts/NewDebtModal'
import { formatCurrency, formatDate, progressPercent, DEBT_TYPE_LABELS } from '@/lib/utils'
import { cn } from '@/lib/utils'

// Tooltip customizado para gráficos
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2 text-xs shadow-2xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-mono">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="card px-3 py-2 text-xs shadow-2xl">
      <p className="text-slate-200 font-medium">{payload[0].name}</p>
      <p className="font-mono text-slate-400">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboard()
  const deleteTransaction = useDeleteTransaction()

  const [txModalOpen, setTxModalOpen] = useState(false)
  const [debtModalOpen, setDebtModalOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Carregando dados...</p>
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <p className="text-red-400 font-medium">Erro ao conectar com a API</p>
          <p className="text-xs text-slate-500">Verifique se o servidor Go está rodando na porta 8080</p>
          <button onClick={() => refetch()} className="btn-primary flex items-center gap-2 mx-auto">
            <RefreshCw size={14} />Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  const monthSavings = data.monthly_income - data.monthly_expenses
  const debtProgress = (data.active_debts_list ?? []).map(d => ({
    ...d,
    progress: progressPercent(d.paid_amount, d.total_amount),
  }))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Visão geral das suas finanças</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDebtModalOpen(true)} className="btn-ghost flex items-center gap-2 text-sm border border-surface-border">
            <CreditCard size={14} />Nova Dívida
          </button>
          <button onClick={() => setTxModalOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={14} />Nova Transação
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Saldo Total"
          value={formatCurrency(data.total_balance)}
          icon={<Wallet size={18} />}
          accent="text-slate-100"
          delay="0ms"
        />
        <StatCard
          label="Receitas do Mês"
          value={formatCurrency(data.monthly_income)}
          icon={<TrendingUp size={18} />}
          accent="text-brand-400"
          delay="80ms"
        />
        <StatCard
          label="Despesas do Mês"
          value={formatCurrency(data.monthly_expenses)}
          icon={<TrendingDown size={18} />}
          accent="text-red-400"
          delay="160ms"
          trend={monthSavings > 0
            ? { value: `${formatCurrency(monthSavings)} economizados`, positive: true }
            : { value: `${formatCurrency(-monthSavings)} no negativo`, positive: false }
          }
        />
        <StatCard
          label="Total em Dívidas"
          value={formatCurrency(data.total_debt)}
          icon={<CreditCard size={18} />}
          accent="text-orange-400"
          delay="240ms"
          trend={{ value: `${data.active_debts} dívida${data.active_debts !== 1 ? 's' : ''} ativa${data.active_debts !== 1 ? 's' : ''}`, positive: false }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Evolução mensal */}
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Evolução dos últimos 6 meses</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.monthly_evolution ?? []} barGap={4}>
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="income" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Gastos por categoria */}
        <Card>
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Gastos por categoria</h2>
          {(data.expenses_by_category ?? []).length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.expenses_by_category ?? []}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {(data.expenses_by_category ?? []).map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  formatter={(value) => <span className="text-xs text-slate-400">{value}</span>}
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500 text-center py-12">Sem gastos este mês</p>
          )}
        </Card>
      </div>

      {/* Accounts + Recent transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Contas */}
        <Card className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-300">Minhas Contas</h2>
          {(data.accounts ?? []).map(acc => (
            <div key={acc.id} className="flex items-center gap-3 py-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: acc.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{acc.name}</p>
                <p className="text-xs text-slate-500">{acc.currency}</p>
              </div>
              <span className="text-sm font-mono font-medium text-slate-200">
                {formatCurrency(acc.balance, acc.currency)}
              </span>
            </div>
          ))}
        </Card>

        {/* Últimas transações */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-300">Transações Recentes</h2>
            <button className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors">
              Ver todas <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-surface-border">
            {(data.recent_transactions ?? []).map(tx => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                onDelete={(id) => deleteTransaction.mutate(id)}
              />
            ))}
            {(!data.recent_transactions || data.recent_transactions.length === 0) && (
              <p className="text-sm text-slate-500 py-8 text-center">Nenhuma transação ainda</p>
            )}
          </div>
        </Card>
      </div>

      {/* Dívidas ativas */}
      {debtProgress.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Dívidas Ativas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {debtProgress.map(debt => (
              <div key={debt.id} className="bg-surface rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{debt.name}</p>
                    <p className="text-xs text-slate-500">{DEBT_TYPE_LABELS[debt.type] ?? debt.type}</p>
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

                {/* Barra de progresso */}
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>{debt.paid_installments}/{debt.installments} parcelas</span>
                    <span>{debt.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-700"
                      style={{ width: `${debt.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Restante</span>
                  <span className="text-red-400 font-mono font-medium">{formatCurrency(debt.remaining_amount)}</span>
                </div>

                {debt.next_due_date && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Próx. venc.</span>
                    <span className="text-slate-300">{formatDate(debt.next_due_date)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modais */}
      <NewTransactionModal isOpen={txModalOpen} onClose={() => setTxModalOpen(false)} />
      <NewDebtModal isOpen={debtModalOpen} onClose={() => setDebtModalOpen(false)} />
    </div>
  )
}
