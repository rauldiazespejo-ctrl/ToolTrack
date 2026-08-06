import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  integer,
  numeric,
  boolean,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core'

// ============ ENUMS ============

export const equipmentTypeEnum = pgEnum('equipment_type', [
  'herramienta', 'vehiculo', 'maquinaria', 'epp',
])
export const equipmentStatusEnum = pgEnum('equipment_status', [
  'disponible', 'en_uso', 'mantenimiento', 'fuera_servicio',
])

export const inventoryCategoryEnum = pgEnum('inventory_category', [
  'electrodos', 'discos', 'gases', 'epp', 'repuestos',
])
export const inventoryUnitEnum = pgEnum('inventory_unit', [
  'unidad', 'kg', 'litro', 'metro', 'caja', 'par', 'cilindro',
])

export const maintenanceTypeEnum = pgEnum('maintenance_type', [
  'preventivo', 'correctivo', 'calibracion',
])
export const maintenanceStatusEnum = pgEnum('maintenance_status', [
  'pendiente', 'en_progreso', 'completado', 'vencido',
])
export const priorityEnum = pgEnum('priority', ['alta', 'media', 'baja'])

export const alertTypeEnum = pgEnum('alert_type', [
  'stock_bajo', 'mantenimiento_vencido', 'equipo_sin_devolver', 'calibracion',
])
export const alertSeverityEnum = pgEnum('alert_severity', [
  'critica', 'alta', 'media', 'baja',
])

export const activityActionEnum = pgEnum('activity_action', [
  'checkout', 'checkin', 'transfer', 'maintenance',
])

// ============ ORGANIZATIONS / USERS ============

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().unique(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  email: text('email').notNull(),
  fullName: text('full_name'),
  role: varchar('role', { length: 32 }).default('member').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  clerkIdx: index('users_clerk_idx').on(t.clerkId),
  orgIdx: index('users_org_idx').on(t.orgId),
}))

// ============ EQUIPMENT ============

export const equipment = pgTable('equipment', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  type: equipmentTypeEnum('type').notNull(),
  brand: text('brand').notNull().default(''),
  model: text('model').notNull().default(''),
  serialNumber: text('serial_number').notNull(),
  status: equipmentStatusEnum('status').notNull().default('disponible'),
  locationSite: text('location_site').notNull().default(''),
  assignedTo: text('assigned_to'),
  qrCode: text('qr_code').notNull().default(''),
  purchaseDate: text('purchase_date').notNull().default(''),
  purchaseCost: numeric('purchase_cost', { precision: 14, scale: 2 }).notNull().default('0'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  orgIdx: index('equipment_org_idx').on(t.orgId),
  serialIdx: index('equipment_serial_idx').on(t.serialNumber),
}))

// ============ INVENTORY ============

export const inventoryItems = pgTable('inventory_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  category: inventoryCategoryEnum('category').notNull(),
  quantity: integer('quantity').notNull().default(0),
  minStock: integer('min_stock').notNull().default(0),
  unit: inventoryUnitEnum('unit').notNull().default('unidad'),
  locationWarehouse: text('location_warehouse').notNull().default(''),
  supplier: text('supplier').notNull().default(''),
  lastRestock: text('last_restock').notNull().default(''),
  costPerUnit: numeric('cost_per_unit', { precision: 14, scale: 2 }).notNull().default('0'),
}, (t) => ({
  orgIdx: index('inventory_org_idx').on(t.orgId),
}))

// ============ MAINTENANCE ============

export const maintenanceOrders = pgTable('maintenance_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  equipmentId: uuid('equipment_id').references(() => equipment.id, { onDelete: 'cascade' }),
  equipmentName: text('equipment_name'),
  type: maintenanceTypeEnum('type').notNull(),
  status: maintenanceStatusEnum('status').notNull().default('pendiente'),
  description: text('description').notNull().default(''),
  assignedTo: text('assigned_to').notNull().default(''),
  priority: priorityEnum('priority').notNull().default('media'),
  scheduledDate: text('scheduled_date').notNull().default(''),
  completedDate: text('completed_date'),
  cost: numeric('cost', { precision: 14, scale: 2 }).notNull().default('0'),
  notes: text('notes').notNull().default(''),
}, (t) => ({
  orgIdx: index('maintenance_org_idx').on(t.orgId),
  eqIdx: index('maintenance_eq_idx').on(t.equipmentId),
}))

// ============ ALERTS ============

export const alerts = pgTable('alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  type: alertTypeEnum('type').notNull(),
  severity: alertSeverityEnum('severity').notNull().default('media'),
  title: text('title').notNull(),
  message: text('message').notNull().default(''),
  relatedId: text('related_id'),
  relatedType: text('related_type'),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  orgIdx: index('alerts_org_idx').on(t.orgId),
  unreadIdx: index('alerts_unread_idx').on(t.orgId, t.isRead),
}))

// ============ ACTIVITY LOG ============

export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  equipmentId: uuid('equipment_id').references(() => equipment.id, { onDelete: 'set null' }),
  equipmentName: text('equipment_name'),
  action: activityActionEnum('action').notNull(),
  userName: text('user_name').notNull().default(''),
  fromLocation: text('from_location'),
  toLocation: text('to_location'),
  notes: text('notes').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  orgIdx: index('activity_org_idx').on(t.orgId),
}))
