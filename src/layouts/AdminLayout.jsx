import { useState } from "react";
import { LayoutGrid, LineChart, Table2, UsersRound } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import { getUser } from "../services/api";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard Admin", short: "Dashboard", icon: LayoutGrid },
  { to: "/admin/kelola-dataset", label: "Kelola Dataset", short: "Dataset", icon: Table2 },
  { to: "/admin/evaluasi", label: "Evaluasi & Model ML", short: "Evaluasi", icon: LineChart },
  { to: "/admin/kelola-pengguna", label: "Kelola Pengguna", short: "Pengguna", icon: UsersRound },
];

export default function AdminLayout() {
  const sessionUser = getUser();
  const [user] = useState({
    name: sessionUser?.name || "Admin StuntingGuard",
    role: sessionUser?.role === "ADMIN" ? "Pengelola Data" : sessionUser?.role || "Pengelola Data",
  });

  return (
    <DashboardLayout
      navItems={NAV_ITEMS}
      user={user}
      maxWidth="max-w-7xl"
      variant="admin"
    />
  );
}
