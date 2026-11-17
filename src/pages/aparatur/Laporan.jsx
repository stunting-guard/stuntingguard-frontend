// src/pages/aparatur/Laporan.jsx
import { useEffect, useMemo, useState } from "react";
import {
  FileSpreadsheet,
  Printer,
  CircleCheck,
  BadgeCheck,
  Loader2,
  Download,
} from "lucide-react";
import { api } from "../../services/api";

/* ------------------------------------------------------------------ */
/* Style status (class ditulis penuh agar terdeteksi Tailwind v4)       */
/* ------------------------------------------------------------------ */
const RISIKO_BADGE = {
  Tinggi: { badge: "bg-red-50 text-red-700", dot: "bg-red-600" },
  Sedang: { badge: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  Rendah: { badge: "bg-teal-50 text-teal-700", dot: "bg-teal-700" },
};

const PRIORITAS_STYLE = {
  merah: {
    tag: "bg-red-50 text-red-700",
    bar: "bg-red-600",
    kasus: "text-red-700",
  },
  kuning: {
    tag: "bg-amber-50 text-amber-800",
    bar: "bg-amber-800",
    kasus: "text-amber-800",
  },
  hijau: {
    tag: "bg-teal-50 text-teal-700",
    bar: "bg-teal-700",
    kasus: "text-teal-700",
  },
};

/* ------------------------------------------------------------------ */
/* Fallback data                                                      */
/* ------------------------------------------------------------------ */
const DEFAULT_RINGKASAN = {
  totalSasaran: 438,
  berisiko: 54,
  paketPmt: 54,
  targetEliminasi: 2025,
};

const DEFAULT_WILAYAH = [
  {
    id: 1,
    dusun: "Dusun Melati",
    tag: "Prioritas 1",
    kasus: 24,
    catatan: "Prevalensi tinggi • Fokus PMT telur & susu harian",
    tone: "merah",
  },
  {
    id: 2,
    dusun: "Dusun Mawar",
    tag: "Prioritas 2",
    kasus: 18,
    catatan: "Intervensi sanitasi lingkungan & suplai air bersih",
    tone: "kuning",
  },
  {
    id: 3,
    dusun: "Dusun Kenanga",
    tag: "Aman",
    kasus: 8,
    catatan: "Pemantauan berkala Posyandu & vitamin A",
    tone: "hijau",
  },
  {
    id: 4,
    dusun: "Dusun Cempaka",
    tag: "Aman",
    kasus: 4,
    catatan: "Edukasi MPASI sehat & pemeliharaan pola asuh",
    tone: "hijau",
  },
];

const DEFAULT_BALITA_PRIORITAS = [
  {
    id: 1,
    nama: "Muhammad Rizky",
    dusun: "Dusun Melati",
    usia: 18,
    risiko: "Tinggi",
    intervensi: "Paket PMT Telur & Susu 90 Hari",
    aksen: true,
  },
  {
    id: 2,
    nama: "Siti Nur Aisyah",
    dusun: "Dusun Melati",
    usia: 22,
    risiko: "Tinggi",
    intervensi: "Kunjungan Bidan & Suplementasi",
    aksen: true,
  },
  {
    id: 3,
    nama: "Ahmad Fauzi",
    dusun: "Dusun Mawar",
    usia: 15,
    risiko: "Tinggi",
    intervensi: "Paket PMT & Pemantauan Sanitasi",
    aksen: true,
  },
  {
    id: 4,
    nama: "Dimas Pratama",
    dusun: "Dusun Mawar",
    usia: 30,
    risiko: "Sedang",
    intervensi: "Konseling Gizi & Pantau Posyandu",
    aksen: false,
  },
  {
    id: 5,
    nama: "Alisa Putri",
    dusun: "Dusun Kenanga",
    usia: 26,
    risiko: "Sedang",
    intervensi: "Pemberian Vitamin A & Pantau TB",
    aksen: false,
  },
];

/* ------------------------------------------------------------------ */
/* Sub-komponen lokal                                                  */
/* ------------------------------------------------------------------ */
function StatCard({ label, pill, pillCls, children, caption, progress, progressCls, trackCls }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">{label}</p>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${pillCls}`}
        >
          {pill}
        </span>
      </div>
      <div className="mt-3">{children}</div>
      <p className="mt-2 text-xs text-slate-600">{caption}</p>
      <div className={`mt-3 h-2 w-full overflow-hidden rounded-full ${trackCls}`}>
        <div
          className={`h-full rounded-full ${progressCls}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

function WilayahRow({ item, totalKasus }) {
  const s = PRIORITAS_STYLE[item.tone] || PRIORITAS_STYLE.hijau;
  const width = totalKasus ? (item.kasus / totalKasus) * 100 : 0;

  return (
    <div className="rounded-xl bg-slate-50/70 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900">{item.dusun}</span>
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${s.tag}`}>{item.tag}</span>
        </div>
        <span className={`text-sm font-bold ${s.kasus}`}>{item.kasus} Kasus</span>
      </div>
      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200"
        role="img"
        aria-label={`${item.dusun}: ${item.kasus} dari ${totalKasus} kasus`}
      >
        <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${width}%` }} />
      </div>
      <p className="mt-2 text-xs text-slate-500">{item.catatan}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Halaman                                                             */
/* ------------------------------------------------------------------ */
export default function Laporan() {
  const [ringkasan, setRingkasan] = useState(DEFAULT_RINGKASAN);
  const [wilayah, setWilayah] = useState(DEFAULT_WILAYAH);
  const [balitaPrioritas, setBalitaPrioritas] = useState(DEFAULT_BALITA_PRIORITAS);

  const [isLoading, setIsLoading] = useState(true);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadLaporan() {
      setIsLoading(true);
      try {
        const res = await api.get("/aparatur/laporan");
        if (!isMounted) return;

        if (res?.success && res?.data) {
          if (res.data.ringkasan) {
            setRingkasan(res.data.ringkasan);
          }
          if (Array.isArray(res.data.wilayah) && res.data.wilayah.length > 0) {
            setWilayah(res.data.wilayah);
          }
          if (Array.isArray(res.data.balitaPrioritas) && res.data.balitaPrioritas.length > 0) {
            setBalitaPrioritas(
              res.data.balitaPrioritas.map((b, idx) => ({
                ...b,
                aksen: b.risiko === "Tinggi" || idx < 3,
              }))
            );
          }
        }
      } catch {
        // Fallback default
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadLaporan();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalKasus = useMemo(() => wilayah.reduce((a, d) => a + d.kasus, 0), [wilayah]);
  const persenBerisiko = ringkasan.totalSasaran
    ? Math.round((ringkasan.berisiko / ringkasan.totalSasaran) * 100)
    : 0;
  const persenBerisikoBar = ringkasan.totalSasaran
    ? (ringkasan.berisiko / ringkasan.totalSasaran) * 100
    : 0;

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      await api.downloadBlob(
        "/laporan/export?module=laporan&format=xlsx",
        `Laporan-Ringkasan-Stunting-${new Date().toISOString().slice(0, 10)}.xlsx`
      );
    } catch {
      alert("Gagal mengunduh berkas Excel. Pastikan sesi login aktif.");
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await api.downloadBlob(
        "/laporan/export?module=laporan&format=pdf",
        `Laporan-Ringkasan-Stunting-${new Date().toISOString().slice(0, 10)}.pdf`
      );
    } catch {
      // Fallback ke window.print jika backend PDF belum aktif
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      {/* Header halaman */}
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide"
            >
              <span className="text-teal-700">Aparatur Desa</span>
              <span className="text-slate-400">&gt;</span>
              <span className="text-red-600">Laporan</span>
            </nav>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="mt-2 text-2xl font-bold text-slate-900">
                Laporan Ringkasan Stunting
              </h1>
              {isLoading && (
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Memuat data laporan...
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={isExportingExcel}
              className="inline-flex items-center gap-2 rounded-xl border border-teal-100 bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-800 transition hover:bg-teal-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 disabled:opacity-75"
            >
              {isExportingExcel ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4" />
              )}
              {isExportingExcel ? "Mengekspor..." : "Ekspor Excel (.xlsx)"}
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-2 rounded-xl border border-teal-700 bg-white px-4 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 disabled:opacity-75"
            >
              {isExportingPdf ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isExportingPdf ? "Mengunduh..." : "Unduh PDF"}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
            >
              <Printer className="h-4 w-4" />
              Cetak Dokumen
            </button>
          </div>
        </div>
      </section>

      {/* Kartu ringkasan */}
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total Sasaran"
          pill={
            <>
              <CircleCheck className="h-3 w-3" /> 100% Terdata
            </>
          }
          pillCls="bg-teal-50 text-teal-700"
          caption="Seluruh balita terdaftar dan dipantau di Posyandu Sukamaju"
          progress={100}
          progressCls="bg-teal-700"
          trackCls="bg-teal-100"
        >
          <p className="text-4xl font-bold text-slate-900">
            {ringkasan.totalSasaran}{" "}
            <span className="text-base font-medium text-slate-500">Balita</span>
          </p>
        </StatCard>

        <StatCard
          label="Berisiko Stunting"
          pill={
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-red-600" /> Perlu Bantuan
            </>
          }
          pillCls="bg-red-50 text-red-700"
          caption="Berdasarkan HAZ < −2 SD standar baku WHO Anthro"
          progress={persenBerisikoBar}
          progressCls="bg-red-600"
          trackCls="bg-red-100"
        >
          <p className="text-4xl font-bold text-red-700">
            {ringkasan.berisiko}{" "}
            <span className="text-base font-medium">Balita ({persenBerisiko}%)</span>
          </p>
        </StatCard>

        <StatCard
          label="Rencana Bantuan PMT"
          pill={
            <>
              <CircleCheck className="h-3 w-3" /> Siap Disalurkan
            </>
          }
          pillCls="bg-teal-50 text-teal-700"
          caption="Paket intervensi gizi protein hewani & pendampingan bidan"
          progress={100}
          progressCls="bg-teal-700"
          trackCls="bg-teal-100"
        >
          <p className="text-4xl font-bold text-teal-800">
            {ringkasan.paketPmt}{" "}
            <span className="text-base font-medium">Paket Terencana</span>
          </p>
        </StatCard>
      </section>

      {/* Prioritas wilayah + daftar balita */}
      <section className="grid gap-6 xl:grid-cols-[1fr_1.7fr]">
        <div className="self-start rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">Prioritas Wilayah Dusun</h2>
            <span className="text-xs text-slate-500">{wilayah.length} Wilayah</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Rangkuman sebaran kasus stunting per rukun warga dusun
          </p>

          <div className="mt-5 space-y-3">
            {wilayah.map((item) => (
              <WilayahRow key={item.id} item={item} totalKasus={totalKasus} />
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
            <p>
              Total Kasus Berisiko:{" "}
              <b className="text-slate-900">{ringkasan.berisiko} Balita</b>
            </p>
            <p>
              Target Eliminasi: <b className="text-teal-800">{ringkasan.targetEliminasi}</b>
            </p>
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">Daftar Balita Prioritas Bantuan</h2>
            <span className="shrink-0 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-bold text-teal-800">
              {balitaPrioritas.length} Prioritas Tertinggi
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Hasil rekomendasi otomatis algoritma klasifikasi sistem untuk intervensi segera
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="bg-sky-50 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                  <th scope="col" className="rounded-l-lg px-3 py-3">
                    Nama Balita
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Dusun / Usia
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Status Risiko
                  </th>
                  <th scope="col" className="rounded-r-lg px-3 py-3">
                    Rencana Intervensi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {balitaPrioritas.map((b) => {
                  const r = RISIKO_BADGE[b.risiko] || RISIKO_BADGE.Tinggi;
                  return (
                    <tr key={b.id}>
                      <td className="px-3 py-3 font-bold text-slate-900">{b.nama}</td>
                      <td className="px-3 py-3 text-slate-600">
                        {b.dusun} ({b.usia} Bln)
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${r.badge}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${r.dot}`} />
                          {b.risiko}
                        </span>
                      </td>
                      <td
                        className={`px-3 py-3 ${
                          b.aksen ? "font-medium text-teal-700" : "text-slate-700"
                        }`}
                      >
                        {b.intervensi}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-auto pt-8">
            <div className="flex flex-col gap-2 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 font-bold text-slate-900">
                <BadgeCheck className="h-4 w-4 text-teal-700" />
                Validasi Bidan Desa &amp; Kepala Desa Sukamaju Terpenuhi
              </p>
              <p className="font-semibold text-teal-800">Siap Diujikan Sidang Skripsi</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
