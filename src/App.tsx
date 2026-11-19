import { lazy, Suspense } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Site from './site/Site'
import Legal from './site/Legal'
import { ScrollToTop } from './site/hooks'

const CrmApp = lazy(() => import('./crm/CrmApp'))

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Site page="start" />} />
        <Route path="/arbeiten" element={<Site page="arbeiten" />} />
        <Route path="/ablauf" element={<Site page="ablauf" />} />
        <Route path="/kontakt" element={<Site page="kontakt" />} />
        <Route path="/impressum" element={<Legal page="impressum" />} />
        <Route path="/datenschutz" element={<Legal page="datenschutz" />} />
        <Route
          path="/app/*"
          element={
            <Suspense fallback={<div className="grid min-h-dvh place-items-center text-sm text-stone-500">Lädt …</div>}>
              <CrmApp />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
