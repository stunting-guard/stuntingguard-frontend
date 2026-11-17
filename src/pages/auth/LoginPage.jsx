import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  HeartHandshake,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import posyanduPhoto from "../../assets/images/login-posyandu.jpg";
import bgAnak from "../../assets/images/login-bg-anak.jpg";
import { api, getToken, getUser } from "../../services/api";

/* ------------------------------------------------------------------ */
/* MOCK DATA — ganti dengan response API saat backend sudah siap        */
/* ------------------------------------------------------------------ */
const SAVED_ACCOUNTS = [
  {
    id: 1,
    role: "kader",
    email: "posyandu@posyandu.go.id",
    password: "password123",
    redirectTo: "/kader/dashboard",
  },
  {
    id: 2,
    role: "aparatur",
    email: "aparatur.desa@desa.go.id",
    password: "password123",
    redirectTo: "/aparatur/dashboard",
  },
  {
    id: 3,
    role: "admin",
    email: "admin@admin.go.id",
    password: "password123",
    redirectTo: "/admin/dashboard",
  },
];

/* ------------------------------------------------------------------ */
/* Sub-komponen                                                         */
/* ------------------------------------------------------------------ */
function Logo() {
  return (
    <div className="flex items-center gap-2">
      {/* Ganti dengan <img src="/images/logo-stuntingguard.svg" /> jika aset sudah ada */}
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B8A5A] text-white sm:h-12 sm:w-12">
        <HeartHandshake className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
      </span>
      <div className="leading-tight">
        <p className="text-xl font-bold text-[#1B8A5A] sm:text-2xl">
          StuntingGuard.
        </p>
        <p className="text-[7px] font-medium tracking-wide text-[#0F2942]/70 sm:text-[8px]">
          SEMANGAT MEMBANGUN KELUARGA BERKUALITAS
        </p>
      </div>
    </div>
  );
}

function DecorBlobs() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* kanan atas */}
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-[2.5rem] bg-[#1B8A5A] sm:h-40 sm:w-40" />
      <div className="absolute -right-16 top-6 h-32 w-32 rotate-12 rounded-[2.5rem] bg-[#0F2942] sm:-right-20 sm:top-10 sm:h-48 sm:w-48" />
      {/* kiri bawah */}
      <div className="absolute -bottom-12 -left-10 h-28 w-28 rounded-full bg-[#1B8A5A] sm:h-44 sm:w-44" />
      <div className="absolute -bottom-16 left-10 h-28 w-28 -rotate-12 rounded-[2.5rem] bg-[#0F2942] sm:left-24 sm:h-40 sm:w-40" />
    </div>
  );
}

