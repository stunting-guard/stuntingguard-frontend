import { useState } from "react";
import { FileText, LayoutDashboard, MapPin, TrendingUp, Users } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import { getUser } from "../services/api";

const NAV_ITEMS = [
  { to: "/aparatur/dashboard", label: "Dashboard", short: "Dashboard", icon: LayoutDashboard },
  { to: "/aparatur/data-keluarga", label: "Data Keluarga", short: "Keluarga", icon: Users },
  { to: "/aparatur/peta-wilayah", label: "Peta Wilayah", short: "Peta", icon: MapPin },
  { to: "/aparatur/hasil-prediksi", label: "Hasil Prediksi", short: "Prediksi", icon: TrendingUp },
  { to: "/aparatur/laporan", label: "Laporan", short: "Laporan", icon: FileText },
];

export default function AparaturLayout() {
  const sessionUser = getUser();
  const [user] = useState({
    name: sessionUser?.name || "Varghi Ganteng",
    role: sessionUser?.role === "APARATUR" ? "Aparatur Desa" : sessionUser?.role || "Aparatur Desa",
  });

  return <DashboardLayout navItems={NAV_ITEMS} user={user} maxWidth="max-w-6xl" />;
} 
