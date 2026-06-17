import {
  differenceInCalendarDays,
  format,
  formatDistanceToNow,
  parseISO,
} from 'date-fns'

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('es-CL', {
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatShortDate(date: string) {
  return format(parseISO(date), 'MMM d, yyyy')
}

export function relativeTime(date: string) {
  return formatDistanceToNow(parseISO(date), { addSuffix: true })
}

export function daysUntil(date: string) {
  return differenceInCalendarDays(parseISO(date), parseISO('2026-06-16'))
}