function PartnerBadge() {
  return (
    <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3 rounded-full bg-white/90 px-3 py-1.5 shadow-md backdrop-blur sm:bottom-4 sm:left-4">
      {/* Ganti dengan logo asli: /images/logo-jabar.png & /images/logo-kemenkes.png */}
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F2942] text-[8px] font-bold text-white">
        JABAR
      </span>
      <span className="text-[8px] font-semibold uppercase leading-tight text-[#0F2942]">
        Kementerian
        <br />
        Kesehatan
        <br />
        Republik Indonesia
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Halaman Login                                                        */
/* variant="v1" → form biasa                                            */
/* variant="v2" → v1 + dropdown akun tersimpan saat input email fokus   */
/* ------------------------------------------------------------------ */
export default function LoginPage({ variant = "v1" }) {
  const navigate = useNavigate();
  const isV2 = variant === "v2";

  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const emailWrapRef = useRef(null);

  // Tutup dropdown saat klik di luar / tekan Escape
  useEffect(() => {
    if (!showSuggestions) return;
    const onClick = (e) => {
      if (emailWrapRef.current && !emailWrapRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    const onKey = (e) => e.key === "Escape" && setShowSuggestions(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [showSuggestions]);

  // Arahkan ke dashboard jika sudah memiliki sesi login aktif
  useEffect(() => {
    const token = getToken();
    const user = getUser();
    if (token && user?.role) {
      const roleUpper = String(user.role).toUpperCase();
      if (roleUpper === "KADER") navigate("/kader/dashboard", { replace: true });
      else if (roleUpper === "APARATUR") navigate("/aparatur/dashboard", { replace: true });
      else if (roleUpper === "ADMIN") navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setError("");
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handlePickAccount = (account) => {
    setForm((prev) => ({ ...prev, email: account.email, password: account.password }));
    setShowSuggestions(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Email dan password wajib diisi.");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const res = await api.login({
        email: form.email,
        password: form.password,
        remember: form.remember,
      });

      const redirectTo = res?.data?.redirectTo || "/login";
      navigate(redirectTo);
    } catch (err) {
      setError(
        err?.message ||
          "Email atau password salah. Periksa kembali lalu coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAccounts = SAVED_ACCOUNTS.filter((a) =>
    a.email.toLowerCase().includes(form.email.toLowerCase())
  );

  const inputBase =
    "w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-[#0F2942] placeholder:text-slate-400 outline-none transition focus:border-[#1B8A5A] focus:ring-2 focus:ring-[#1B8A5A]/25";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 sm:px-6">
      {/* Foto anak-anak samar di sisi kanan latar belakang */}
      <img
        src={bgAnak}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-full object-cover object-left opacity-40 md:w-1/2 md:opacity-100 [mask-image:linear-gradient(to_left,black_45%,transparent)]"
      />
      <DecorBlobs />

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-[#0F2942]/10 lg:min-h-[34rem] lg:grid-cols-[56fr_44fr]">
        {/* ---------- Kolom form ---------- */}
        <section className="flex flex-col px-6 py-8 sm:px-12 sm:py-10">
          <Logo />

          <div className="mx-auto my-10 w-full max-w-sm flex-1 sm:my-14">
            <h1 className="text-center text-2xl font-bold text-[#1B8A5A]">
              Masukan Akun Anda
            </h1>
            <div className="mx-auto mt-2 h-0.5 w-20 rounded bg-[#1B8A5A]" />
            <p className="mt-6 text-center text-xs text-slate-500">
              masuk gunakan akun email anda
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
              {/* Email + dropdown akun tersimpan (v2) */}
              <div ref={emailWrapRef} className="relative">
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Youremail@gmail.com"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => isV2 && setShowSuggestions(true)}
                  className={inputBase}
                  aria-expanded={isV2 ? showSuggestions : undefined}
                  aria-controls={isV2 ? "saved-accounts" : undefined}
                />

                {isV2 && showSuggestions && filteredAccounts.length > 0 && (
                  <ul
                    id="saved-accounts"
                    role="listbox"
                    className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-slate-100 bg-white py-1 shadow-xl shadow-[#0F2942]/15"
                  >
                    {filteredAccounts.map((acc) => (
                      <li key={acc.id} role="option">
                        <button
                          type="button"
                          onClick={() => handlePickAccount(acc)}
                          className="group flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-[#1B8A5A]/5 focus-visible:bg-[#1B8A5A]/10 focus-visible:outline-none"
                        >
                          <span>
                            <span className="block text-xs font-medium text-[#0F2942]">
                              {acc.email}
                            </span>
                            <span className="mt-0.5 block text-xs tracking-widest text-slate-400">
                              ••••••••••••
                            </span>
                          </span>
                          <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#1B8A5A]" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Password */}
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className={`${inputBase} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:text-[#0F2942] focus-visible:outline-2 focus-visible:outline-[#1B8A5A]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Ingat saya + lupa password */}
              <div className="flex items-center justify-between text-xs text-[#0F2942]">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={handleChange}
                    className="h-3.5 w-3.5 rounded border-slate-300 accent-[#1B8A5A]"
                  />
                  Ingatkan Saya
                </label>
                <Link
                  to="/auth/forgot-password"
                  className="font-medium hover:text-[#1B8A5A] hover:underline"
                >
                  Lupa Password?
                </Link>
              </div>

              {error && (
                <p
                  role="alert"
                  className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </p>
              )}

              <div className="flex justify-center pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex min-w-36 items-center justify-center gap-2 rounded-full bg-[#0F2942] px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F2942]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B8A5A] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLoading ? "Memproses..." : "Masuk"}
                </button>
              </div>
            </form>
          </div>

          <footer className="flex items-center justify-center gap-3 text-[10px] text-slate-400">
            <Link to="/privacy-policy" className="hover:text-[#1B8A5A]">
              Privacy Policy
            </Link>
            <span aria-hidden="true">.</span>
            <Link to="/terms" className="hover:text-[#1B8A5A]">
              Terms &amp; Conditions
            </Link>
          </footer>
        </section>

        {/* ---------- Kolom foto (disembunyikan di mobile) ---------- */}
        <aside className="relative hidden lg:block">
          <img
            src={posyanduPhoto}
            alt="Kegiatan penimbangan dan pemeriksaan di posyandu"
            className="absolute inset-0 h-full w-full rounded-3xl object-cover object-[center_45%] shadow-[0_8px_30px_rgba(15,41,66,0.25)]"
          />
        </aside>
      </div>

      <PartnerBadge />
    </main>
  );
}

/* Wrapper opsional agar routing lebih jelas */
export const LoginV1 = () => <LoginPage variant="v1" />;
export const LoginV2 = () => <LoginPage variant="v2" />;
