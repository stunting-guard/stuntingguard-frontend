import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, ListFilter, MapPin, RotateCcw, Search } from "lucide-react";
import RiskBadge from "../../components/common/RiskBadge";
import Pagination from "../../components/common/Pagination";

/* ------------------------- MOCK DATA ------------------------- */
// TODO: ganti dengan response API (mis. GET /api/riwayat?search=&rw=&risiko=&page=)
const RIWAYAT = [
  { id: 1, tanggal: "24 Okt 2024", jam: "09:15 WIB", kepala: "Bpk. Slamet Riyadi", balita: "Yusuf (11 bln)", rw: "RW 03", rt: "RT 02", risiko: "Tinggi", faktor: "Sanitasi & Sumber Air Minum" },
  { id: 2, tanggal: "24 Okt 2024", jam: "08:40 WIB", kepala: "Bpk. Hendra Gunawan", balita: "Aisyah (19 bln)", rw: "RW 01", rt: "RT 04", risiko: "Sedang", faktor: "Pendapatan Keluarga & BBLR" },
  { id: 3, tanggal: "23 Okt 2024", jam: "11:05 WIB", kepala: "Bpk. Eko Prasetyo", balita: "Arkan (7 bln)", rw: "RW 02", rt: "RT 01", risiko: "Rendah", faktor: "Kondisi Rumah & Gizi Seimbang" },
  { id: 4, tanggal: "23 Okt 2024", jam: "09:50 WIB", kepala: "Bpk. Bambang Sutrisno", balita: "Fadhil (14 bln)", rw: "RW 05", rt: "RT 03", risiko: "Tinggi", faktor: "Paparan Asap Rokok & Jamban" },
  { id: 5, tanggal: "22 Okt 2024", jam: "10:20 WIB", kepala: "Bpk. Agus Setiawan", balita: "Naura (23 bln)", rw: "RW 04", rt: "RT 01", risiko: "Sedang", faktor: "Riwayat Imunisasi & Akses Jamban" },
  { id: 6, tanggal: "21 Okt 2024", jam: "13:10 WIB", kepala: "Bpk. Dedi Kurniawan", balita: "Bilal (5 bln)", rw: "RW 02", rt: "RT 03", risiko: "Rendah", faktor: "ASI Eksklusif & Sanitasi Layak" },
  { id: 7, tanggal: "20 Okt 2024", jam: "15:30 WIB", kepala: "Bpk. Rudi Hartono", balita: "Zahra (28 bln)", rw: "RW 01", rt: "RT 02", risiko: "Tinggi", faktor: "Sanitasi Buruk & Air Tak Terlindungi" },
  { id: 8, tanggal: "20 Okt 2024", jam: "08:55 WIB", kepala: "Bpk. Yanto Saputra", balita: "Raka (16 bln)", rw: "RW 03", rt: "RT 04", risiko: "Sedang", faktor: "Pendidikan Ibu Rendah" },
  { id: 9, tanggal: "19 Okt 2024", jam: "10:00 WIB", kepala: "Bpk. Joko Susilo", balita: "Salsa (9 bln)", rw: "RW 04", rt: "RT 02", risiko: "Rendah", faktor: "Pola Asuh & Gizi Seimbang" },
  { id: 10, tanggal: "18 Okt 2024", jam: "14:20 WIB", kepala: "Bpk. Wawan Kurnia", balita: "Fikri (9 bln)", rw: "RW 05", rt: "RT 01", risiko: "Tinggi", faktor: "Sanitasi Buruk" },
  { id: 11, tanggal: "17 Okt 2024", jam: "09:35 WIB", kepala: "Bpk. Dadang Rohimat", balita: "Rian (12 bln)", rw: "RW 05", rt: "RT 02", risiko: "Tinggi", faktor: "Air Tak Terlindungi" },
  { id: 12, tanggal: "16 Okt 2024", jam: "11:45 WIB", kepala: "Bpk. Kosasih", balita: "Siti (24 bln)", rw: "RW 03", rt: "RT 01", risiko: "Tinggi", faktor: "Kemiskinan & Sanitasi Buruk" },
];

