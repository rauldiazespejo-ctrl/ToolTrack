import { type ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '../../lib/utils'

type StatCardProps = {
  icon: ReactNode
  label: string
  value: string | number
  trend?: {
    direction: 'up' | 'down'
    percentage: number
  }
  className?: string
}

export function StatCard({ icon, label, value, trend, className }: StatCardProps) {
  return (
    <div className={cn(
      'rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="rounded-lg bg-[var(--accent)]/10 p-2.5 text-[var(--accent)]">
          {icon}
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            trend.direction === 'up'
              ? 'bg-green-400/10 text-green-400'
              : 'bg-red-400/10 text-red-400'
          )}>
            {trend.direction === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.percentage}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{label}</p>
      </div>
    </div>
  )
}
