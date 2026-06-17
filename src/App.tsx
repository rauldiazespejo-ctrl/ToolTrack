import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Layout } from './components/Layout'

const Dashboard = lazy(() =>
  import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })),
)
const Inventory = lazy(() =>
  import('./pages/Inventory').then((module) => ({ default: module.Inventory })),
)
const ToolDetail = lazy(() =>
  import('./pages/ToolDetail').then((module) => ({ default: module.ToolDetail })),
)
const AssetMap = lazy(() =>
  import('./pages/AssetMap').then((module) => ({ default: module.AssetMap })),
)
const Reports = lazy(() =>
  import('./pages/Reports').then((module) => ({ default: module.Reports })),
)
const QRLabels = lazy(() =>
  import('./pages/QRLabels').then((module) => ({ default: module.QRLabels })),
)
const ScanAsset = lazy(() =>
  import('./pages/ScanAsset').then((module) => ({ default: module.ScanAsset })),
)
const ScanEvents = lazy(() =>
  import('./pages/ScanEvents').then((module) => ({ default: module.ScanEvents })),
)
const Login = lazy(() =>
  import('./pages/Login').then((module) => ({ default: module.Login })),
)
const Requests = lazy(() =>
  import('./pages/Requests').then((module) => ({ default: module.Requests })),
)
const WarehouseOps = lazy(() =>
  import('./pages/WarehouseOps').then((module) => ({
    default: module.WarehouseOps,
  })),
)
const Compliance = lazy(() =>
  import('./pages/Compliance').then((module) => ({ default: module.Compliance })),
)

function RouteFallback() {
  return <div className="route-fallback">Loading workspace...</div>
}

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: withSuspense(<Dashboard />) },
      { path: 'tools', element: withSuspense(<Inventory />) },
      { path: 'tools/:toolId', element: withSuspense(<ToolDetail />) },
      { path: 'map', element: withSuspense(<AssetMap />) },
      { path: 'qr', element: withSuspense(<QRLabels />) },
      { path: 'scan/:toolId', element: withSuspense(<ScanAsset />) },
      { path: 'events', element: withSuspense(<ScanEvents />) },
      { path: 'requests', element: withSuspense(<Requests />) },
      { path: 'warehouse', element: withSuspense(<WarehouseOps />) },
      { path: 'compliance', element: withSuspense(<Compliance />) },
      { path: 'login', element: withSuspense(<Login />) },
      { path: 'reports', element: withSuspense(<Reports />) },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
