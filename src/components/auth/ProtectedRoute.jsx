import { Navigate, Outlet } from "react-router-dom";
import { getToken, getUser } from "../../services/api";

const ROLE_REDIRECT = {
  KADER: "/kader/dashboard",
  APARATUR: "/aparatur/dashboard",
  ADMIN: "/admin/dashboard",
};

/**
 * Komponen Penjaga Rute (Route Guard)
 * Memvalidasi token JWT dan role pengguna sebelum mengakses layout modul
 */
export default function ProtectedRoute({ allowedRoles = [] }) {
  const token = getToken();
  const user = getUser();

  // Jika belum login / tidak ada token, arahkan ke login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jika rute mensyaratkan role tertentu, periksa kesesuaian role
  if (allowedRoles.length > 0) {
    const userRole = user?.role ? String(user.role).toUpperCase() : "";

    const isAllowed = allowedRoles.some(
      (r) => String(r).toUpperCase() === userRole
    );

    // Jika role pengguna tidak diizinkan, arahkan ke dashboard sesuai role
    if (!isAllowed) {
      const target = ROLE_REDIRECT[userRole] || "/login";
      return <Navigate to={target} replace />;
    }
  }

  return <Outlet />;
}
