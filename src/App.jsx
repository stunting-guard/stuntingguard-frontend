import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Layout per role
import KaderLayout from "./layouts/KaderLayout";
import AparaturLayout from "./layouts/AparaturLayout";
import AdminLayout from "./layouts/AdminLayout";

// Halaman Kader
import DashboardAnalitik from "./pages/kader/DashboardAnalitik";
import InputDataKeluarga from "./pages/kader/InputDataKeluarga";
import HasilKlasifikasi from "./pages/kader/HasilKlasifikasi";
import RiwayatPrediksi from "./pages/kader/RiwayatPrediksi";

// Halaman Aparatur
import DashboardAparatur from "./pages/aparatur/DashboardAparatur";
import DataKeluarga from "./pages/aparatur/DataKeluarga";
import PetaWilayah from "./pages/aparatur/PetaWilayah";
import HasilPrediksi from "./pages/aparatur/HasilPrediksi";
import Laporan from "./pages/aparatur/Laporan";

// Halaman Admin
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import KelolaDataset from "./pages/admin/KelolaDataset";
import EvaluasiModel from "./pages/admin/EvaluasiModel";
import KelolaPengguna from "./pages/admin/KelolaPengguna";

/**
 * Struktur routing utama dipisah per role dengan ProtectedRoute
 * Memastikan keamanan akses antarmuka berdasarkan token dan izin role
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ==================== /kader/* — KaderLayout ==================== */}
        <Route element={<ProtectedRoute allowedRoles={["KADER", "ADMIN"]} />}>
          <Route path="/kader" element={<KaderLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardAnalitik />} />
            <Route path="input-data" element={<InputDataKeluarga />} />
            <Route path="hasil" element={<HasilKlasifikasi />} />
            <Route path="hasil/:id" element={<HasilKlasifikasi />} />
            <Route path="hasil-klasifikasi" element={<HasilKlasifikasi />} />
            <Route path="hasil-klasifikasi/:id" element={<HasilKlasifikasi />} />
            <Route path="riwayat" element={<RiwayatPrediksi />} />
          </Route>
        </Route>

        {/* ==================== /aparatur/* — AparaturLayout ==================== */}
        <Route element={<ProtectedRoute allowedRoles={["APARATUR", "ADMIN"]} />}>
          <Route path="/aparatur" element={<AparaturLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardAparatur />} />
            <Route path="data-keluarga" element={<DataKeluarga />} />
            <Route path="peta-wilayah" element={<PetaWilayah />} />
            <Route path="hasil-prediksi" element={<HasilPrediksi />} />
            <Route path="laporan" element={<Laporan />} />
          </Route>
        </Route>

        {/* ==================== /admin/* — AdminLayout ==================== */}
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardAdmin />} />
            <Route path="kelola-dataset" element={<KelolaDataset />} />
            <Route path="evaluasi" element={<EvaluasiModel />} />
            <Route path="kelola-pengguna" element={<KelolaPengguna />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
