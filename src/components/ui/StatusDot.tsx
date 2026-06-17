import { cn } from '../../lib/utils'

type StatusDotProps = {
  color: 'green' | 'blue' | 'yellow' | 'red' | 'gray'
  pulse?: boolean
  className?: string
}

const colorStyles = {
  green: 'bg-green-400',
  blue: 'bg-blue-400',
  yellow: 'bg-yellow-400',
  red: 'bg-red-400',
  gray: 'bg-slate-400',
}

const pulseStyles = {
  green: 'bg-green-400/40',
  blue: 'bg-blue-400/40',
  yellow: 'bg-yellow-400/40',
  red: 'bg-red-400/40',
  gray: 'bg-slate-400/40',
}

export function StatusDot({ color, pulse = false, className }: StatusDotProps) {
  return (
    <span className={cn('relative inline-flex h-2.5 w-2.5', className)}>
      {pulse && (
        <span className={cn(
          'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
          pulseStyles[color]
        )} />
      )}
      <span className={cn(
        'relative inline-flex h-2.5 w-2.5 rounded-full',
        colorStyles[color]
      )} />
    </span>
  )
}
