import { MapPin } from 'lucide-react'

export function MapPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-xl bg-[var(--accent)]/10 p-4 mb-4">
        <MapPin size={32} className="text-[var(--accent)]" />
      </div>
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">Mapa de Sitios</h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">Modulo de mapa en desarrollo</p>
    </div>
  )
}
