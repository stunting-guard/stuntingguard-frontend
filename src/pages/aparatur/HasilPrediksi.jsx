// src/pages/aparatur/HasilPrediksi.jsx
import { useState } from "react";
import {
  Printer,
  RotateCw,
  CircleCheck,
  ClipboardList,
  Settings,
  Smile,
  MoveVertical,
  Hourglass,
  Droplet,
  Cake,
  Users,
  CalendarDays,
  Flame,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Mock data (ganti dengan response API hasil klasifikasi Random Forest) */
/* ------------------------------------------------------------------ */
const MOCK_HASIL = {
  status: "Tinggi",
  judul: "Balita Terindikasi Berisiko Tinggi Stunting",
  deskripsi:
    "Balita memerlukan pendampingan gizi intensif dan pemantauan berkala oleh Bidan Desa Sukamaju.",
  prioritas: 1,
  keyakinan: 89,
  ambangKritis: 70,
  balita: {
    nama: "Muhammad Rizky",
    nik: "3204128492040002",
    jenisKelamin: "Laki-laki",
    usiaBulan: 24,
  },
  tinggiBadan: { nilai: 80.5, zScore: -2.35, status: "Di Bawah Standar (Pendek)" },
  beratBadan: { nilai: 9.8, zScore: -1.72, status: "Kurang" },
  lingkungan: {
    dusun: "Dusun Melati",
    rtRw: "RT 02 / RW 03",
    kepalaKeluarga: "Ahmad Fauzi",
    jamban: "Jamban Bersama",
    sumberAir: "Air Sumur Gali",
  },
  intervensi: [
    {
      id: 1,
      judul: "Kunjungan Rutin Kader & Bidan",
      tag: "Setiap 2 Pekan",
      deskripsi:
        "Bidan Desa Sukamaju dan Kader Posyandu melakukan pengecekan berat dan tinggi badan serta pemantauan kurva tumbuh kembang secara berkala.",
      footer: "Mulai Pelaksanaan: Pekan Pertama Bulan Ini",
      footerIcon: CalendarDays,
      tone: "teal",
    },
    {
      id: 2,
      judul: "Pemberian PMT Gizi Tambahan",
      tag: "Protein Hewani",
      deskripsi:
        "Distribusi paket makanan tambahan pemulihan berbasis telur, susu balita, dan biskuit bergizi tinggi dari alokasi dana penanganan stunting desa.",
      footer: "Fokus Paket: Telur & Susu Balita (90 Hari)",
      footerIcon: Flame,
      tone: "amber",
    },
  ],
};

const INTERVENSI_TONE = {
  teal: {
    card: "border-teal-200 bg-gradient-to-br from-teal-50 to-white",
    number: "bg-teal-700 text-white",
    tag: "bg-teal-700 text-white",
    footer: "text-teal-700",
  },
  amber: {
    card: "border-amber-200 bg-gradient-to-br from-amber-50 to-white",
    number: "bg-amber-500 text-white",
    tag: "bg-amber-600 text-white",
    footer: "text-amber-700",
  },
};

/* ------------------------------------------------------------------ */
/* Sub-komponen lokal                                                  */
/* ------------------------------------------------------------------ */
function SectionTitle({ icon: Icon, title, badge }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>
      <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
        {badge}
      </span>
    </div>
  );
}

