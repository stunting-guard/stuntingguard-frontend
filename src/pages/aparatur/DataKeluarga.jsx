// src/pages/aparatur/DataKeluarga.jsx
import { useMemo, useState } from "react";
import {
  Printer,
  Download,
  Users,
  ShieldCheck,
  TriangleAlert,
  CircleAlert,
  CircleCheck,
  Banknote,
  Droplets,
  GraduationCap,
  Info,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Mock data (ganti dengan response API setelah backend siap)          */
/* ------------------------------------------------------------------ */
const MOCK_DUSUN = [
  { id: 1, nama: "Dusun Melati", total: 340, tinggi: 48, sedang: 82, rendah: 210 },
  { id: 2, nama: "Dusun Mawar", total: 310, tinggi: 42, sedang: 78, rendah: 190 },
  { id: 3, nama: "Dusun Kenanga", total: 300, tinggi: 32, sedang: 68, rendah: 200 },
  { id: 4, nama: "Dusun Cempaka", total: 298, tinggi: 28, sedang: 58, rendah: 212 },
];

const MOCK_FAKTOR = [
  {
    id: "pendapatan",
    judul: "Pendapatan & Ketahanan Pangan",
    deskripsi: "Daya beli pangan hewani dan gizi seimbang terbatas",
    persen: 38,
    icon: Banknote,
    tone: {
      text: "text-rose-600",
      chip: "bg-rose-50",
      iconBox: "bg-rose-50 text-rose-500",
      bar: "bg-rose-500",
    },
  },
  {
    id: "sanitasi",
    judul: "Fasilitas Sanitasi & Air Bersih",
    deskripsi: "Jamban keluarga belum memadai dan sumber air berisiko",
    persen: 28,
    icon: Droplets,
    tone: {
      text: "text-amber-600",
      chip: "bg-amber-50",
      iconBox: "bg-amber-50 text-amber-500",
      bar: "bg-amber-500",
    },
  },
  {
    id: "pendidikan",
    judul: "Pendidikan & Pola Asuh Ibu",
    deskripsi: "Pemahaman pemberian ASI eksklusif dan MP-ASI",
    persen: 20,
    icon: GraduationCap,
    tone: {
      text: "text-teal-700",
      chip: "bg-teal-50",
      iconBox: "bg-teal-50 text-teal-700",
      bar: "bg-teal-700",
    },
  },
];

const LEGEND = [
  { label: "Rendah", dot: "bg-teal-700" },
  { label: "Sedang", dot: "bg-amber-500" },
  { label: "Tinggi", dot: "bg-red-600" },
];

const fmt = new Intl.NumberFormat("id-ID");
const pct = (n, total) => (total ? (n / total) * 100 : 0);
const pctLabel = (n, total) => {
  const v = pct(n, total);
  return `${Number.isInteger(Math.round(v * 10) / 10) ? Math.round(v) : v.toFixed(1)}%`;
};

/* ------------------------------------------------------------------ */
/* Sub-komponen lokal                                                  */
/* ------------------------------------------------------------------ */
function SummaryCard({ label, value, percent, icon: Icon, footer, accent }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm ${accent.border}`}
    >
      {accent.bar && (
        <span className={`absolute inset-x-0 top-0 h-1 ${accent.bar}`} aria-hidden />
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className={`text-xs font-semibold uppercase tracking-wide ${accent.label}`}>
              {label}
            </p>
            {percent && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${accent.pill}`}
              >
                {percent}
              </span>
            )}
          </div>
          <p className={`mt-3 text-3xl font-bold ${accent.value}`}>
            {value}{" "}
            <span className="text-xs font-medium text-slate-500">KK</span>
          </p>
        </div>

        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent.iconBox}`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <p className={`flex items-center gap-2 text-xs font-semibold ${accent.footer}`}>
          {footer.icon ? (
            <footer.icon className="h-4 w-4 text-emerald-600" />
          ) : (
            <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
          )}
          {footer.text}
        </p>
      </div>
    </div>
  );
}

function DusunRow({ dusun }) {
  const { id, nama, total, tinggi, sedang, rendah } = dusun;

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-700 text-xs font-bold text-white">
            {id}
          </span>
          <span className="text-sm font-bold text-slate-900">{nama}</span>
          <span className="text-xs text-slate-500">(Total: {total} KK)</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold">
          <span className="text-red-600">
            Tinggi: {tinggi} KK ({pctLabel(tinggi, total)})
          </span>
          <span className="hidden text-slate-300 sm:inline">|</span>
          <span className="text-amber-600">
            Sedang: {sedang} KK ({pctLabel(sedang, total)})
          </span>
          <span className="hidden text-slate-300 sm:inline">|</span>
          <span className="text-teal-700">
            Rendah: {rendah} KK ({pctLabel(rendah, total)})
          </span>
        </div>
      </div>

      <div
        className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-slate-200"
        role="img"
        aria-label={`Sebaran risiko ${nama}: tinggi ${tinggi}, sedang ${sedang}, rendah ${rendah} KK`}
      >
        <div className="bg-red-600" style={{ width: `${pct(tinggi, total)}%` }} />
        <div className="bg-amber-600" style={{ width: `${pct(sedang, total)}%` }} />
        <div className="bg-teal-700" style={{ width: `${pct(rendah, total)}%` }} />
      </div>
    </div>
  );
}

function FaktorItem({ faktor }) {
  const { judul, deskripsi, persen, icon: Icon, tone } = faktor;

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone.iconBox}`}
        >
          <Icon className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">{judul}</p>
          <p className="truncate text-xs text-slate-500">{deskripsi}</p>
        </div>

        <span
          className={`rounded-lg px-2.5 py-1 text-sm font-bold ${tone.chip} ${tone.text}`}
        >
          {persen}%
        </span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${tone.bar}`}
          style={{ width: `${persen}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Halaman                                                             */
