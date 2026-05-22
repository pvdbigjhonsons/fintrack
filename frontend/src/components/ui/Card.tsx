import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className, hover }: CardProps) {
  return (
    <div
      className={cn(
        'card p-5',
        hover && 'hover:border-surface-muted transition-colors duration-200 cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  icon: ReactNode
  trend?: { value: string; positive: boolean }
  accent?: string
  delay?: string
}

export function StatCard({ label, value, icon, trend, accent = 'text-brand-400', delay = '0ms' }: StatCardProps) {
  return (
    <Card className="animate-slide-up" style={{ animationDelay: delay } as React.CSSProperties}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">{label}</p>
          <p className={cn('stat-value', accent)}>{value}</p>
          {trend && (
            <p className={cn('text-xs mt-2', trend.positive ? 'text-brand-400' : 'text-red-400')}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className="p-2.5 rounded-xl bg-surface-muted/50 text-slate-400">
          {icon}
        </div>
      </div>
    </Card>
  )
}
