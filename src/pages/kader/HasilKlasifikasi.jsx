import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Bath,
  Building2,
  Clock,
  ClipboardCheck,
  Droplets,
  GraduationCap,
  HeartPulse,
  History,
  PlusCircle,
  Wallet,
  FileText,
} from "lucide-react";

/* ------------------------- MOCK DATA ------------------------- */
// TODO: ganti dengan response API (mis. GET /api/prediksi/:id) atau location.state
const MOCK_HASIL = {
  keluarga: "Bpk. Slamet & Balita: Ananda Yusuf (24 bln) • RW 03",
  status: "tinggi", // "tinggi" | "sedang" | "rendah"
  keyakinan: 92,
  probabilitas: [
    { key: "tinggi", label: "Risiko Tinggi", value: 68, desc: "Probabilitas mayoritas klasifikasi" },
    { key: "sedang", label: "Risiko Sedang", value: 24, desc: "Peluang faktor perantara" },
    { key: "rendah", label: "Risiko Rendah", value: 8, desc: "Ambang normal sangat kecil" },
  ],
  faktor: [
    { label: "Sanitasi Tidak Layak", value: 42, icon: Bath, bar: "bg-red-700", text: "text-red-700" },
    { label: "Sumber Air Tak Terlindungi (Sumur Terbuka)", value: 26, icon: Droplets, bar: "bg-teal-700", text: "text-[#0F2942]" },
    { label: "Pendapatan Rendah (Di Bawah UMR Daerah)", value: 18, icon: Wallet, bar: "bg-emerald-600", text: "text-[#0F2942]" },
    { label: "Pendidikan Ibu (Tamat SD / Tidak Selesai)", value: 9, icon: GraduationCap, bar: "bg-slate-500", text: "text-[#0F2942]" },
    { label: "Riwayat KEK Ibu (Kurang Energi Kronis)", value: 5, icon: HeartPulse, bar: "bg-slate-400", text: "text-[#0F2942]" },
  ],
  rekomendasi: {
    teks: "Segera jadwalkan rujukan perbaikan jamban sehat ke Sanitarian Puskesmas dan fasilitasi bantuan PMT pemulihan serta akses air bersih aman untuk balita.",
    batas: "3 Hari Kerja",
    penerima: "Puskesmas Melati",
  },
};

/* Class lengkap ditulis eksplisit agar terdeteksi Tailwind v4 */
const STATUS_STYLE = {
  tinggi: {
    title: "RISIKO TINGGI",
    banner: "border-red-200 bg-red-50",
    text: "text-red-700",
    icon: "bg-red-600 text-white",
    chip: "border-red-300 text-red-700",
    chipLabel: "Perlu Intervensi Prioritas",
    dot: "bg-red-600",
    bar: "bg-red-600",
  },
  sedang: {
    title: "RISIKO SEDANG",
    banner: "border-amber-200 bg-amber-50",
    text: "text-amber-700",
    icon: "bg-amber-500 text-white",
    chip: "border-amber-300 text-amber-700",
    chipLabel: "Perlu Pemantauan Berkala",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
  },
  rendah: {
    title: "RISIKO RENDAH",
    banner: "border-emerald-200 bg-emerald-50",
    text: "text-emerald-700",
    icon: "bg-[#1B8A5A] text-white",
    chip: "border-emerald-300 text-emerald-700",
    chipLabel: "Kondisi Terpantau Baik",
    dot: "bg-[#1B8A5A]",
    bar: "bg-[#1B8A5A]",
  },
};

const Bar = ({ value, className }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
    <div className={`h-full rounded-full ${className}`} style={{ width: `${value}%` }} />
  </div>
);

export default function HasilKlasifikasi() {
  const [hasil] = useState(MOCK_HASIL);
  const s = STATUS_STYLE[hasil.status];

  return (
    <div className="space-y-4">
      {/* Judul */}
      <section className="rounded-2xl bg-white p-4 shadow-md sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#0F2942]">
            <FileText className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-wide text-slate-400">
              HASIL SKRINING LAPANGAN
            </p>
            <h1 className="text-lg font-bold text-[#0F2942] sm:text-xl">
              Hasil Klasifikasi Risiko Stunting
            </h1>
            <p className="mt-2 inline-block max-w-full rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-[#0F2942]">
              Keluarga: {hasil.keluarga}
            </p>
          </div>
        </div>
      </section>

      {/* Banner status */}
      <section
        className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${s.banner}`}
        aria-live="polite"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${s.icon}`}>
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className={`text-[10px] font-semibold ${s.text}`}>STATUS KLASIFIKASI TERDETEKSI</p>
            <p className={`text-2xl font-extrabold leading-tight sm:text-3xl ${s.text}`}>
              {s.title}{" "}
              <span className="text-xs font-medium sm:text-sm">
                (Tingkat Keyakinan Model: {hasil.keyakinan}%)
              </span>
            </p>
          </div>
        </div>
        <span className={`self-start rounded-full border bg-white px-3 py-1 text-[11px] font-semibold sm:self-center ${s.chip}`}>
          {s.chipLabel}
        </span>
      </section>

      {/* Distribusi probabilitas */}
      <section className="rounded-2xl bg-white p-4 shadow-md sm:p-5">
        <h2 className="text-sm font-semibold text-[#0F2942]">Distribusi Probabilitas Kelas Model</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {hasil.probabilitas.map((p) => (
            <div key={p.key} className="rounded-xl bg-slate-50 p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-[#0F2942]">
                  <span className={`h-2 w-2 rounded-full ${STATUS_STYLE[p.key].dot}`} aria-hidden="true" />
                  {p.label}
                </span>
                <span className="font-semibold text-[#0F2942]">{p.value}%</span>
              </div>
              <div className="mt-2">
                <Bar value={p.value} className={STATUS_STYLE[p.key].bar} />
              </div>
              <p className="mt-2 text-[11px] text-slate-400">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Faktor dominan */}
      <section className="rounded-2xl bg-white p-4 shadow-md sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#0F2942]">Faktor Sosio-Ekonomi Dominan</h2>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
            {hasil.faktor.length} Faktor Kunci
          </span>
        </div>
        <ul className="mt-4 space-y-3.5">
          {hasil.faktor.map(({ label, value, icon: Icon, bar, text }) => (
            <li key={label}>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                <span className={`flex min-w-0 items-center gap-1.5 font-medium ${text}`}>
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{label}</span>
                </span>
                <span className={`font-semibold ${text}`}>{value}%</span>
              </div>
              <Bar value={value} className={bar} />
            </li>
          ))}
        </ul>
      </section>

      {/* Rekomendasi */}
      <section className="rounded-2xl bg-white p-4 shadow-md sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#1B8A5A]">
            <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-wide text-slate-400">
              REKOMENDASI TINDAK LANJUT LAPANGAN
            </p>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-[#0F2942]">
              Rekomendasi Intervensi: {hasil.rekomendasi.teks}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                Batas Waktu Penanganan:{" "}
                <b className="text-[#0F2942]">{hasil.rekomendasi.batas}</b>
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                Penerima Rujukan:{" "}
                <b className="text-[#0F2942]">{hasil.rekomendasi.penerima}</b>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Aksi */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to="/kader/riwayat"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-[#0F2942] transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-[#1B8A5A]"
        >
          <History className="h-4 w-4" aria-hidden="true" />
          Lihat Riwayat Prediksi
        </Link>
        <Link
          to="/kader/input-data"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2942] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F2942]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B8A5A]"
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          Input Data Baru
        </Link>
      </div>
    </div>
  );
}
