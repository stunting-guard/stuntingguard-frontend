import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'

// Layout
import KaderLayout from './layouts/KaderLayout'

// Pages Kader
import DashboardAnalitik from './pages/kader/DashboardAnalitik'
import InputDataKeluarga from './pages/kader/InputDataKeluarga'
import HasilKlasifikasi from './pages/kader/HasilKlasifikasi'
import RiwayatPrediksi from './pages/kader/RiwayatPrediksi'

// Placeholder Pages Aparatur & Admin
import DashboardAparatur from './pages/aparatur/DashboardAparatur'
import DashboardAdmin from './pages/admin/DashboardAdmin'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root ke /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Nested Routing untuk Role Kader */}
        <Route path="/kader" element={<KaderLayout />}>
          {/* Saat akses /kader, otomatis redirect ke /kader/dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          
          <Route path="dashboard" element={<DashboardAnalitik />} />
          <Route path="input-data" element={<InputDataKeluarga />} />
          <Route path="hasil" element={<HasilKlasifikasi />} />
          <Route path="riwayat" element={<RiwayatPrediksi />} />
        </Route>

        {/* Placeholder Routing Aparatur & Admin */}
        <Route path="/aparatur/*" element={<DashboardAparatur />} />
        <Route path="/admin/*" element={<DashboardAdmin />} />
      </Routes>
    </BrowserRouter>
  )
}