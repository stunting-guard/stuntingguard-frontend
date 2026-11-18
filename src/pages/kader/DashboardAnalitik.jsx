import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  Download,
  Filter,
  Lightbulb,
  Loader2,
  PieChart,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import RiskBadge from "../../components/common/RiskBadge";
import Pagination from "../../components/common/Pagination";
import { api } from "../../services/api";

/* ------------------------- FALLBACK DATA ------------------------- */
const DEFAULT_FILTER_OPTIONS = {
  kecamatan: ["Semua Kecamatan", "Kec. Cibadak", "Kec. Cikalong"],
  desa: ["Semua Desa", "Desa Sukamaju", "Desa Sukamulya"],
};

const DEFAULT_SUMMARY = {
  totalKK: 0,
  tinggi: 0,
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
function FilterSelect({ value, onChange, options, label, icon: Icon }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      )}
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pr-8 text-xs font-medium text-[#0F2942] outline-none transition focus:border-[#1B8A5A] focus:ring-2 focus:ring-[#1B8A5A]/25 ${
          Icon ? "pl-9" : "pl-3"
        }`}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function StatCard({ label, value, unit, desc, icon: Icon, iconWrap, accent = "" }) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-2xl bg-white p-5 shadow-md ${accent}`}>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-wide text-slate-400">{label}</p>
        <p className="mt-1.5 text-3xl font-extrabold leading-none text-[#0F2942]">
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
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((f) => (
        <span key={f} className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
          {f}
        </span>
      ))}
    </div>
  );
}

