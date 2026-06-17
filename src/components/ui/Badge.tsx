import { cn } from '../../lib/utils'

type BadgeProps = {
  children: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

const variantStyles = {
  default: 'text-slate-300 bg-slate-400/10 border-slate-400/20',
  success: 'text-green-400 bg-green-400/10 border-green-400/20',
  warning: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  danger: 'text-red-400 bg-red-400/10 border-red-400/20',
  info: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
      variantStyles[variant],
      className
    )}>
      {children}
    </span>
  )
}
