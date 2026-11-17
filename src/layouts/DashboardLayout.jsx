import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import BrandLogo from "../components/common/BrandLogo";
import bgAnak from "../assets/images/login-bg-anak.jpg";
import { api } from "../services/api";

/**
 * Kerangka dashboard yang dipakai semua role (Kader, Aparatur, Admin).
 *
 * Props:
 * - navItems: [{ to, label, short, icon }]
 * - user: { name, role }
 * - maxWidth: class Tailwind lebar konten (default "max-w-5xl")
 * - variant: "default" | "admin" (tampilan khusus sesuai referensi UI Admin)
 */
export default function DashboardLayout({
  navItems,
  user,
  maxWidth = "max-w-5xl",
  logoutTo = "/login",
  variant = "default",
}) {
  const navigate = useNavigate();
  const isAdmin = variant === "admin";

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn("Logout warning:", err);
    } finally {
      navigate(logoutTo);
    }
  };

  return (
    <div className={`relative min-h-screen overflow-hidden ${isAdmin ? "bg-[#F3F1F8]" : "bg-slate-50"}`}>
      {/* Latar belakang: foto anak-anak samar di kanan */}
      <img
        src={bgAnak}
        alt=""
        aria-hidden="true"
        className={`pointer-events-none fixed inset-y-0 right-0 h-full w-full object-cover object-left [mask-image:linear-gradient(to_left,black_45%,transparent)] md:w-1/2 ${
          isAdmin ? "opacity-20 md:opacity-70" : "opacity-25 md:opacity-90"
        }`}
      />
      {/* Blob dekoratif kanan bawah */}
      <div aria-hidden="true" className="pointer-events-none fixed bottom-0 right-0 hidden md:block">
        <div className="absolute -bottom-10 -right-6 h-36 w-36 rounded-full bg-[#1B8A5A]" />
        <div className="absolute -bottom-14 right-8 h-32 w-32 rotate-12 rounded-[2.5rem] bg-[#0F2942]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* ---------- Sidebar (desktop) ---------- */}
        <aside
          className={`sticky top-0 hidden h-screen shrink-0 flex-col bg-white md:flex ${
            isAdmin ? "w-64 px-5 py-8" : "w-60 px-4 py-6 shadow-sm"
          }`}
        >
          {isAdmin ? (
            <p className="px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Navigasi Admin
            </p>
          ) : (
            <p className="rounded-full bg-slate-100 px-4 py-2 text-center text-xs font-semibold text-[#0F2942]">
              {user.role}
            </p>
          )}
          <nav
            aria-label={`Navigasi utama ${user.role}`}
            className={`${isAdmin ? "mt-5" : "mt-6"} space-y-1`}
          >
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 transition focus-visible:outline-2 ${
                    isAdmin
                      ? "rounded-lg px-4 py-3 text-sm font-semibold focus-visible:outline-teal-700"
                      : "rounded-xl px-4 py-2.5 text-sm font-medium focus-visible:outline-[#1B8A5A]"
                  } ${
                    isActive
                      ? isAdmin
                        ? "bg-teal-800 text-white shadow-sm"
                        : "bg-[#0F2942] text-white shadow"
                      : isAdmin
                        ? "text-[#0F2942] hover:bg-slate-100"
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#0F2942]"
                  }`
                }
              >
                <Icon
                  className={`shrink-0 ${isAdmin ? "h-[18px] w-[18px]" : "h-4 w-4"}`}
                  aria-hidden="true"
                />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* ---------- Konten ---------- */}
        <div className="flex min-w-0 flex-1 flex-col px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-6">
          <header
            className={`mx-auto flex w-full items-center justify-between rounded-2xl bg-white px-4 shadow-md md:px-7 ${
              isAdmin ? "py-3.5 md:py-4" : "py-3"
            } ${maxWidth}`}
          >
            <BrandLogo />
            <div className="flex items-center gap-3 md:gap-5">
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-white ${
                    isAdmin ? "bg-teal-800" : "bg-[#0F2942]"
                  }`}
                >
                  <User className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="hidden text-xs leading-tight sm:block">
                  <p className="font-bold text-[#0F2942]">{user.name}</p>
                  <p className={isAdmin ? "text-slate-500" : "text-[#1B8A5A]"}>{user.role}</p>
                </div>
              </div>
              <span className="hidden h-7 w-px bg-slate-200 sm:block" aria-hidden="true" />
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-500"
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
      {!isAdmin && (
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
      )}

      {/* ---------- Bottom nav (mobile) ---------- */}
      <nav
        aria-label={`Navigasi bawah ${user.role}`}
        style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
        className="fixed inset-x-0 bottom-0 z-30 grid border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {navItems.map(({ to, short, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium focus-visible:outline-2 focus-visible:-outline-offset-2 ${
                isAdmin
                  ? "focus-visible:outline-teal-700"
                  : "focus-visible:outline-[#1B8A5A]"
              } ${
                isActive ? (isAdmin ? "text-teal-700" : "text-[#1B8A5A]") : "text-slate-500"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-7 w-12 items-center justify-center rounded-full transition ${
                    isActive ? (isAdmin ? "bg-teal-800 text-white" : "bg-[#0F2942] text-white") : ""
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