/* ------------------------------------------------------------------ */
export default function DataKeluarga() {
  const [dusunList] = useState(MOCK_DUSUN);
  const [faktorList] = useState(MOCK_FAKTOR);

  const summary = useMemo(() => {
    const total = dusunList.reduce((a, d) => a + d.total, 0);
    const tinggi = dusunList.reduce((a, d) => a + d.tinggi, 0);
    const sedang = dusunList.reduce((a, d) => a + d.sedang, 0);
    const rendah = dusunList.reduce((a, d) => a + d.rendah, 0);
    return { total, tinggi, sedang, rendah };
  }, [dusunList]);

  const dusunTertinggi = useMemo(
    () => dusunList.reduce((max, d) => (d.tinggi > max.tinggi ? d : max), dusunList[0]),
    [dusunList]
  );

  const handlePrint = () => window.print();
  const handleDownload = () => {
    // TODO: sambungkan ke endpoint laporan (PDF/Excel) setelah backend siap
  };

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
              <span className="text-red-600">Data Keluarga</span>
            </nav>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Data Keluarga</h1>
            <p className="mt-1 text-sm text-slate-500">
              Ringkasan pemetaan risiko stunting tingkat desa untuk evaluasi dan intervensi.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl border border-teal-700 bg-white px-4 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
            >
              <Printer className="h-4 w-4" />
              Cetak Ringkasan
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
            >
              <Download className="h-4 w-4" />
              Unduh Laporan
            </button>
          </div>
        </div>
      </section>

      {/* Kartu ringkasan */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Keluarga Terdata"
          value={fmt.format(summary.total)}
          icon={Users}
          footer={{ icon: CircleCheck, text: "100% data keluarga terverifikasi" }}
          accent={{
            border: "border-slate-100",
            label: "text-slate-600",
            value: "text-slate-900",
            iconBox: "bg-slate-100 text-slate-600",
            footer: "text-slate-600",
          }}
        />
        <SummaryCard
          label="Risiko Rendah"
          value={fmt.format(summary.rendah)}
          percent={pctLabel(summary.rendah, summary.total)}
          icon={ShieldCheck}
          footer={{ text: "Kategori Aman & Gizi Cukup" }}
          accent={{
            border: "border-teal-100",
            bar: "bg-teal-700",
            label: "text-teal-700",
            pill: "bg-teal-50 text-teal-700",
            value: "text-teal-800",
            iconBox: "bg-teal-50 text-teal-700",
            footer: "text-teal-700",
            dot: "bg-teal-700",
          }}
        />
        <SummaryCard
          label="Risiko Sedang"
          value={fmt.format(summary.sedang)}
          percent={pctLabel(summary.sedang, summary.total)}
          icon={TriangleAlert}
          footer={{ text: "Status Waspada • Pemantauan Rutin" }}
          accent={{
            border: "border-amber-100",
            bar: "bg-amber-500",
            label: "text-amber-700",
            pill: "bg-amber-50 text-amber-700",
            value: "text-amber-600",
            iconBox: "bg-amber-50 text-amber-500",
            footer: "text-amber-700",
            dot: "bg-amber-500",
          }}
        />
        <SummaryCard
          label="Risiko Tinggi"
          value={fmt.format(summary.tinggi)}
          percent={pctLabel(summary.tinggi, summary.total)}
          icon={CircleAlert}
          footer={{ text: "Prioritas Utama Intervensi Bansos & Gizi" }}
          accent={{
            border: "border-red-100",
            bar: "bg-red-600",
            label: "text-red-700",
            pill: "bg-red-50 text-red-700",
            value: "text-red-600",
            iconBox: "bg-red-50 text-red-600",
            footer: "text-red-700",
            dot: "bg-red-600",
          }}
        />
      </section>

      {/* Sebaran & faktor */}
      <section className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        {/* Sebaran risiko per dusun */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Sebaran Risiko per Dusun</h2>
              <p className="mt-1 text-xs text-slate-500">
                Perbandingan tingkat risiko stunting pada {dusunList.length} wilayah dusun utama
              </p>
            </div>

            <ul className="flex items-center gap-4 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
              {LEGEND.map((item) => (
                <li key={item.label} className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
            {dusunList.map((dusun) => (
              <DusunRow key={dusun.id} dusun={dusun} />
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-slate-500">
              <Info className="h-4 w-4 shrink-0" />
              {dusunTertinggi.nama} memiliki jumlah keluarga risiko tinggi terbanyak (
              {dusunTertinggi.tinggi} KK).
            </p>
            <p className="font-semibold text-teal-700">
              Total {dusunList.length} Dusun Terdata
            </p>
          </div>
        </div>

        {/* Faktor penyebab dominan */}
        <div className="self-start rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Faktor Penyebab Dominan</h2>
          <p className="mt-1 text-xs text-slate-500">
            {faktorList.length} Faktor utama penentu kerentanan risiko stunting dari hasil
            klasifikasi
          </p>

          <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
            {faktorList.map((faktor) => (
              <FaktorItem key={faktor.id} faktor={faktor} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
