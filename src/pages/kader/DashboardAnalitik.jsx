import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  Download,
  Eye,
  Filter,
  Lightbulb,
  Loader2,
  MapPin,
  PieChart,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import RiskBadge from "../../components/common/RiskBadge";
import Pagination from "../../components/common/Pagination";
import { api, getUser } from "../../services/api";

/* ------------------------- FALLBACK DATA ------------------------- */
const DEFAULT_SUMMARY = {
  totalKK: 0,
  tinggi: 0,
  sedang: 0,
  rendah: 0,
  persenTinggi: 0,
};

const DEFAULT_FAKTOR = [
  { label: "Sanitasi Buruk / Tidak Layak", value: 38.5, bar: "bg-teal-700" },
  { label: "Air Minum Tidak Terlindungi", value: 27.2, bar: "bg-teal-600" },
  { label: "Pendapatan Rendah (< UMR)", value: 19.8, bar: "bg-emerald-500" },
  { label: "Pendidikan Pengasuh Rendah", value: 14.5, bar: "bg-emerald-400" },
];

const DEFAULT_SEBARAN_RW = [
  { rw: "RW 01", kk: 0, persenTinggi: 0, kategori: "Rendah", segmen: { tinggi: 0, sedang: 0, rendah: 100 } },
  { rw: "RW 02", kk: 0, persenTinggi: 0, kategori: "Rendah", segmen: { tinggi: 0, sedang: 0, rendah: 100 } },
  { rw: "RW 03", kk: 0, persenTinggi: 0, kategori: "Rendah", segmen: { tinggi: 0, sedang: 0, rendah: 100 } },
];

const KATEGORI_CHIP = {
  Rendah: "bg-emerald-50 text-emerald-700",
  Sedang: "bg-amber-50 text-amber-700",
  Tinggi: "bg-red-50 text-red-700",
};

const PAGE_SIZE = 5;

/* ------------------------- Sub-komponen ------------------------- */
function StatCard({ label, value, unit, desc, icon: Icon, iconWrap, accent = "" }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md ${accent}`}
    >
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-extrabold leading-none text-[#0F2942]">
          {value}
          {unit && <span className="ml-1.5 text-sm font-semibold text-slate-400">{unit}</span>}
        </p>
        <p className="mt-2 text-xs text-slate-500">{desc}</p>
      </div>
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconWrap}`}>
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
    </div>
  );
}

function FaktorChips({ items }) {
  if (!items || items.length === 0) {
    return <span className="text-slate-400 text-xs">-</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((f) => (
        <span
          key={f}
          className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200/50"
        >
          {f}
        </span>
      ))}
    </div>
  );
}

