import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no están configurados. El cliente se creará con strings vacíos (modo dev).')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Equipment = {
  id: string
  name: string
  type: 'herramienta' | 'vehiculo' | 'maquinaria' | 'epp'
  brand: string
  model: string
  serial_number: string
  status: 'disponible' | 'en_uso' | 'mantenimiento' | 'fuera_servicio'
  location_site: string
  assigned_to: string | null
  qr_code: string
  purchase_date: string
  purchase_cost: number
  photo_url: string | null
  created_at: string
  updated_at: string
}

export type InventoryItem = {
  id: string
  name: string
  category: 'electrodos' | 'discos' | 'gases' | 'epp' | 'repuestos'
  quantity: number
  min_stock: number
  unit: 'unidad' | 'kg' | 'litro' | 'metro' | 'caja' | 'par' | 'cilindro'
  location_warehouse: string
  supplier: string
  last_restock: string
  cost_per_unit: number
}

export type MaintenanceOrder = {
  id: string
  equipment_id: string
  equipment_name?: string
  type: 'preventivo' | 'correctivo' | 'calibracion'
  status: 'pendiente' | 'en_progreso' | 'completado' | 'vencido'
  description: string
  assigned_to: string
  priority: 'alta' | 'media' | 'baja'
  scheduled_date: string
  completed_date: string | null
  cost: number
  notes: string
}

export type Alert = {
  id: string
  type: 'stock_bajo' | 'mantenimiento_vencido' | 'equipo_sin_devolver' | 'calibracion'
  severity: 'critica' | 'alta' | 'media' | 'baja'
  title: string
  message: string
  related_id: string | null
  related_type: string | null
  is_read: boolean
  created_at: string
}

export type ActivityLog = {
  id: string
  equipment_id: string
  equipment_name?: string
  action: 'checkout' | 'checkin' | 'transfer' | 'maintenance'
  user_name: string
  from_location: string | null
  to_location: string | null
  notes: string
  created_at: string
}
