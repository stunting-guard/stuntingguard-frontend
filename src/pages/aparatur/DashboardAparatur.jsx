import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  Apple,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Droplet,
  Loader2,
  Map as MapIcon,
  ShieldCheck,
  Smile,
} from "lucide-react";
import { api } from "../../services/api";

/* ------------------------- FALLBACK DATA ------------------------- */
const DEFAULT_DUSUN = [
  { id: 1, nama: "Melati", zona: "Merah", kasus: 24, balita: 120, prioritas: "PMT Ekstra", icon: AlertCircle },
  { id: 2, nama: "Mawar", zona: "Kuning", kasus: 18, balita: 110, prioritas: "Sanitasi & Akses Air Bersih", icon: Droplet },
  { id: 3, nama: "Kenanga", zona: "Hijau", kasus: 8, balita: 105, prioritas: "Pemantauan Rutin Posyandu Bulanan", icon: CheckCircle2 },
  { id: 4, nama: "Cempaka", zona: "Hijau", kasus: 4, balita: 103, prioritas: "Edukasi Mandiri Pola Asuh & MPASI", icon: BookOpen },
];

const PMT_ITEMS = "Telur, Susu, Biskuit";
const PREVALENSI_SKALA_MAKS = 35; // prevalensi (%) yang dianggap bar penuh

/* Class lengkap ditulis eksplisit agar terdeteksi Tailwind v4 */
const ZONA_STYLE = {
  Merah: {
    chip: "bg-red-50 text-red-700",
    dot: "bg-red-600",
    bar: "bg-red-800",
    text: "text-red-800",
    row: "hover:bg-red-50/40",
  },
  Kuning: {
    chip: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    bar: "bg-amber-800",
    text: "text-amber-800",
    row: "hover:bg-amber-50/40",
  },
  Hijau: {
    chip: "bg-teal-50 text-teal-700",
    dot: "bg-teal-600",
    bar: "bg-teal-700",
    text: "text-teal-800",
    row: "hover:bg-teal-50/40",
  },
};

function resolveDusunIcon(zona, prioritas = "") {
  const p = prioritas.toLowerCase();
  if (p.includes("air") || p.includes("sanitasi")) return Droplet;
  if (p.includes("edukasi") || p.includes("asuh")) return BookOpen;
  if (zona === "Merah") return AlertCircle;
  if (zona === "Kuning") return Droplet;
  return CheckCircle2;
}

/* ------------------------- Sub-komponen ------------------------- */
function StatCard({ label, value, unit, note, badge, side, icon: Icon, tone = "teal" }) {
  const TONES = {
    teal: {
      icon: "bg-emerald-50 text-[#1B8A5A]",
      badge: "bg-emerald-50 text-[#1B8A5A]",
      value: "text-[#0F2942]",
      label: "text-slate-400",
      card: "",
    },
    red: {
      icon: "bg-red-50 text-red-600",
      badge: "bg-red-50 text-red-700",
      value: "text-red-700",
      label: "text-red-700",
      card: "border-l-4 border-red-700",
    },
    green: {
      icon: "bg-emerald-100 text-[#1B8A5A]",
      badge: "bg-emerald-100 text-[#1B8A5A]",
      value: "text-[#1B8A5A]",
      label: "text-slate-400",
      card: "",
    },
  };
  const t = TONES[tone];

  return (
    <div className={`flex flex-col justify-between gap-5 rounded-2xl bg-white p-5 shadow-md ${t.card}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-[10px] font-semibold uppercase tracking-wide ${t.label}`}>{label}</p>
          <p className={`mt-2 text-3xl font-extrabold leading-none ${t.value}`}>
            {value}
            <span className="ml-1.5 text-sm font-medium text-slate-500">{unit}</span>
            {note && <span className="ml-1.5 text-xs font-semibold text-red-600">{note}</span>}
          </p>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.icon}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 text-[11px] text-slate-500">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${t.badge}`}>
          {badge}
        </span>
        <span className="text-right">{side}</span>
      </div>
    </div>
  );
}