const RW_OPTIONS = ["Semua RW", "RW 01", "RW 02", "RW 03", "RW 04", "RW 05"];
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
          <option key={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

const DetailLink = () => (
  <Link
    to="/kader/hasil"
    className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#1B8A5A] hover:underline focus-visible:outline-2 focus-visible:outline-[#1B8A5A]"
  >
    Lihat Detail
    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
  </Link>
);

/* ------------------------- Halaman ------------------------- */
export default function RiwayatPrediksi() {
  const [search, setSearch] = useState("");
  const [rw, setRw] = useState(RW_OPTIONS[0]);
  const [risiko, setRisiko] = useState(RISIKO_OPTIONS[0]);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return RIWAYAT.filter(
      (r) =>
        (!q || r.kepala.toLowerCase().includes(q) || r.balita.toLowerCase().includes(q)) &&
        (rw === RW_OPTIONS[0] || r.rw === rw) &&
        (risiko === RISIKO_OPTIONS[0] || r.risiko === risiko)
    );
  }, [search, rw, risiko]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const from = filtered.length === 0 ? 0 : (current - 1) * PAGE_SIZE + 1;
  const to = Math.min(current * PAGE_SIZE, filtered.length);

  const update = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const handleReset = () => {
    setSearch("");
    setRw(RW_OPTIONS[0]);
    setRisiko(RISIKO_OPTIONS[0]);
    setPage(1);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0F2942] sm:text-3xl">Riwayat Prediksi Risiko</h1>
      <p className="mt-1 text-sm text-slate-500">
        Daftar hasil penilaian risiko stunting keluarga yang telah diperiksa.
      </p>

      {/* Filter */}
      <section
        aria-label="Filter riwayat"
        className="mt-6 grid gap-3 rounded-2xl bg-white p-4 shadow-md md:grid-cols-[1fr_auto_auto_auto]"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            aria-label="Cari kepala keluarga atau balita"
            placeholder="Cari nama kepala keluarga atau balita..."
            value={search}
            onChange={(e) => update(setSearch)(e.target.value)}
            className="w-full rounded-xl bg-slate-100 py-2.5 pl-10 pr-4 text-xs text-[#0F2942] placeholder:text-slate-400 outline-none transition focus:ring-2 focus:ring-[#1B8A5A]/30"
          />
        </div>
        <FilterSelect label="Filter RW" icon={MapPin} value={rw} onChange={update(setRw)} options={RW_OPTIONS} />
        <FilterSelect label="Filter risiko" icon={ListFilter} value={risiko} onChange={update(setRisiko)} options={RISIKO_OPTIONS} />
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
      <section className="mt-5 overflow-hidden rounded-2xl bg-white shadow-md">
        {rows.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-slate-500">
            Tidak ada riwayat yang cocok dengan filter.
          </p>
        ) : (
          <>
            {/* Desktop: tabel */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead className="bg-slate-100 text-[11px] font-semibold text-[#0F2942]">
                  <tr>
                    <th className="px-6 py-3.5">Tanggal Prediksi</th>
                    <th className="px-3 py-3.5">Keluarga / Balita</th>
                    <th className="px-3 py-3.5">Wilayah</th>
                    <th className="px-3 py-3.5">Tingkat Risiko</th>
                    <th className="px-3 py-3.5">Faktor Dominan</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r) => (
                    <tr key={r.id} className="transition hover:bg-slate-50/70">
                      <td className="whitespace-nowrap px-6 py-4">
                        <p className="font-semibold text-[#0F2942]">{r.tanggal}</p>
                        <p className="text-[11px] text-slate-400">{r.jam}</p>
                      </td>
                      <td className="px-3 py-4">
                        <p className="font-semibold text-[#0F2942]">{r.kepala}</p>
                        <p className="text-[11px] text-slate-400">Balita: {r.balita}</p>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-slate-600">
                        {r.rw} / {r.rt}
                      </td>
                      <td className="px-3 py-4">
                        <RiskBadge level={r.risiko} />
                      </td>
                      <td className="px-3 py-4 text-slate-600">{r.faktor}</td>
                      <td className="px-6 py-4 text-right">
                        <DetailLink />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: kartu */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {rows.map((r) => (
                <li key={r.id} className="space-y-2 px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#0F2942]">{r.kepala}</p>
                      <p className="text-[11px] text-slate-400">Balita: {r.balita}</p>
                    </div>
                    <RiskBadge level={r.risiko} />
                  </div>
                  <p className="text-xs text-slate-600">{r.faktor}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {r.tanggal} · {r.jam} · {r.rw}/{r.rt}
                    </span>
                    <DetailLink />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="flex flex-col items-center gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-between">
          <p className="text-xs text-slate-500">
            Menampilkan {from} - {to} dari {filtered.length} penilaian
          </p>
          <Pagination variant="icon" page={current} totalPages={totalPages} onChange={setPage} />
        </div>
      </section>
    </div>
  );
}