/* ------------------------- Halaman ------------------------- */
export default function DashboardAnalitik() {
  const [filterOptions, setFilterOptions] = useState(DEFAULT_FILTER_OPTIONS);
  const [filters, setFilters] = useState({
    kecamatan: "Semua Kecamatan",
    desa: "Semua Desa",
    startDate: "",
    endDate: "",
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

  // Ambil opsi wilayah master
  useEffect(() => {
    let isMounted = true;
    async function loadWilayah() {
      try {
        const res = await api.get("/master/wilayah");
        if (isMounted && res?.success && res?.data) {
          const kec = ["Semua Kecamatan", ...(res.data.kecamatan || [])];
          const des = ["Semua Desa", ...(res.data.desa || [])];
          setFilterOptions({
            kecamatan: [...new Set(kec)],
            desa: [...new Set(des)],
          });
        }
      } catch {
        // Fallback default
      }
    }
    loadWilayah();
    return () => {
      isMounted = false;
    };
  }, []);

  // Ambil data dashboard dari endpoint GET /api/kader/dashboard
  useEffect(() => {
    let isMounted = true;

    async function fetchDashboard() {
      setIsLoading(true);
      try {
        const params = {
          kecamatan:
            filters.kecamatan !== "Semua Kecamatan" ? filters.kecamatan : undefined,
          desa: filters.desa !== "Semua Desa" ? filters.desa : undefined,
          start_date: filters.startDate || undefined,
          end_date: filters.endDate || undefined,
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
        // Gunakan state sebelumnya
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, [filters, page]);

  const setFilter = (key) => (value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
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

  const resetDateFilter = () => {
    setFilters((prev) => ({ ...prev, startDate: "", endDate: "" }));
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
    <div className="space-y-5">
      {/* Judul */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F2942] sm:text-3xl">Dashboard Analitik</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ringkasan risiko stunting balita berdasarkan hasil klasifikasi Random Forest.
        </p>
      </div>

      {/* Filter */}
      <section
        aria-label="Filter data"
        className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-md lg:flex-row lg:items-center"
      >
        <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Filter className="h-4 w-4" aria-hidden="true" />
          Filter Data:
        </p>
        <div className="grid flex-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(20rem,2fr)]">
          <FilterSelect
            label="Kecamatan"
            value={filters.kecamatan}
            onChange={setFilter("kecamatan")}
            options={filterOptions.kecamatan}
          />
          <FilterSelect
            label="Desa"
            value={filters.desa}
            onChange={setFilter("desa")}
            options={filterOptions.desa}
          />
          <div className="flex min-w-0 items-end gap-2 sm:col-span-2 xl:col-span-1">
            <label className="min-w-0 flex-1">
              <span className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                <CalendarDays className="h-3 w-3" aria-hidden="true" />
                Tanggal Mulai
              </span>
              <input
                id="dashboard-start-date"
                type="date"
                value={filters.startDate}
                max={filters.endDate || undefined}
                onChange={setDateFilter("startDate")}
                aria-label="Tanggal mulai"
                className="w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-medium text-[#0F2942] outline-none transition focus:border-[#1B8A5A] focus:ring-2 focus:ring-[#1B8A5A]/25"
              />
            </label>
            <label className="min-w-0 flex-1">
              <span className="mb-1 flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                <CalendarDays className="h-3 w-3" aria-hidden="true" />
                Tanggal Akhir
              </span>
              <input
                id="dashboard-end-date"
                type="date"
                value={filters.endDate}
                min={filters.startDate || undefined}
                onChange={setDateFilter("endDate")}
                aria-label="Tanggal akhir"
                className="w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-medium text-[#0F2942] outline-none transition focus:border-[#1B8A5A] focus:ring-2 focus:ring-[#1B8A5A]/25"
              />
            </label>
            {(filters.startDate || filters.endDate) && (
              <button
                type="button"
                onClick={resetDateFilter}
                aria-label="Reset rentang tanggal"
                title="Reset rentang tanggal"
                className="mb-px inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B8A5A]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={isExporting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F2942] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0F2942]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B8A5A] disabled:opacity-75"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="h-4 w-4" aria-hidden="true" />
          )}
          {isExporting ? "Mengunduh..." : "Unduh Laporan"}
        </button>
      </section>

      {/* Kartu ringkasan */}
      <section aria-label="Ringkasan" className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="TOTAL KELUARGA TERDATA"
          value={fmt(summary.totalKK)}
          unit="KK"
          desc="Terdaftar pada sistem sensus desa"
          icon={Users}
          iconWrap="bg-emerald-50 text-[#1B8A5A]"
        />
        <StatCard
          label="RISIKO TINGGI"
          value={fmt(summary.tinggi)}
          unit="Keluarga"
          desc="Prioritas intervensi penanganan segera"
          icon={AlertTriangle}
          iconWrap="bg-red-50 text-red-500"
          accent="border-l-4 border-red-500"
        />
        <StatCard
          label="% RISIKO TINGGI"
          value={`${summary.persenTinggi ?? 0}%`}
          desc="Dari total populasi balita terdata"
          icon={PieChart}
          iconWrap="bg-sky-50 text-sky-500"
        />
      </section>

      {/* Tabel prioritas + faktor */}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="overflow-hidden rounded-2xl bg-white shadow-md">
          <div className="flex flex-col gap-2 p-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#0F2942]">Daftar Keluarga Prioritas Intervensi</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Sasaran aksi intervensi perbaikan sanitasi dan nutrisi spesifik
              </p>
            </div>
            <p className="flex items-center gap-1.5 text-[11px] text-[#1B8A5A]">
              <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
              Data anonim sesuai standar perlindungan privasi
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
              {/* Desktop: tabel */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[640px] text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] font-bold tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">NO / ID KELUARGA</th>
                      <th className="px-3 py-3">KEPALA KELUARGA</th>
                      <th className="px-3 py-3">BALITA &amp; USIA</th>
                      <th className="px-3 py-3">WILAYAH</th>
                      <th className="px-3 py-3">STATUS RISIKO</th>
                      <th className="px-3 py-3">FAKTOR PEMICU UTAMA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prioritasItems.map((r) => (
                      <tr key={r.id} className="transition hover:bg-slate-50/70">
                        <td className="whitespace-nowrap px-5 py-3.5 font-mono text-[11px] text-slate-500">{r.id}</td>
                        <td className="px-3 py-3.5 font-semibold text-[#0F2942]">{r.kepala}</td>
                        <td className="px-3 py-3.5">
                          <p className="font-medium text-[#0F2942]">{r.balita}</p>
                          <p className="text-[11px] text-slate-400">{r.usia}</p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 text-slate-600">{r.rw}</td>
                        <td className="px-3 py-3.5">
                          <RiskBadge level={r.status} />
                        </td>
                        <td className="px-3 py-3.5">
                          <FaktorChips items={r.faktor} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: kartu */}
              <ul className="divide-y divide-slate-100 border-t border-slate-100 md:hidden">
                {prioritasItems.map((r) => (
                  <li key={r.id} className="space-y-2 px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#0F2942]">{r.kepala}</p>
                        <p className="font-mono text-[11px] text-slate-400">{r.id}</p>
                      </div>
                      <RiskBadge level={r.status} />
                    </div>
                    <p className="text-xs text-slate-600">
                      {r.balita} · {r.usia} · {r.rw}
                    </p>
                    <FaktorChips items={r.faktor} />
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

        <section className="rounded-2xl bg-white p-5 shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-[#0F2942]">Faktor Pemicu Dominan</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Analisis Machine Learning (Random Forest Feature Importance)
              </p>
            </div>
            <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
              RF-v1
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
                  <div className={`h-full rounded-full ${f.bar}`} style={{ width: `${Math.min(100, f.value)}%` }} />
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3.5 text-xs leading-relaxed text-slate-600">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#1B8A5A]" aria-hidden="true" />
            <p>
              <b className="text-[#0F2942]">Temuan Utama:</b> Sanitasi dan akses air bersih
              berkontribusi signifikan terhadap total akumulasi risiko stunting balita di wilayah survei.
            </p>
          </div>
        </section>
      </div>

      {/* Sebaran risiko per RW */}
      <section className="rounded-2xl bg-white p-5 shadow-md sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#0F2942]">Sebaran Risiko per Wilayah (RW)</h2>
            <p className="mt-0.5 text-xs text-slate-500">Zonasi tingkat kerentanan sosio-ekonomi per unit RW</p>
          </div>
          <ul className="flex items-center gap-4 text-[11px] text-slate-500" aria-label="Legenda">
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
                className={`rounded-xl px-3 py-2.5 ${isPriority ? "border border-red-100 bg-red-50/60" : ""}`}
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
                  className="flex h-3 overflow-hidden rounded-full bg-slate-100"
                  role="img"
                  aria-label={`${r.rw}: Tinggi ${r.segmen?.tinggi || 0}%, Sedang ${r.segmen?.sedang || 0}%, Rendah ${r.segmen?.rendah || 0}%`}
                >
                  <div className="bg-red-500" style={{ width: `${r.segmen?.tinggi || 0}%` }} />
                  <div className="bg-amber-400" style={{ width: `${r.segmen?.sedang || 0}%` }} />
                  <div className="bg-emerald-500" style={{ width: `${r.segmen?.rendah || 0}%` }} />
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
  );
}
