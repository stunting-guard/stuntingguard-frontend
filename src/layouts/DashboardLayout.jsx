import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import BrandLogo from "../components/common/BrandLogo";
import bgAnak from "../assets/images/login-bg-anak.jpg";

/**
 * Kerangka dashboard yang dipakai semua role (Kader, Aparatur, Admin).
 *
 * Props:
 * - navItems: [{ to, label, short, icon }]
 * - user: { name, role }
 * - maxWidth: class Tailwind lebar konten (default "max-w-5xl")
 */
export default function DashboardLayout({
  navItems,
  user,
  maxWidth = "max-w-5xl",
  logoutTo = "/login",
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: hapus token / panggil endpoint logout
    navigate(logoutTo);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Latar belakang: foto anak-anak samar di kanan */}
      <img
        src={bgAnak}
        alt=""
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 right-0 h-full w-full object-cover object-left opacity-25 md:w-1/2 md:opacity-90 [mask-image:linear-gradient(to_left,black_45%,transparent)]"
      />
      {/* Blob dekoratif kanan bawah */}
      <div aria-hidden="true" className="pointer-events-none fixed bottom-0 right-0 hidden md:block">
        <div className="absolute -bottom-10 -right-6 h-36 w-36 rounded-full bg-[#1B8A5A]" />
        <div className="absolute -bottom-14 right-8 h-32 w-32 rotate-12 rounded-[2.5rem] bg-[#0F2942]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* ---------- Sidebar (desktop) ---------- */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-white px-4 py-6 shadow-sm md:flex">
          <p className="rounded-full bg-slate-100 px-4 py-2 text-center text-xs font-semibold text-[#0F2942]">
            {user.role}
          </p>
          <nav aria-label={`Menu ${user.role}`} className="mt-6 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-[#1B8A5A] ${
                    isActive
                      ? "bg-[#0F2942] text-white shadow"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#0F2942]"
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* ---------- Konten ---------- */}
        <div className="flex min-w-0 flex-1 flex-col px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-6">
          <header
            className={`mx-auto flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-md md:px-6 ${maxWidth}`}
          >
            <BrandLogo />
            <div className="flex items-center gap-3 md:gap-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F2942] text-white">
                  <User className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="hidden text-xs leading-tight sm:block">
                  <p className="font-semibold text-[#0F2942]">{user.name}</p>
                  <p className="text-[#1B8A5A]">{user.role}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-500"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </header>

          <main className={`mx-auto w-full flex-1 py-6 ${maxWidth}`}>
            <Outlet />
          </main>
        </div>
      </div>

      {/* Badge mitra (desktop) */}
      <div className="fixed bottom-4 right-4 z-20 hidden items-center gap-3 rounded-full bg-white/90 px-3 py-1.5 shadow-md backdrop-blur md:flex">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F2942] text-[7px] font-bold text-white">
          JABAR
        </span>
        <span className="text-[8px] font-semibold uppercase leading-tight text-[#0F2942]">
          Kementerian
          <br />
          Kesehatan RI
        </span>
      </div>

      {/* ---------- Bottom nav (mobile) ---------- */}
      <nav
        aria-label={`Menu ${user.role}`}
        style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
        className="fixed inset-x-0 bottom-0 z-30 grid border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {navItems.map(({ to, short, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                isActive ? "text-[#1B8A5A]" : "text-slate-500"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-7 w-12 items-center justify-center rounded-full transition ${
                    isActive ? "bg-[#0F2942] text-white" : ""
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {short ?? label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
