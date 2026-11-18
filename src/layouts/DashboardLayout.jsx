import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import BrandLogo from "../components/common/BrandLogo";
import bgAnak from "../assets/images/login-bg-anak.jpg";
import { api } from "../services/api";

/**
 * Helper untuk menentukan apakah item navigasi aktif,
 * termasuk pencocokan rute berparameter dinamis seperti /kader/hasil-klasifikasi/:id
 * dan /aparatur/hasil-prediksi/:id.
 */
function checkIsActive(pathname, item) {
  if (!pathname || !item?.to) return false;

  // 1. Jika ada matchPrefixes kustom
  if (Array.isArray(item.matchPrefixes)) {
    return item.matchPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
  }

  // 2. Khusus modul hasil klasifikasi kader
  if (item.to === "/kader/hasil" || item.to.startsWith("/kader/hasil")) {
    return (
      pathname === "/kader/hasil" ||
      pathname.startsWith("/kader/hasil/") ||
      pathname === "/kader/hasil-klasifikasi" ||
      pathname.startsWith("/kader/hasil-klasifikasi/")
    );
  }

  // 3. Khusus modul hasil prediksi aparatur
  if (item.to === "/aparatur/hasil-prediksi") {
    return (
      pathname === "/aparatur/hasil-prediksi" ||
      pathname.startsWith("/aparatur/hasil-prediksi/")
    );
  }

  // 4. Khusus dashboard per role (mencocokkan rute persis dan root role)
  if (item.to.endsWith("/dashboard")) {
    const roleRoot = item.to.replace(/\/dashboard$/, "");
    return (
      pathname === item.to ||
      pathname.startsWith(`${item.to}/`) ||
      pathname === roleRoot ||
      pathname === `${roleRoot}/`
    );
  }

  // 5. Default pencocokan rute persis atau sub-path
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

/**
 * Kerangka dashboard utama yang dipakai semua role (Kader, Aparatur, Admin).
 *
 * Props:
 * - navItems: [{ to, label, short, icon, matchPrefixes }]
 * - user: { name, role }
 * - maxWidth: class Tailwind lebar konten (default "max-w-5xl")
 * - logoutTo: rute redirect setelah logout (default "/login")
 * - variant: "default" | "admin" (tampilan khusus tema Admin)
 */
export default function DashboardLayout({
  navItems,
  user,
  maxWidth = "max-w-5xl",
  logoutTo = "/login",
  variant = "default",
}) {
  const navigate = useNavigate();
  const location = useLocation();
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
    <div
      className={`relative min-h-screen overflow-x-clip ${
        isAdmin ? "bg-[#F3F1F8]" : "bg-slate-50"
      }`}
    >
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
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-0 right-0 hidden md:block"
      >
        <div className="absolute -bottom-10 -right-6 h-36 w-36 rounded-full bg-[#1B8A5A]" />
        <div className="absolute -bottom-14 right-8 h-32 w-32 rotate-12 rounded-[2.5rem] bg-[#0F2942]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* ---------- Sidebar (desktop: terkunci sticky, solid bg-white, divider tegas) ---------- */}
        <aside
          className={`sticky top-0 z-30 hidden h-screen shrink-0 flex-col border-r border-slate-200/90 bg-white md:flex ${
            isAdmin ? "w-64" : "w-64"
          }`}
        >
          <div className="flex h-full flex-col px-4 py-6">
            {/* Header info role */}
            <div className="shrink-0 pb-1">
              {isAdmin ? (
                <div className="flex items-center gap-2 rounded-xl bg-slate-100/80 px-3.5 py-2.5">
                  <span
                    className="h-2 w-2 rounded-full bg-teal-600"
                    aria-hidden="true"
                  />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Navigasi Admin
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-100/80 px-3.5 py-2">
                  <span
                    className="h-2 w-2 rounded-full bg-[#1B8A5A]"
                    aria-hidden="true"
                  />
                  <p className="text-xs font-bold text-[#0F2942]">
                    {user.role}
                  </p>
                </div>
              )}
            </div>

            {/* Navigasi Utama - independent scroll bila layar vertikal pendek */}
            <nav
              aria-label={`Navigasi utama ${user.role}`}
              className="mt-4 flex-1 space-y-1.5 overflow-y-auto pr-1 focus:outline-none"
            >
              {navItems.map((item) => {
                const { to, label, icon: Icon } = item;
                const active = checkIsActive(location.pathname, item);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-150 focus-visible:outline-2 ${
                      active
                        ? isAdmin
                          ? "bg-teal-900 text-white font-semibold shadow-sm focus-visible:outline-teal-700"
                          : "bg-[#0F2942] text-white font-semibold shadow-sm focus-visible:outline-[#1B8A5A]"
                        : isAdmin
                        ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium focus-visible:outline-teal-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium focus-visible:outline-[#1B8A5A]"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors duration-150 ${
                        active
                          ? "text-white"
                          : "text-slate-400 group-hover:text-slate-700"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Sesi info ringkas di bagian bawah sidebar */}
            <div className="shrink-0 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-2.5">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm ${
                    isAdmin ? "bg-teal-800" : "bg-[#0F2942]"
                  }`}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </span>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-xs font-bold text-[#0F2942]">
                    {user.name}
                  </p>
                  <p className="truncate text-[10px] text-slate-500">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ---------- Area Konten Utama ---------- */}
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
                  <p className={isAdmin ? "text-slate-500" : "text-[#1B8A5A]"}>
                    {user.role}
                  </p>
                </div>
              </div>
              <span
                className="hidden h-7 w-px bg-slate-200 sm:block"
                aria-hidden="true"
              />
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

      {/* Badge mitra resmi (desktop) */}
      {!isAdmin && (
        <div className="fixed bottom-4 right-4 z-20 hidden items-center gap-3 rounded-full bg-white/95 px-3 py-1.5 shadow-md backdrop-blur md:flex border border-slate-100">
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
        style={{
          gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))`,
        }}
        className="fixed inset-x-0 bottom-0 z-40 grid border-t border-slate-200/90 bg-white pb-[env(safe-area-inset-bottom)] shadow-lg md:hidden"
      >
        {navItems.map((item) => {
          const { to, short, label, icon: Icon } = item;
          const active = checkIsActive(location.pathname, item);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 py-2 text-[10px] font-semibold transition-all duration-150 focus-visible:outline-2 ${
                isAdmin
                  ? "focus-visible:outline-teal-700"
                  : "focus-visible:outline-[#1B8A5A]"
              } ${
                active
                  ? isAdmin
                    ? "text-teal-900"
                    : "text-[#0F2942]"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span
                className={`flex h-7 w-12 items-center justify-center rounded-full transition-all duration-150 ${
                  active
                    ? isAdmin
                      ? "bg-teal-900 text-white shadow-sm"
                      : "bg-[#0F2942] text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    active ? "text-white" : "text-slate-500"
                  }`}
                  aria-hidden="true"
                />
              </span>
              <span className="truncate max-w-[68px] text-center">
                {short ?? label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
