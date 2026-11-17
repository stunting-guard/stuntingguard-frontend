import { useState } from "react";
import { BarChart3, ClipboardCheck, History, UserPlus } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import { getUser } from "../services/api";

const NAV_ITEMS = [
  { to: "/kader/dashboard", label: "Dashboard Analitik", short: "Dashboard", icon: BarChart3 },
  { to: "/kader/input-data", label: "Input Data Keluarga", short: "Input", icon: UserPlus },
  { to: "/kader/hasil", label: "Hasil Klasifikasi", short: "Hasil", icon: ClipboardCheck },
  { to: "/kader/riwayat", label: "Riwayat Prediksi", short: "Riwayat", icon: History },
];

export default function KaderLayout() {
  const sessionUser = getUser();
  const [user] = useState({
    name: sessionUser?.name || "Bidan Sri Wahyuni",
    role: sessionUser?.role === "KADER" ? "Kader Posyandu" : sessionUser?.role || "Kader Posyandu",
  });

  return <DashboardLayout navItems={NAV_ITEMS} user={user} />;
}
