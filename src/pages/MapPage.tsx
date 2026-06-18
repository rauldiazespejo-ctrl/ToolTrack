import { MapPin, Building2, Wrench } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/shared/StatCard'
import { sites } from '../data/seed'

export function MapPage() {
  const totalEquipment = sites.reduce((sum, site) => sum + site.equipmentCount, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={<Building2 size={20} />} label="Sitios" value={sites.length} />
        <StatCard icon={<Wrench size={20} />} label="Activos ubicados" value={totalEquipment} />
        <StatCard icon={<MapPin size={20} />} label="Cobertura" value="Operativa" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Mapa Operativo de Sitios</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Vista de distribución real por bodega, planta y faena.
        </p>
      </div>

      <Card title="Sitios Activos" padding={false}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sites.map(site => (
            <div key={site.name} className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{site.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">Lat {site.lat} · Lng {site.lng}</p>
                </div>
                <div className="rounded-full bg-[var(--accent)]/10 px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
                  {site.equipmentCount} activos
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/5">
                <div
                  className="h-2 rounded-full bg-[var(--accent)]"
                  style={{ width: `${Math.min(100, (site.equipmentCount / Math.max(totalEquipment, 1)) * 100 * 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
