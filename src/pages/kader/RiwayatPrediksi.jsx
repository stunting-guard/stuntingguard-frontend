import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  ListFilter,
  Loader2,
  MapPin,
  RotateCcw,
  Search,
} from "lucide-react";
import RiskBadge from "../../components/common/RiskBadge";
import Pagination from "../../components/common/Pagination";
import { api } from "../../services/api";

const RISIKO_OPTIONS = ["Semua Risiko", "Tinggi", "Sedang", "Rendah"];
const PAGE_SIZE = 6;

/* ------------------------- Sub-komponen ------------------------- */
function FilterSelect({ icon: Icon, value, onChange, options, label }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl bg-slate-100 py-2.5 pl-9 pr-8 text-xs font-medium text-[#0F2942] outline-none transition focus:ring-2 focus:ring-[#1B8A5A]/30"
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

const DetailLink = ({ id }) => (
  <Link
    to={id ? `/kader/hasil-klasifikasi/${id}` : "/kader/hasil"}
    className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#1B8A5A] hover:underline focus-visible:outline-2 focus-visible:outline-[#1B8A5A]"
  >
    Lihat Detail
    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
  </Link>
);

/* ------------------------- Halaman ------------------------- */
export default function RiwayatPrediksi() {
  const [search, setSearch] = useState("");
  const [rw, setRw] = useState("Semua RW");
  const [risiko, setRisiko] = useState(RISIKO_OPTIONS[0]);
  const [page, setPage] = useState(1);

  const [rwOptions, setRwOptions] = useState([
    "Semua RW",
    "RW 01",
    "RW 02",
    "RW 03",
    "RW 04",
    "RW 05",
  ]);

  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Muat daftar RW dinamis dari master wilayah
  useEffect(() => {
    let isMounted = true;
    async function loadWilayah() {
      try {
        const res = await api.get("/master/wilayah");
        if (isMounted && res?.success && res?.data?.rw && Array.isArray(res.data.rw)) {
          const list = ["Semua RW", ...res.data.rw];
          setRwOptions([...new Set(list)]);
        }
      } catch {
        // Gunakan fallback RW_OPTIONS
      }
    }
    loadWilayah();
    return () => {
      isMounted = false;
    };
  }, []);

  // Muat data riwayat dari endpoint GET /api/riwayat
  useEffect(() => {
    let isMounted = true;

    async function fetchRiwayat() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const params = {
          search: search.trim() || undefined,
          rw: rw !== "Semua RW" ? rw : undefined,
          risiko: risiko !== "Semua Risiko" ? risiko.toUpperCase() : undefined,
          page,
          limit: PAGE_SIZE,
        };

        const res = await api.get("/riwayat", params);

        if (!isMounted) return;

        if (res?.success && res?.data) {
          setItems(res.data.items || []);
          const meta = res.data.meta || {};
          setTotalPages(meta.totalPages || 1);
          setTotalCount(meta.total || 0);
        } else {
          setErrorMessage(res?.message || "Gagal memuat data riwayat.");
        }
      } catch (err) {
        if (!isMounted) return;
        setErrorMessage(
          err?.data?.message || err?.message || "Terjadi kesalahan jaringan saat mengambil riwayat."
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchRiwayat();
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [search, rw, risiko, page]);

  const update = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const handleReset = () => {
    setSearch("");
    setRw("Semua RW");
    setRisiko(RISIKO_OPTIONS[0]);
    setPage(1);
  };

  const from = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, totalCount);

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide text-[#1B8A5A]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1B8A5A]" aria-hidden="true" />
          KONSOL POSYANDU • LOG &amp; RIWAYAT PEMERIKSAAN
        </span>
        <h1 className="mt-1.5 text-2xl font-bold text-[#0F2942] sm:text-3xl">Riwayat Prediksi Risiko</h1>
        <p className="mt-1 text-sm text-slate-500">
          Daftar hasil penilaian risiko stunting keluarga yang telah diperiksa dan divalidasi oleh sistem.
        </p>
      </div>

      {/* Filter */}
      <section
        aria-label="Filter riwayat"
        className="grid gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:grid-cols-[1fr_auto_auto_auto]"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            aria-label="Cari No. KK, kepala keluarga, nama ibu, atau balita"
            placeholder="Cari No. KK, kepala keluarga, nama ibu, atau balita..."
            value={search}
            onChange={(e) => update(setSearch)(e.target.value)}
            className="w-full rounded-xl bg-slate-100 py-2.5 pl-10 pr-4 text-xs text-[#0F2942] placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-[#1B8A5A]/30"
          />
        </div>
        <FilterSelect
          label="Filter RW"
          icon={MapPin}
          value={rw}
          onChange={update(setRw)}
          options={rwOptions}
        />
        <FilterSelect
          label="Filter risiko"
          icon={ListFilter}
          value={risiko}
          onChange={update(setRisiko)}
          options={RISIKO_OPTIONS}
        />
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-[#0F2942] transition hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-[#1B8A5A]"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset
        </button>
      </section>

      {/* Daftar */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 px-6 py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#1B8A5A]" />
            <p className="text-xs font-medium text-slate-400">Memuat data riwayat skrining...</p>
          </div>
        ) : errorMessage ? (
          <div className="px-6 py-16 text-center text-xs text-red-600">
            <p>{errorMessage}</p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-3 inline-flex items-center gap-1.5 font-semibold text-[#1B8A5A] hover:underline"
            >
              Muat Ulang Filter
            </button>
          </div>
        ) : items.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-slate-500">
            Tidak ada riwayat yang cocok dengan filter.
          </p>
        ) : (
          <>
            {/* Desktop: tabel */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="bg-slate-100 text-[11px] font-semibold text-[#0F2942]">
                  <tr>
                    <th className="px-6 py-3.5">Tanggal Prediksi</th>
                    <th className="px-3 py-3.5">Identitas Keluarga & Ibu</th>
                    <th className="px-3 py-3.5">Balita</th>
                    <th className="px-3 py-3.5">Wilayah</th>
                    <th className="px-3 py-3.5">Tingkat Risiko</th>
                    <th className="px-3 py-3.5">Faktor Dominan</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((r) => (
                    <tr key={r.id} className="transition hover:bg-slate-50/70">
                      <td className="whitespace-nowrap px-6 py-4">
                        <p className="font-semibold text-[#0F2942]">{r.tanggal}</p>
                        <p className="text-[11px] text-slate-400">{r.jam}</p>
                      </td>
                      <td className="px-3 py-4">
                        <p className="font-semibold text-[#0F2942]">{r.kepala}</p>
                        {r.namaIbu && r.namaIbu !== "-" && (
                          <p className="text-[11px] text-slate-500">Ibu: {r.namaIbu}</p>
                        )}
                        {r.noKk && r.noKk !== "-" && (
                          <p className="font-mono text-[10px] text-slate-400">KK: {r.noKk}</p>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <p className="font-semibold text-[#0F2942]">{r.balita}</p>
                        {r.kodeKeluarga && (
                          <p className="font-mono text-[10px] text-slate-400">{r.kodeKeluarga}</p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-600">
                        {r.rw} / {r.rt}
                      </td>
                      <td className="px-3 py-4">
                        <RiskBadge level={r.risiko} />
                      </td>
                      <td className="px-3 py-4 text-slate-600">
                        <span className="line-clamp-2">{r.faktor}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DetailLink id={r.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: kartu */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {items.map((r) => (
                <li key={r.id} className="space-y-2 px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#0F2942]">{r.kepala}</p>
                      {r.namaIbu && r.namaIbu !== "-" && (
                        <p className="text-xs text-slate-500">Ibu: {r.namaIbu}</p>
                      )}
                      {r.noKk && r.noKk !== "-" && (
                        <p className="font-mono text-[10px] text-slate-400">No. KK: {r.noKk}</p>
                      )}
                      <p className="mt-1 text-xs font-medium text-[#1B8A5A]">Balita: {r.balita}</p>
                    </div>
                    <RiskBadge level={r.risiko} />
                  </div>
                  <p className="text-xs text-slate-600">{r.faktor}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {r.tanggal} · {r.jam} · {r.rw}/{r.rt}
                    </span>
                    <DetailLink id={r.id} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="flex flex-col items-center gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-between">
          <p className="text-xs text-slate-500">
            Menampilkan {from} - {to} dari {totalCount} penilaian
          </p>
          <Pagination variant="icon" page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </section>
    </div>
  );
}
