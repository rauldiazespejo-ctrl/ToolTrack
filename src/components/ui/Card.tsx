import { type ReactNode } from 'react'
import { cn } from '../../lib/utils'

type CardProps = {
  children: ReactNode
  title?: string
  action?: ReactNode
  className?: string
  padding?: boolean
}

export function Card({ children, title, action, className, padding = true }: CardProps) {
  return (
    <div className={cn(
      'rounded-xl border border-[var(--border)] bg-[var(--bg-card)]',
      className
    )}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          {title && <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={cn(padding && 'p-5')}>
        {children}
      </div>
    </div>
  )
}
