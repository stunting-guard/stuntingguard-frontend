import { useState } from "react";
import { BarChart3, ClipboardCheck, History, UserPlus } from "lucide-react";
import DashboardLayout from "./DashboardLayout";

const NAV_ITEMS = [
  { to: "/kader/dashboard", label: "Dashboard Analitik", short: "Dashboard", icon: BarChart3 },
  { to: "/kader/input-data", label: "Input Data Keluarga", short: "Input", icon: UserPlus },
  { to: "/kader/hasil", label: "Hasil Klasifikasi", short: "Hasil", icon: ClipboardCheck },
  { to: "/kader/riwayat", label: "Riwayat Prediksi", short: "Riwayat", icon: History },
];

export default function KaderLayout() {
  // MOCK — ganti dengan data user dari auth context / API
  const [user] = useState({ name: "Bidan Sri Wahyuni", role: "Kader Posyandu" });

  return <DashboardLayout navItems={NAV_ITEMS} user={user} />;
}
