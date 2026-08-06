import 'dotenv/config'
import { db } from './client'
import { organizations, equipment, inventoryItems } from './schema'

async function main() {
  console.log('Seeding...')

  // Idempotent: only seed if no organizations exist
  const orgs = await db.select().from(organizations).limit(1)
  if (orgs.length > 0) {
    console.log('Already seeded (organizations exist). Skipping.')
    return
  }

  const orgRows = (await db.insert(organizations).values({ name: 'SOLDESP demo' }).returning()) as Array<typeof organizations.$inferSelect>
  const org = orgRows[0]
  console.log('Created org:', org.id)

  await db.insert(equipment).values([
    {
      orgId: org.id,
      name: 'Soldadora MIG Lincoln',
      type: 'maquinaria',
      brand: 'Lincoln',
      model: 'PowerMIG 256',
      serialNumber: 'LN-MIG-001',
      status: 'disponible',
      locationSite: 'Taller Central',
      purchaseDate: '2024-03-15',
      purchaseCost: '1850000',
      qrCode: 'SOLDESP-DEMO-001',
    },
    {
      orgId: org.id,
      name: 'Camion Ford Cargo',
      type: 'vehiculo',
      brand: 'Ford',
      model: 'Cargo 1723',
      serialNumber: 'VEH-001',
      status: 'en_uso',
      locationSite: 'Sitio Norte',
      purchaseDate: '2023-08-01',
      purchaseCost: '34500000',
      qrCode: 'SOLDESP-DEMO-002',
    },
  ])
  console.log('Created equipment')

  await db.insert(inventoryItems).values([
    {
      orgId: org.id,
      name: 'Electrodo 7018 1/8"',
      category: 'electrodos',
      quantity: 25,
      minStock: 10,
      unit: 'kg',
      locationWarehouse: 'Bodega 1',
      supplier: 'Indura',
      lastRestock: '2025-12-01',
      costPerUnit: '8500',
    },
    {
      orgId: org.id,
      name: 'Disco corte 7" inox',
      category: 'discos',
      quantity: 4,
      minStock: 12,
      unit: 'unidad',
      locationWarehouse: 'Bodega 1',
      supplier: '3M',
      lastRestock: '2025-11-15',
      costPerUnit: '3200',
    },
  ])
  console.log('Created inventory')

  console.log('Seed done.')
}

main().catch((e) => { console.error(e); process.exit(1) })
