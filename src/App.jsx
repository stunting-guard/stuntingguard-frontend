import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'

// Layout
import KaderLayout from './layouts/KaderLayout'

// Pages Kader
import InputDataKeluarga from './pages/kader/InputDataKeluarga'
import HasilKlasifikasi from './pages/kader/HasilKlasifikasi'

// Placeholder Pages Aparatur & Admin
import DashboardAparatur from './pages/aparatur/DashboardAparatur'
import DashboardAdmin from './pages/admin/DashboardAdmin'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Nested Routing untuk Role Kader */}
        <Route path="/kader" element={<KaderLayout />}>
          <Route index element={<Navigate to="input-data" replace />} />
          {/* Mengarahkan redirect login /kader/dashboard langsung ke form input data */}
          <Route path="dashboard" element={<Navigate to="/kader/input-data" replace />} />
          <Route path="input-data" element={<InputDataKeluarga />} />
          <Route path="hasil" element={<HasilKlasifikasi />} />
          <Route path="riwayat" element={<div className="p-8 font-semibold text-[#0F2942]">Halaman Riwayat (WIP)</div>} />
        </Route>

        <Route path="/aparatur/*" element={<DashboardAparatur />} />
        <Route path="/admin/*" element={<DashboardAdmin />} />
      </Routes>
    </BrowserRouter>
  )
}