function ParamCard({ label, icon: Icon, accent, children, footer }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm ${accent.border}`}
    >
      {accent.bar && <span className={`absolute inset-x-0 top-0 h-1 ${accent.bar}`} aria-hidden />}
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${accent.icon}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3">{children}</div>
      <div className="mt-4 border-t border-slate-100 pt-3">{footer}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Halaman                                                             */
/* ------------------------------------------------------------------ */
export default function HasilPrediksi() {
  const [hasil] = useState(MOCK_HASIL);
  const { balita, tinggiBadan, beratBadan, lingkungan } = hasil;

  const handlePrint = () => window.print();
  const handleInputBaru = () => {
    // TODO: navigate("/aparatur/prediksi-baru") atau buka form input
    console.log("Input prediksi baru");
  };

  return (
    <div className="space-y-6">
      {/* Header halaman */}
      <section className="rounded-2xl border border-teal-100 bg-white px-6 py-5 shadow-sm">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide"
        >
          <span className="text-teal-700">Aparatur Desa</span>
          <span className="text-slate-400">&gt;</span>
          <span className="text-red-600">Hasil Prediksi</span>
        </nav>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Hasil Evaluasi & Klasifikasi Risiko</h1>
      </section>

      {/* Hasil klasifikasi */}
      <section className="rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 via-white to-amber-50 p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                <span className="h-2 w-2 rounded-full bg-white" />
                Risiko {hasil.status} (Stunting)
              </span>
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200">
                Status Prioritas Intervensi {hasil.prioritas}
              </span>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">{hasil.judul}</h2>
            <p className="mt-2 text-sm text-slate-600">{hasil.deskripsi}</p>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-red-100 bg-white px-5 py-4 shadow-sm">
            <div className="rounded-xl bg-red-50 px-3 py-2 text-center">
              <p className="text-2xl font-bold text-red-600">{hasil.keyakinan}%</p>
              <p className="text-[10px] font-bold uppercase text-red-500">{hasil.status}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Tingkat Keyakinan
              </p>
              <p className="text-base font-bold text-slate-900">
                Keyakinan Model: {hasil.keyakinan}%
              </p>
              <p className="text-xs font-semibold text-red-600">
                Ambang Kritis &gt; {hasil.ambangKritis}%
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-red-100 pt-5 md:flex-row md:items-center md:justify-between">
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <CircleCheck className="h-4 w-4 text-teal-700" />
            Klasifikasi tervalidasi siap untuk pelaporan posyandu & sidang tugas akhir.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
            >
              <Printer className="h-4 w-4" />
              Cetak Laporan Hasil
            </button>
            <button
              type="button"
              onClick={handleInputBaru}
              className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-white px-4 py-2.5 text-sm font-semibold text-teal-800 transition hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
            >
              <RotateCw className="h-4 w-4" />
              Input Prediksi Baru
            </button>
          </div>
        </div>
      </section>

      {/* Data balita & variabel */}
      <section className="space-y-4">
        <SectionTitle icon={ClipboardList} title="Data Balita & Variabel Pengukuran" badge="4 Parameter Kunci" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ParamCard
            label="Identitas Balita"
            icon={Smile}
            accent={{ border: "border-slate-200", icon: "bg-teal-50 text-teal-700" }}
            footer={
              <p className="flex items-center gap-2 text-xs font-semibold text-teal-700">
                <Cake className="h-4 w-4" />
                {balita.jenisKelamin}, {balita.usiaBulan} Bulan
              </p>
            }
          >
            <p className="text-lg font-bold text-slate-900">{balita.nama}</p>
            <p className="mt-1 text-xs text-slate-500">NIK: {balita.nik}</p>
          </ParamCard>

          <ParamCard
            label="Tinggi Badan (TB)"
            icon={MoveVertical}
            accent={{ border: "border-red-300", bar: "bg-red-500", icon: "bg-red-50 text-red-600" }}
            footer={
              <span className="inline-block rounded-md bg-red-50 px-2 py-1 text-xs font-bold text-red-700">
                Status: {tinggiBadan.status}
              </span>
            }
          >
            <p className="text-3xl font-bold text-slate-900">
              {tinggiBadan.nilai} <span className="text-sm font-medium text-slate-500">cm</span>
            </p>
            <p className="mt-1 text-xs font-semibold text-red-600">
              Z-score: {tinggiBadan.zScore.toString().replace("-", "−")} SD
            </p>
          </ParamCard>

          <ParamCard
            label="Berat Badan (BB)"
            icon={Hourglass}
            accent={{ border: "border-amber-300", bar: "bg-amber-500", icon: "bg-amber-50 text-amber-600" }}
            footer={
              <span className="inline-block rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
                Status: {beratBadan.status}
              </span>
            }
          >
            <p className="text-3xl font-bold text-slate-900">
              {beratBadan.nilai} <span className="text-sm font-medium text-slate-500">kg</span>
            </p>
            <p className="mt-1 text-xs font-semibold text-amber-700">
              Z-score: {beratBadan.zScore.toString().replace("-", "−")} SD
            </p>
          </ParamCard>

          <ParamCard
            label="Sanitasi & Lingkungan"
            icon={Droplet}
            accent={{ border: "border-slate-200", icon: "bg-teal-50 text-teal-700" }}
            footer={
              <ul className="space-y-1 text-xs font-semibold">
                <li className="flex items-center gap-2 text-teal-700">
                  <Users className="h-3.5 w-3.5" />
                  {lingkungan.jamban}
                </li>
                <li className="flex items-center gap-2 text-amber-700">
                  <Droplet className="h-3.5 w-3.5" />
                  {lingkungan.sumberAir}
                </li>
              </ul>
            }
          >
            <p className="text-lg font-bold text-slate-900">{lingkungan.dusun}</p>
            <p className="mt-1 text-xs text-slate-500">
              {lingkungan.rtRw} (Kel. {lingkungan.kepalaKeluarga})
            </p>
          </ParamCard>
        </div>
      </section>

      {/* Rencana intervensi */}
      <section className="space-y-4">
        <SectionTitle
          icon={Settings}
          title="Rencana Intervensi Cepat Desa"
          badge={`${hasil.intervensi.length} Tindakan Segera`}
        />

        <div className="grid gap-4 lg:grid-cols-2">
          {hasil.intervensi.map((item) => {
            const tone = INTERVENSI_TONE[item.tone];
            const FooterIcon = item.footerIcon;
            return (
              <article key={item.id} className={`rounded-2xl border p-5 shadow-sm ${tone.card}`}>
                <div className="flex gap-4">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold ${tone.number}`}
                  >
                    {item.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{item.judul}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.tag}`}>
                        {item.tag}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.deskripsi}</p>
                    <p className={`mt-3 flex items-center gap-2 text-xs font-bold ${tone.footer}`}>
                      <FooterIcon className="h-4 w-4" />
                      {item.footer}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
