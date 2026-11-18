import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CircleCheck,
  LayoutGrid,
  Loader2,
  ShieldCheck,
  Table2,
  TrendingUp,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";
import StatCard from "../../components/ui/StatCard";
import { api } from "../../services/api";

/* ------------------------------------------------------------------ */
/* Fallback data                                                      */
/* ------------------------------------------------------------------ */
const DEFAULT_STATS = {
  totalDataLatih: 372,
  akurasiTerakhir: 79.6,
  penggunaTerdaftar: 4,
  versiModel: "Random Forest Classifier v2.0 (scikit-learn)",
  algoritma: "Random Forest Classifier (scikit-learn)",
  pengguna: { total: 4, kader: 2, aparatur: 1, admin: 1 },
};

const MODUL_UTAMA = [
  {
    id: 1,
    judul: "Kelola Dataset Balita",
    deskripsi:
      "Unggah data CSV antropometri, pengecekan missing value, dan normalisasi Z-Score balita.",
    cta: "Buka Data",
    to: "/admin/kelola-dataset",
    icon: Table2,
  },
  {
    id: 2,
    judul: "Evaluasi Model Random Forest",
    deskripsi:
      "Tinjau visualisasi confusion matrix, precision-recall, dan kurva ROC hasil pengujian.",
    cta: "Lihat Evaluasi",
    to: "/admin/evaluasi",
    icon: TrendingUp,
  },
  {
    id: 3,
    judul: "Kelola Akun Pengguna",
    deskripsi:
      "Konfigurasi kredensial login akun admin serta kader posyandu tingkat kelurahan.",
    cta: "Kelola Akun",
    to: "/admin/kelola-pengguna",
    icon: UserCog,
  },
];

const fmt = new Intl.NumberFormat("id-ID");

/* ------------------------------------------------------------------ */
/* Halaman                                                             */
/* ------------------------------------------------------------------ */
export default function DashboardAdmin() {
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const res = await api.get("/admin/dashboard");
        if (!isMounted) return;

        if (res?.success && res?.data) {
          setStats((prev) => ({
            ...prev,
            ...res.data,
          }));
        }
      } catch {
        // Fallback default
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Sapaan */}
      <section className="rounded-2xl bg-white px-5 py-6 shadow-sm sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#E7F5F0] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-teal-800">
              Dashboard Administrasi
              <span className="h-1 w-1 rounded-full bg-[#0F8A73]" aria-hidden="true" />
            </span>
            <h1 className="mt-3 text-[26px] font-extrabold leading-tight tracking-tight text-[#0F2942] sm:text-[32px]">
              Selamat Datang, Admin &amp; Peneliti
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Mesin Klasifikasi: <strong className="text-teal-800">{stats.versiModel}</strong> ({stats.algoritma || "scikit-learn RandomForestClassifier"})
            </p>
          </div>
          {isLoading && (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Sinkronisasi data sistem...
            </span>
          )}
        </div>
      </section>

      {/* Kartu statistik */}
      <section aria-label="Ringkasan data" className="grid gap-4 md:grid-cols-3 lg:gap-5">
        <StatCard
          label="Total Data Latih"
          value={fmt.format(stats.totalDataLatih || 372)}
          caption="Baris Data Latih (MySQL + Referensi)"
          icon={<Table2 className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />}
          footerBorder
          footer={
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#E7F5F0] px-2.5 py-1 text-[11px] font-semibold text-teal-800">
                <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Format Data Bersih
              </span>
              <span className="text-[11px] text-slate-500">
                {stats.totalSkriningRiil !== undefined ? `${stats.totalSkriningRiil} Data Riil Desa` : "Sumber Posyandu Wilayah"}
              </span>
            </div>
          }
        />

        <StatCard
          label="Akurasi Model Terakhir"
          value={`${Number(stats.akurasiTerakhir !== undefined ? stats.akurasiTerakhir : 79.6).toFixed(1)}%`}
          valueClassName="mt-4 text-4xl font-extrabold leading-none tracking-tight text-teal-800 sm:text-[40px]"
          caption="5-Fold Cross-Validation"
          icon={<ShieldCheck className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />}
          footerBorder
          footer={
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#E7F5F0] px-2.5 py-1 text-[11px] font-semibold text-teal-800">
                <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {stats.versiModel || "Random Forest Classifier"}
              </span>
              {stats.waktuTraining && (
                <span className="text-[11px] text-slate-500">
                  {new Date(stats.waktuTraining).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              )}
            </div>
          }
        />

        <StatCard
          label="Pengguna Terdaftar"
          value={stats.penggunaTerdaftar}
          caption="Akun Aktif"
          icon={<UserPlus className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />}
          footerBorder
          footer={
            <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-teal-800">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              Role: {stats.pengguna?.kader ?? 0} Kader, {stats.pengguna?.aparatur ?? 0} Desa, {stats.pengguna?.admin ?? 0} Admin
            </span>
          }
        />
      </section>

      {/* Akses cepat */}
      <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
              <LayoutGrid className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-[#0F2942]">Akses Cepat Modul Utama</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Menu interaktif untuk mendukung operasional dan pemantauan sistem desa
              </p>
            </div>
          </div>
          <span className="self-start rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500">
            {MODUL_UTAMA.length} Fitur Inti
          </span>
        </div>

        <ul className="mt-5 space-y-4">
          {MODUL_UTAMA.map((m) => {
            const Icon = m.icon;
            return (
              <li
                key={m.id}
                className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-teal-800 text-white">
                    <Icon className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-[#0F2942]">
                      {m.id}. {m.judul}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
                      {m.deskripsi}
                    </p>
                  </div>
                </div>

                <Link
                  to={m.to}
                  className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:w-auto"
                >
                  {m.cta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
