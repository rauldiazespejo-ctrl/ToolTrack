import { clsx } from 'clsx'
import type { ReactNode } from 'react'

type BadgeProps = {
  children: ReactNode
  tone?: 'positive' | 'info' | 'warning' | 'danger' | 'neutral'
}

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return <span className={clsx('badge', `badge-${tone}`)}>{children}</span>
}
