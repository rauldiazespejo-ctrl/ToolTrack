import { Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { EquipmentPage } from './pages/EquipmentPage'
import { EquipmentDetailPage } from './pages/EquipmentDetailPage'
import { InventoryPage } from './pages/InventoryPage'
import { MaintenancePage } from './pages/MaintenancePage'
import { AlertsPage } from './pages/AlertsPage'
import { MapPage } from './pages/MapPage'
import { SettingsPage } from './pages/SettingsPage'
import { LoginPage } from './pages/LoginPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="equipment" element={<EquipmentPage />} />
        <Route path="equipment/:id" element={<EquipmentDetailPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
