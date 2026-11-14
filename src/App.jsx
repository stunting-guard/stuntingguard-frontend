import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'

// Layout per role
import KaderLayout from './layouts/KaderLayout'
import AparaturLayout from './layouts/AparaturLayout'
import AdminLayout from './layouts/AdminLayout'

// Halaman Kader
import DashboardAnalitik from './pages/kader/DashboardAnalitik'
import InputDataKeluarga from './pages/kader/InputDataKeluarga'
import HasilKlasifikasi from './pages/kader/HasilKlasifikasi'
import RiwayatPrediksi from './pages/kader/RiwayatPrediksi'

// Halaman Aparatur
import DashboardAparatur from './pages/aparatur/DashboardAparatur'
import DataKeluarga from './pages/aparatur/DataKeluarga'
import PetaWilayah from './pages/aparatur/PetaWilayah'
import HasilPrediksi from './pages/aparatur/HasilPrediksi'
import Laporan from './pages/aparatur/Laporan'

// Halaman Admin
import DashboardAdmin from './pages/admin/DashboardAdmin'
import KelolaDataset from './pages/admin/KelolaDataset'
import EvaluasiModel from './pages/admin/EvaluasiModel'
import KelolaPengguna from './pages/admin/KelolaPengguna'

/**
 * Struktur routing utama dipisah per role agar setiap modul memakai layout-nya
 * sendiri. Sub-route baru cukup ditambahkan di dalam grup role terkait.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ==================== /kader/* — KaderLayout ==================== */}
        <Route path="/kader" element={<KaderLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardAnalitik />} />
          <Route path="input-data" element={<InputDataKeluarga />} />
          <Route path="hasil" element={<HasilKlasifikasi />} />
          <Route path="riwayat" element={<RiwayatPrediksi />} />
          {/* Tambahkan sub-route kader baru di sini (otomatis memakai KaderLayout). */}
        </Route>

        {/* ==================== /aparatur/* — AparaturLayout ==================== */}
        <Route path="/aparatur" element={<AparaturLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardAparatur />} />
          <Route path="data-keluarga" element={<DataKeluarga />} />
          <Route path="peta-wilayah" element={<PetaWilayah />} />
          <Route path="hasil-prediksi" element={<HasilPrediksi />} />
          <Route path="laporan" element={<Laporan />} />
          {/* Tambahkan sub-route aparatur baru di sini (otomatis memakai AparaturLayout). */}
        </Route>

        {/* ==================== /admin/* — AdminLayout ==================== */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardAdmin />} />
          <Route path="kelola-dataset" element={<KelolaDataset />} />
          <Route path="evaluasi" element={<EvaluasiModel />} />
          <Route path="kelola-pengguna" element={<KelolaPengguna />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