/* ------------------------- Halaman Utama ------------------------- */
export default function DashboardAnalitik() {
  const currentUser = getUser();
  const dusunKader = currentUser?.dusun;
  const dusunNama = dusunKader?.nama || "Dusun Melati";
  const dusunRw = dusunKader?.rw || "RW 01";
  const dusunPosyandu = dusunKader?.posyandu || "Posyandu Melati";

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    risiko: "Semua",
  });
  const [page, setPage] = useState(1);

  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [prioritasItems, setPrioritasItems] = useState([]);
  const [prioritasMeta, setPrioritasMeta] = useState({
    total: 0,
    totalPages: 1,
  });
  const [faktorList, setFaktorList] = useState(DEFAULT_FAKTOR);
  const [sebaranRw, setSebaranRw] = useState(DEFAULT_SEBARAN_RW);

  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Ambil data dashboard dari endpoint GET /api/kader/dashboard
  useEffect(() => {
    let isMounted = true;

    async function fetchDashboard() {
      setIsLoading(true);
      try {
        const params = {
          start_date: filters.startDate || undefined,
          end_date: filters.endDate || undefined,
          risiko: filters.risiko !== "Semua" ? filters.risiko.toUpperCase() : undefined,
          page,
          limit: PAGE_SIZE,
        };

        const res = await api.get("/kader/dashboard", params);

        if (!isMounted) return;

        if (res?.success && res?.data) {
          const data = res.data;
          if (data.summary) {
            setSummary(data.summary);
          }
          if (data.prioritas) {
            setPrioritasItems(data.prioritas.items || []);
            setPrioritasMeta({
              total: data.prioritas.meta?.total || 0,
              totalPages: data.prioritas.meta?.totalPages || 1,
            });
          }
          if (Array.isArray(data.faktorDominan) && data.faktorDominan.length > 0) {
            const colors = [
              "bg-teal-700",
              "bg-teal-600",
              "bg-emerald-500",
              "bg-emerald-400",
              "bg-slate-500",
            ];
            setFaktorList(
              data.faktorDominan.map((f, idx) => ({
                label: f.label,
                value: Number(f.value) || 0,
                bar: colors[idx % colors.length],
              }))
            );
          }
          if (Array.isArray(data.sebaranRw) && data.sebaranRw.length > 0) {
            setSebaranRw(data.sebaranRw);
          }
        }
      } catch {
        // Fallback to previous state
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, [filters, page]);

  const setFilterRisiko = (risiko) => {
    setFilters((prev) => ({ ...prev, risiko }));
    setPage(1);
  };

  const setDateFilter = (key) => (event) => {
    const value = event.target.value;
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (next.startDate && next.endDate && next.startDate > next.endDate) {
        if (key === "startDate") next.endDate = "";
        else next.startDate = "";
      }
      return next;
    });
    setPage(1);
  };

  const resetAllFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      risiko: "Semua",
    });
    setPage(1);
  };

  const totalPages = Math.max(1, prioritasMeta.totalPages || 1);
  const totalCount = prioritasMeta.total || 0;
  const from = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, totalCount);

  const prioritasRW =
    sebaranRw.length > 0
      ? sebaranRw.reduce((a, b) => (b.persenTinggi > a.persenTinggi ? b : a), sebaranRw[0]).rw
      : "RW 01";

  const fmt = (n) => (typeof n === "number" ? n.toLocaleString("id-ID") : n || 0);

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        module: "kader-dashboard",
        format: "xlsx",
      });
      if (filters.startDate) params.set("start_date", filters.startDate);
      if (filters.endDate) params.set("end_date", filters.endDate);
      if (filters.risiko !== "Semua") params.set("risiko", filters.risiko);

      await api.downloadBlob(
        `/laporan/export?${params.toString()}`,
        `Laporan-Dashboard-Kader-${new Date().toISOString().slice(0, 10)}.xlsx`
      );
    } catch {
      alert("Gagal mengunduh laporan. Pastikan sesi login masih aktif.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide text-[#1B8A5A]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1B8A5A]" aria-hidden="true" />
            KONSOL KADER POSYANDU • ANALISIS RISIKO STUNTING
          </span>
          <h1 className="mt-1 text-2xl font-bold text-[#0F2942] sm:text-3xl">Dashboard Analitik</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ringkasan komprehensif risiko stunting balita berdasarkan klasifikasi Random Forest tervalidasi.
          </p>

          {/* Badge Cakupan Wilayah Dusun */}
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              Wilayah Penugasan: <strong className="font-bold">{dusunNama}</strong> ({dusunRw})
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              {dusunPosyandu}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/kader/input-data"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            <Plus className="h-4 w-4" />
            Input Skrining Baru
          </Link>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0F2942] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0F2942]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B8A5A] disabled:opacity-75"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-4 w-4" aria-hidden="true" />
            )}
            {isExporting ? "Mengunduh..." : "Unduh Laporan (Excel)"}
          </button>
        </div>
      </section>

      {/* Filter Bar */}
      <section
        aria-label="Filter data"
        className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 shrink-0">
              <Filter className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
              Filter Analitik:
            </span>

            {/* Filter Status Risiko */}
            <div className="flex flex-wrap items-center gap-1.5">
              {["Semua", "Tinggi", "Sedang", "Rendah"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFilterRisiko(r)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    filters.risiko === r
                      ? "bg-teal-800 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {r === "Semua" ? "Semua Risiko" : `Risiko ${r}`}
                </button>
              ))}
            </div>

            {/* Rentang Tanggal */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                <input
                  id="dashboard-start-date"
                  type="date"
                  value={filters.startDate}
                  max={filters.endDate || undefined}
                  onChange={setDateFilter("startDate")}
                  aria-label="Tanggal mulai"
                  className="bg-transparent text-xs font-medium text-[#0F2942] outline-none"
                />
                <span className="text-slate-400">—</span>
                <input
                  id="dashboard-end-date"
                  type="date"
                  value={filters.endDate}
                  min={filters.startDate || undefined}
                  onChange={setDateFilter("endDate")}
                  aria-label="Tanggal akhir"
                  className="bg-transparent text-xs font-medium text-[#0F2942] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Reset Filter Button */}
          {(filters.startDate || filters.endDate || filters.risiko !== "Semua") && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 shrink-0 self-start lg:self-center"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset Filter
            </button>
          )}
        </div>
      </section>

      {/* Kartu Ringkasan KPI (3 Kolom) */}
      <section aria-label="Ringkasan" className="grid gap-4 md:grid-cols-3 lg:gap-5">
        <StatCard
          label="TOTAL KELUARGA TERDATA"
          value={fmt(summary.totalKK)}
          unit="KK"
          desc={`Cakupan sensus balita di ${dusunNama}`}
          icon={Users}
          iconWrap="bg-emerald-50 text-[#1B8A5A]"
        />
        <StatCard
          label="BALITA RISIKO TINGGI"
          value={fmt(summary.tinggi)}
          unit="Kasus"
          desc="Prioritas intervensi gizi & PMT segera"
          icon={AlertTriangle}
          iconWrap="bg-red-50 text-red-500"
          accent="border-l-4 border-l-red-500"
        />
        <StatCard
          label="% PREVALENSI RISIKO TINGGI"
          value={`${summary.persenTinggi ?? 0}%`}
          desc="Proporsi balita risiko tinggi di dusun"
          icon={PieChart}
          iconWrap="bg-sky-50 text-sky-600"
        />
      </section>

      {/* Area Konten Utama (Grid 12 Kolom) */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Kolom Kiri: Tabel Keluarga Prioritas (lg:col-span-7 / xl:col-span-8) */}
        <section className="lg:col-span-7 xl:col-span-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex flex-col gap-2 p-6 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#0F2942]">Daftar Keluarga Prioritas Intervensi</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                  {totalCount} Terdata
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Sasaran aksi intervensi perbaikan sanitasi, PMT, dan nutrisi di {dusunNama}
              </p>
            </div>
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-[#1B8A5A]">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              Tervalidasi Random Forest
            </p>
          </div>

          {isLoading ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 px-5 py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[#1B8A5A]" />
              <p className="text-xs text-slate-400">Memuat data prioritas intervensi...</p>
            </div>
          ) : prioritasItems.length === 0 ? (
            <div className="px-5 py-12 text-center text-xs text-slate-500">
              Belum ada data keluarga pada filter yang dipilih.
            </div>
          ) : (
            <>
              {/* Desktop: Tabel Lega */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[640px] text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] font-bold tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">ID KELUARGA</th>
                      <th className="px-4 py-3">KEPALA KELUARGA</th>
                      <th className="px-4 py-3">BALITA &amp; USIA</th>
                      <th className="px-3 py-3">WILAYAH</th>
                      <th className="px-3 py-3">STATUS RISIKO</th>
                      <th className="px-4 py-3">FAKTOR PEMICU UTAMA</th>
                      <th className="px-4 py-3 text-center">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prioritasItems.map((r) => (
                      <tr key={r.id} className="transition hover:bg-slate-50/70">
                        <td className="whitespace-nowrap px-5 py-3.5 font-mono text-[11px] font-semibold text-slate-600">
                          {r.kodeKeluarga || r.id}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-[#0F2942]">{r.kepala}</td>
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-[#0F2942]">{r.balita}</p>
                          <p className="text-[11px] text-slate-400">{r.usia}</p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-slate-600 font-medium">
                          {r.rw}
                        </td>
                        <td className="px-3 py-3.5">
                          <RiskBadge level={r.status} />
                        </td>
                        <td className="px-4 py-3.5">
                          <FaktorChips items={r.faktor} />
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <Link
                            to={`/kader/hasil-klasifikasi/${r.skriningId || r.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-800 transition hover:bg-teal-100"
                            title="Lihat Detail Hasil Klasifikasi"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Detail
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Kartu */}
              <ul className="divide-y divide-slate-100 border-t border-slate-100 md:hidden">
                {prioritasItems.map((r) => (
                  <li key={r.id} className="space-y-2.5 px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#0F2942]">{r.kepala}</p>
                        <p className="font-mono text-[11px] text-slate-400">{r.kodeKeluarga || r.id}</p>
                      </div>
                      <RiskBadge level={r.status} />
                    </div>
                    <p className="text-xs text-slate-600">
                      {r.balita} · {r.usia} · {r.rw}
                    </p>
                    <FaktorChips items={r.faktor} />
                    <div className="pt-1">
                      <Link
                        to={`/kader/hasil-klasifikasi/${r.skriningId || r.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900"
                      >
                        Lihat Detail Hasil Klasifikasi
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="flex flex-col items-center gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-between">
            <p className="text-xs text-slate-500">
              Menampilkan <b className="text-[#0F2942]">{from} - {to}</b> dari{" "}
              <b className="text-[#0F2942]">{totalCount}</b> keluarga prioritas
            </p>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        </section>

        {/* Kolom Kanan: Faktor Pemicu Dominan & Sebaran RW (lg:col-span-5 / xl:col-span-4) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          {/* Kartu Faktor Dominan */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#0F2942]">Faktor Pemicu Dominan</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Feature Importance Algoritma Random Forest
                </p>
              </div>
              <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-teal-50 px-2.5 py-1 text-[10px] font-bold text-teal-800">
                <Sparkles className="h-3 w-3" />
                Random Forest
              </span>
            </div>

            <ul className="mt-5 space-y-4">
              {faktorList.map((f, i) => (
                <li key={f.label}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-[#0F2942]">
                      {i + 1}. {f.label}
                    </span>
                    <span className="font-bold text-[#1B8A5A]">{f.value}%</span>
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-valuenow={f.value}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${f.bar}`}
                      style={{ width: `${Math.min(100, f.value)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3.5 text-xs leading-relaxed text-slate-600">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#1B8A5A]" aria-hidden="true" />
              <p>
                <b className="text-[#0F2942]">Rekomendasi Utama:</b> Prioritaskan perbaikan sanitasi jamban sehat, akses air bersih, dan intervensi PMT pangan hewani pada keluarga sasaran.
              </p>
            </div>
          </section>

          {/* Kartu Sebaran Risiko per RW */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-[#0F2942]">Sebaran Risiko per Wilayah (RW)</h2>
                <p className="mt-0.5 text-xs text-slate-500">Zonasi kerentanan di cakupan {dusunNama}</p>
              </div>
              <ul className="flex items-center gap-3 text-[11px] text-slate-500" aria-label="Legenda">
                {[
                  ["Rendah", "bg-emerald-500"],
                  ["Sedang", "bg-amber-400"],
                  ["Tinggi", "bg-red-500"],
                ].map(([l, c]) => (
                  <li key={l} className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-sm ${c}`} aria-hidden="true" />
                    {l}
                  </li>
                ))}
              </ul>
            </div>

            <ul className="mt-5 space-y-3 border-t border-slate-100 pt-5">
              {sebaranRw.map((r) => {
                const isPriority = r.rw === prioritasRW && r.persenTinggi > 0;
                return (
                  <li
                    key={r.rw}
                    className={`rounded-xl px-3.5 py-3 ${isPriority ? "border border-red-100 bg-red-50/60" : "bg-slate-50/50"}`}
                  >
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="flex items-center gap-2 font-semibold text-[#0F2942]">
                        {r.rw} ({r.kk} KK)
                        {isPriority && (
                          <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                            Prioritas 1
                          </span>
                        )}
                      </span>
                      <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${KATEGORI_CHIP[r.kategori] || KATEGORI_CHIP.Rendah}`}>
                        {r.persenTinggi}% ({r.kategori})
                      </span>
                    </div>
                    <div
                      className="flex h-2.5 overflow-hidden rounded-full bg-slate-200"
                      role="img"
                      aria-label={`${r.rw}: Tinggi ${r.segmen?.tinggi || 0}%, Sedang ${r.segmen?.sedang || 0}%, Rendah ${r.segmen?.rendah || 0}%`}
                    >
                      <div className="bg-red-500 transition-all duration-300" style={{ width: `${r.segmen?.tinggi || 0}%` }} />
                      <div className="bg-amber-400 transition-all duration-300" style={{ width: `${r.segmen?.sedang || 0}%` }} />
                      <div className="bg-emerald-500 transition-all duration-300" style={{ width: `${r.segmen?.rendah || 0}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>

            <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
              * Proporsi horizontal: Merah (Tinggi), Kuning (Sedang), Hijau (Rendah)
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
