import { useState } from "react";
import { FileText, LayoutDashboard, MapPin, TrendingUp, Users } from "lucide-react";
import DashboardLayout from "./DashboardLayout";

const NAV_ITEMS = [
  { to: "/aparatur/dashboard", label: "Dashboard", short: "Dashboard", icon: LayoutDashboard },
  { to: "/aparatur/data-keluarga", label: "Data Keluarga", short: "Keluarga", icon: Users },
  { to: "/aparatur/peta-wilayah", label: "Peta Wilayah", short: "Peta", icon: MapPin },
  { to: "/aparatur/hasil-prediksi", label: "Hasil Prediksi", short: "Prediksi", icon: TrendingUp },
  { to: "/aparatur/laporan", label: "Laporan", short: "Laporan", icon: FileText },
];

export default function AparaturLayout() {
  // MOCK — ganti dengan data user dari auth context / API
  const [user] = useState({ name: "Varghi Ganteng", role: "Aparatur Desa" });

  return <DashboardLayout navItems={NAV_ITEMS} user={user} maxWidth="max-w-6xl" />;
}
