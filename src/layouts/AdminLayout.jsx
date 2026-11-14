import { useState } from "react";
import { LayoutGrid, LineChart, Table2, UsersRound } from "lucide-react";
import DashboardLayout from "./DashboardLayout";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard Admin", short: "Dashboard", icon: LayoutGrid },
  { to: "/admin/kelola-dataset", label: "Kelola Dataset", short: "Dataset", icon: Table2 },
  { to: "/admin/evaluasi", label: "Evaluasi & Model ML", short: "Evaluasi", icon: LineChart },
  { to: "/admin/kelola-pengguna", label: "Kelola Pengguna", short: "Pengguna", icon: UsersRound },
];

export default function AdminLayout() {
  // MOCK — ganti dengan data user dari auth context / API
  const [user] = useState({ name: "Mamil Ganteng", role: "Pengelola Data" });

  return (
    <DashboardLayout
      navItems={NAV_ITEMS}
      user={user}
      maxWidth="max-w-7xl"
      variant="admin"
    />
  );
}