/* ------------------------- Halaman ------------------------- */
export default function DashboardAparatur() {
  const navigate = useNavigate();
  const [dusun, setDusun] = useState(DEFAULT_DUSUN);
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const res = await api.get("/aparatur/dashboard");
        if (!isMounted) return;

        if (res?.success && res?.data) {
          if (Array.isArray(res.data.dusun) && res.data.dusun.length > 0) {
            const mapped = res.data.dusun.map((d) => ({
              id: d.id,
              nama: d.namaSingkat || d.nama.replace(/^Dusun\s+/i, ""),
              fullNama: d.nama,
              zona: d.zona || "Hijau",
              kasus: Number(d.kasus) || 0,
              balita: Number(d.balita) || 100,
              prioritas: d.prioritas || "Pemantauan Rutin",
              icon: resolveDusunIcon(d.zona, d.prioritas),
            }));
            setDusun(mapped);
          }
          if (res.data.summary) {
            setSummaryData(res.data.summary);
          }
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

  // Ringkasan dihitung dari data dusun atau dari backend summary
  const totalBalita = summaryData?.totalBalita ?? dusun.reduce((s, d) => s + d.balita, 0);
  const totalKasus = summaryData?.totalKasus ?? dusun.reduce((s, d) => s + d.kasus, 0);
  const persenKasus =
    summaryData?.persenKasus !== undefined
      ? String(summaryData.persenKasus)
      : totalBalita > 0
      ? ((totalKasus / totalBalita) * 100).toFixed(1)
      : "0";
  const dusunAman = dusun.filter((d) => d.zona === "Hijau");

  return (
    <div className="space-y-5">
      {/* Judul + breadcrumb */}
      <header className="rounded-2xl bg-white p-5 shadow-md sm:p-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide">
          <span className="text-[#1B8A5A]">APARATUR DESA</span>
          <ChevronRight className="h-3 w-3 text-slate-400" aria-hidden="true" />
          <Link to="/aparatur/data-keluarga" className="text-red-600 hover:underline">
            DATA KELUARGA
          </Link>
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="mt-1.5 text-2xl font-bold text-[#0F2942] sm:text-3xl">
            Dashboard Aparatur Desa
          </h1>
          {isLoading && (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Memperbarui data...
            </span>
          )}
        </div>
      </header>

      {/* Kartu ringkasan */}
      <section aria-label="Ringkasan" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Balita Terdata"
          value={totalBalita.toLocaleString("id-ID")}
          unit="Balita"
          icon={Smile}
          badge="100% Tercakup"
          side={`${dusun.length} Dusun Posyandu`}
        />
        <StatCard
          tone="red"
          label="Balita Berisiko Stunting"
          value={totalKasus}
          note={`(${persenKasus.replace(".", ",")}%)`}
          icon={AlertTriangle}
          badge="Perlu Intervensi Segera"
          side="WHO HAZ < -2 SD"
        />
        <StatCard
          label="Prioritas Bantuan PMT"
          value={totalKasus}
          unit="Paket"
          icon={Apple}
          badge="100% Siap Salur"
          side={PMT_ITEMS}
        />
        <StatCard
          tone="green"
          label="Status Wilayah Terkendali"
          value={dusunAman.length}
          unit="Dusun Aman"
          icon={BadgeCheck}
          badge={
            <>
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Zona Hijau Rendah
            </>
          }
          side={dusunAman.map((d) => d.nama).join(" & ") || "Terpantau"}
        />
      </section>

      {/* Sebaran risiko per dusun */}
      <section className="rounded-2xl bg-white p-5 shadow-md sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#0F2942]">
              <MapIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#0F2942]">Sebaran Risiko Berdasarkan Dusun</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Klasifikasi kerentanan gizi per posyandu terintegrasi • Klik baris dusun untuk melihat peta wilayah
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/aparatur/peta-wilayah"
              className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-[11px] font-semibold text-teal-800 transition hover:bg-teal-100"
            >
              Lihat Peta Spasial
              <ChevronRight className="h-3 w-3" />
            </Link>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-600">
              Total {dusun.length} Posyandu Aktif
            </span>
          </div>
        </div>

        <ul className="mt-5 divide-y divide-slate-100 border-t border-slate-100">
          {dusun.map((d) => {
            const z = ZONA_STYLE[d.zona] || ZONA_STYLE.Hijau;
            const prevalensi = d.balita > 0 ? (d.kasus / d.balita) * 100 : 0;
            const lebar = Math.min(100, (prevalensi / PREVALENSI_SKALA_MAKS) * 100);
            const Icon = d.icon || AlertCircle;

            return (
              <li
                key={d.id}
                onClick={() => navigate(`/aparatur/peta-wilayah?dusunId=${d.id}`)}
                className={`group cursor-pointer rounded-xl py-4 transition ${z.row}`}
                title={`Buka peta detail Dusun ${d.nama}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-sm font-semibold text-[#0F2942] group-hover:text-[#1B8A5A] transition">
                      Dusun {d.nama}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${z.chip}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${z.dot}`} aria-hidden="true" />
                      Zona {d.zona}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={`text-lg font-extrabold ${z.text}`}>
                      {d.kasus} Kasus{" "}
                      <span className="text-[11px] font-semibold">
                        (Prevalensi {prevalensi.toFixed(1).replace(".", ",")}%)
                      </span>
                    </p>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#1B8A5A] transition" />
                  </div>
                </div>

                <div
                  className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-label={`Prevalensi Dusun ${d.nama}`}
                  aria-valuenow={Number(prevalensi.toFixed(1))}
                  aria-valuemin={0}
                  aria-valuemax={PREVALENSI_SKALA_MAKS}
                >
                  <div className={`h-full rounded-full ${z.bar}`} style={{ width: `${lebar}%` }} />
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[11px]">
                  <p className={`flex items-center gap-1.5 font-medium ${z.text}`}>
                    <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Prioritas: {d.prioritas}
                  </p>
                  <p className="text-slate-400">{d.balita} Balita Total</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
