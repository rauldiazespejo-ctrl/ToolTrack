import { type ReactNode } from 'react'
import { cn } from '../../lib/utils'

type TableProps = {
  headers: string[]
  children: ReactNode
  className?: string
}

export function Table({ headers, children, className }: TableProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)]">
            {headers.map(header => (
              <th key={header} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {children}
        </tbody>
      </table>
    </div>
  )
}

type TableRowProps = {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function TableRow({ children, className, onClick }: TableRowProps) {
  return (
    <tr
      className={cn(
        'transition-colors hover:bg-white/[0.02]',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

type TableCellProps = {
  children: ReactNode
  className?: string
}

export function TableCell({ children, className }: TableCellProps) {
  return (
    <td className={cn('px-4 py-3 text-[var(--text-primary)]', className)}>
      {children}
    </td>
  )
}
