import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, ArrowRightLeft, CreditCard, Wallet, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/',             label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/transactions', label: 'Transações',  icon: ArrowRightLeft },
  { to: '/debts',        label: 'Dívidas',     icon: CreditCard },
  { to: '/accounts',     label: 'Contas',      icon: Wallet },
]

export function Layout() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 border-r border-surface-border flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-surface-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <TrendingUp size={14} className="text-white" />
            </div>
            <span className="font-display text-base font-bold text-slate-100 tracking-tight">FinTrack</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-brand-500/15 text-brand-300 border border-brand-500/25'
                    : 'text-slate-500 hover:text-slate-200 hover:bg-surface-muted/60'
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-surface-border">
          <p className="text-xs text-slate-600">FinTrack v0.1.0</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="h-16 flex items-center px-6 border-b border-surface-border sticky top-0 bg-surface/80 backdrop-blur-md z-10">
          <h2 className="text-sm font-medium text-slate-400">Gestão Financeira Pessoal</h2>
        </div>
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
