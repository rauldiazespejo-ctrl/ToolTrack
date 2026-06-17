import clsx, { type ClassValue } from 'clsx'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...classes: ClassValue[]) {
  return clsx(classes)
}

export function formatDate(date: string): string {
  return format(parseISO(date), 'dd MMM yyyy', { locale: es })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    disponible: 'text-green-400 bg-green-400/10 border-green-400/20',
    en_uso: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    mantenimiento: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    fuera_servicio: 'text-red-400 bg-red-400/10 border-red-400/20',
    pendiente: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    en_progreso: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    completado: 'text-green-400 bg-green-400/10 border-green-400/20',
    vencido: 'text-red-400 bg-red-400/10 border-red-400/20',
  }
  return colors[status] || 'text-slate-400 bg-slate-400/10 border-slate-400/20'
}

export function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    critica: 'text-red-400 bg-red-400/10 border-red-400/20',
    alta: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    media: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    baja: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  }
  return colors[severity] || 'text-slate-400 bg-slate-400/10 border-slate-400/20'
}
