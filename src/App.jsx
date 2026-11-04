import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'

// Layouts
import KaderLayout from './layouts/KaderLayout'
import AparaturLayout from './layouts/AparaturLayout'

// Pages Kader
import DashboardAnalitik from './pages/kader/DashboardAnalitik'
import InputDataKeluarga from './pages/kader/InputDataKeluarga'
import HasilKlasifikasi from './pages/kader/HasilKlasifikasi'
import RiwayatPrediksi from './pages/kader/RiwayatPrediksi'

// Pages Aparatur
import DashboardAparatur from './pages/aparatur/DashboardAparatur'
import DataKeluarga from './pages/aparatur/DataKeluarga'
import PetaWilayah from './pages/aparatur/PetaWilayah'
import HasilPrediksi from './pages/aparatur/HasilPrediksi'
import Laporan from './pages/aparatur/Laporan'

// Pages Admin
import DashboardAdmin from './pages/admin/DashboardAdmin'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Routing Role Kader */}
        <Route path="/kader" element={<KaderLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardAnalitik />} />
          <Route path="input-data" element={<InputDataKeluarga />} />
          <Route path="hasil" element={<HasilKlasifikasi />} />
          <Route path="riwayat" element={<RiwayatPrediksi />} />
        </Route>

        {/* Routing Role Aparatur (Lengkap 5 Halaman) */}
        <Route path="/aparatur" element={<AparaturLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardAparatur />} />
          <Route path="data-keluarga" element={<DataKeluarga />} />
          <Route path="peta-wilayah" element={<PetaWilayah />} />
          <Route path="hasil-prediksi" element={<HasilPrediksi />} />
          <Route path="laporan" element={<Laporan />} />
        </Route>

        {/* Routing Role Admin */}
        <Route path="/admin/*" element={<DashboardAdmin />} />
      </Routes>
    </BrowserRouter>
  )
}