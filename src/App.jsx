import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import DashboardKader from './pages/kader/DashboardKader'
import DashboardAparatur from './pages/aparatur/DashboardAparatur'
import DashboardAdmin from './pages/admin/DashboardAdmin'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/kader/*" element={<DashboardKader />} />
        <Route path="/aparatur/*" element={<DashboardAparatur />} />
        <Route path="/admin/*" element={<DashboardAdmin />} />
      </Routes>
    </BrowserRouter>
  )
}
