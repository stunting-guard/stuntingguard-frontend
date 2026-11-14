import { useState } from "react";
import {
  Download,
  Info,
  Loader2,
  RotateCw,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Target,
} from "lucide-react";
import Modal, { ModalClose } from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";
import useToast from "../../hooks/useToast";
import useSafeTimeout from "../../hooks/useSafeTimeout";

/* ------------------------------------------------------------------ */
/* Mock data — ganti dengan response API model saat backend siap       */
/* ------------------------------------------------------------------ */
const TOTAL_UJI = 2568;
const TP_TOTAL = 2372;

const METRICS = [
  {
    key: "akurasi",
    label: "Akurasi (Accuracy)",
    value: "92,4%",
    suffix: "+1,2% baseline",
    note: "Performa Sangat Tinggi & Konsisten",
    icon: Settings,
    tone: "bg-slate-100 text-slate-600",
  },
  {
    key: "presisi",
    label: "Presisi (Precision)",
    value: "91,8%",
    suffix: "Macro Avg",
    note: "Minim Kasus False Positive",
    icon: Target,
    tone: "bg-sky-50 text-sky-700",
  },
  {
    key: "recall",
    label: "Recall (Sensitivitas)",
    value: "93,1%",
    suffix: "Tinggi",
    note: "Deteksi Balita Risiko Maksimal",
    icon: ShieldCheck,
    tone: "bg-teal-50 text-teal-700",
  },
  {
    key: "f1",
    label: "F1-Score",
    value: "92,4%",
    suffix: "Harmonic Mean",
    note: "Keseimbangan Model Optimal",
    icon: SlidersHorizontal,
    tone: "bg-indigo-50 text-indigo-600",
  },
];

const KELAS = ["Rendah", "Sedang", "Tinggi"];

const MATRIX = [
  {
    aktual: "Rendah",
    cells: [
      { n: 1198, label: "True Positive (84,3%)", diagonal: true },
      { n: 52, label: "Deviasi Sedang" },
      { n: 20, label: "Deviasi Tinggi" },
    ],
  },
  {
    aktual: "Sedang",
    cells: [
      { n: 41, label: "Deviasi Rendah" },
      { n: 724, label: "True Positive (90,2%)", diagonal: true },
      { n: 38, label: "Deviasi Tinggi" },
    ],
  },
  {
    aktual: "Tinggi",
    cells: [
      { n: 14, label: "Deviasi Rendah" },
      { n: 31, label: "Deviasi Sedang" },
      { n: 450, label: "True Positive (90,9%)", diagonal: true },
    ],
  },
];

const PER_KATEGORI = [
  {
    label: "Risiko Rendah (Normal)",
    dot: "bg-teal-600",
    sampel: 1270,
    presisi: 95.6,
    recall: 94.3,
    f1: 94.9,
  },
  {
    label: "Risiko Sedang (Stunted)",
    dot: "bg-amber-500",
    sampel: 803,
    presisi: 89.7,
    recall: 90.2,
    f1: 89.9,
  },
  {
    label: "Risiko Tinggi (Severely Stunted)",
    dot: "bg-red-500",
    sampel: 495,
    presisi: 88.6,
    recall: 90.9,
    f1: 89.7,
  },
];

const fmt = new Intl.NumberFormat("id-ID");
const satuDesimal = (n) => n.toFixed(1).replace(".", ",");
const ERROR_RATE = satuDesimal(((TOTAL_UJI - TP_TOTAL) / TOTAL_UJI) * 100);

/* ------------------------------------------------------------------ */
/* Sub-komponen lokal                                                  */
/* ------------------------------------------------------------------ */
function MetricCard({ metric }) {
  const Icon = metric.icon;
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-bold uppercase leading-4 tracking-[0.1em] text-slate-500">
          {metric.label}
        </p>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${metric.tone}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-[34px] font-extrabold leading-none tracking-tight text-[#0F2942]">
          {metric.value}
        </span>
        <span className="text-[11px] font-semibold text-teal-700">{metric.suffix}</span>
      </p>
      <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-600">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" aria-hidden="true" />
        {metric.note}
      </p>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Halaman                                                             */
/* ------------------------------------------------------------------ */
export default function EvaluasiModel() {
  const [retrainOpen, setRetrainOpen] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const { toast, showToast } = useToast();
  const schedule = useSafeTimeout();

  const handleDownload = () => {
    // Simulasi unduhan rekap — tidak membuat berkas PDF sungguhan
    showToast("Rekap evaluasi berhasil diunduh (simulasi PDF).");
  };

  const handleRetrain = () => {
    setIsTraining(true);
    // Simulasi proses pelatihan ulang model
    schedule(() => {
      setIsTraining(false);
      setRetrainOpen(false);
      showToast("Model Random Forest berhasil dilatih ulang (simulasi).");
    }, 1800);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <Toast message={toast} />

      {/* Header halaman */}
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F2942] sm:text-[28px]">
          Hasil Evaluasi Model Random Forest
        </h1>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-800 transition hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Unduh Rekap Evaluasi (PDF)
          </button>
          <button
            type="button"
            onClick={() => setRetrainOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            <RotateCw className="h-4 w-4" aria-hidden="true" />
            Latih Ulang Model
          </button>
        </div>
      </section>

      {/* Kartu metrik utama */}
      <section aria-label="Metrik performa model" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((metric) => (
          <MetricCard key={metric.key} metric={metric} />
        ))}
      </section>

      {/* Confusion matrix & metrik per kategori */}
      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <article className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0F2942] sm:text-lg">
                Matriks Kebingungan (Confusion Matrix)
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Pemetaan prediksi model vs data riil aktual (3 Kelas Klasifikasi)
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center self-start rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold text-sky-800">
              Data Uji: {fmt.format(TOTAL_UJI)} Balita
            </span>
          </div>

          <div className="mt-6 overflow-x-auto pb-1">
            <div className="min-w-[540px]">
              <p className="mb-2 flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                <span className="h-px w-12 bg-slate-200" aria-hidden="true" />
                Prediksi Model
                <span className="h-px w-12 bg-slate-200" aria-hidden="true" />
              </p>

              <table className="w-full border-separate border-spacing-1.5 text-center">
                <caption className="sr-only">
                  Confusion matrix tiga kelas risiko: rendah, sedang, dan tinggi
                </caption>
                <thead>
                  <tr>
                    <td className="w-[112px]">
                      <span className="sr-only">Aktual</span>
                    </td>
                    {KELAS.map((kelas) => (
                      <th
                        key={kelas}
                        scope="col"
                        className="rounded-md bg-[#F4F6FA] px-2 py-2 text-[11px] font-semibold text-slate-600"
                      >
                        Risiko {kelas}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MATRIX.map((row) => (
                    <tr key={row.aktual}>
                      <th
                        scope="row"
                        className="whitespace-nowrap rounded-md bg-[#F4F6FA] px-3 text-left text-[11px] font-semibold text-slate-600"
                      >
                        Aktual: {row.aktual}
                      </th>
                      {row.cells.map((cell, idx) => (
                        <td
                          key={`${row.aktual}-${idx}`}
                          className={`rounded-lg px-2 py-4 align-middle ${
                            cell.diagonal
                              ? "bg-teal-700 text-white"
                              : "bg-[#F4F6FA] text-[#0F2942]"
                          }`}
                        >
                          <p className="text-2xl font-extrabold leading-tight">{fmt.format(cell.n)}</p>
                          <p
                            className={`mt-0.5 text-[10px] ${
                              cell.diagonal ? "text-teal-50" : "text-slate-500"
                            }`}
                          >
                            {cell.label}
                          </p>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 rounded-xl bg-slate-50 px-4 py-3 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2">
              <span className="mt-0.5 h-3 w-3 shrink-0 rounded-sm bg-teal-700" aria-hidden="true" />
              <span>
                Diagonal Utama = Klasifikasi Benar (True Positive:{" "}
                <b className="text-slate-900">{fmt.format(TP_TOTAL)}</b> / {fmt.format(TOTAL_UJI)})
              </span>
            </p>
            <p className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Info className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              Tingkat Error Misklasifikasi hanya {ERROR_RATE}%
            </p>
          </div>
        </article>

        <article className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-[#0F2942] sm:text-lg">
            Metrik per Kategori Risiko
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Klasifikasi detail Precision, Recall, &amp; F1-Score per tingkat urgensi
          </p>

          <div className="mt-5 space-y-3">
            {PER_KATEGORI.map((item) => (
              <div key={item.label} className="rounded-xl bg-[#F4F6FA] p-4">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <p className="flex items-center gap-2 text-xs font-bold text-[#0F2942]">
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.dot}`}
                      aria-hidden="true"
                    />
                    {item.label}
                  </p>
                  <span className="text-[10px] font-medium text-slate-500">
                    {fmt.format(item.sampel)} Sampel Uji
                  </span>
                </div>

                <dl className="mt-3 grid grid-cols-3 gap-2">
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Presisi
                    </dt>
                    <dd className="mt-0.5 text-lg font-extrabold text-[#0F2942]">
                      {satuDesimal(item.presisi)}%
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Recall
                    </dt>
                    <dd className="mt-0.5 text-lg font-extrabold text-[#0F2942]">
                      {satuDesimal(item.recall)}%
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      F1-Score
                    </dt>
                    <dd className="mt-0.5 text-lg font-extrabold text-teal-700">
                      {satuDesimal(item.f1)}%
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between gap-3 text-[10px] font-semibold text-slate-500">
              <span>Rasio Sebaran Data Validasi (Test Set: 20%)</span>
              <span className="shrink-0">Total: {fmt.format(TOTAL_UJI)} Baris</span>
            </div>
            <div
              role="progressbar"
              aria-label="Rasio data validasi 20 persen"
              aria-valuenow={20}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"
            >
              <div className="h-full w-[20%] rounded-full bg-teal-700" />
            </div>
          </div>
        </article>
      </section>

      {/* Modal latih ulang model */}
      {retrainOpen && (
        <Modal
          labelledBy="retrain-title"
          onClose={() => !isTraining && setRetrainOpen(false)}
          width="max-w-md"
        >
          <div className="relative px-6 pb-6 pt-8 sm:px-7">
            <ModalClose onClick={() => setRetrainOpen(false)} disabled={isTraining} />

            <div className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-teal-700">
                <RotateCw
                  className={`h-7 w-7 ${isTraining ? "animate-spin" : ""}`}
                  aria-hidden="true"
                />
              </span>
              <h2 id="retrain-title" className="mt-4 text-xl font-bold text-[#0F2942]">
                Latih Ulang Model Random Forest
              </h2>
              <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">
                Model akan dilatih kembali menggunakan dataset terbaru. Proses ini tidak mengubah
                data apa pun sebelum pelatihan selesai.
              </p>
            </div>

            <dl className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-100 text-xs">
              {[
                ["Dataset latih", "12.840 baris • 6 fitur"],
                ["Pembagian data", "80% latih / 20% uji"],
                ["Algoritma", "Random Forest • 300 estimator"],
                ["Validasi", "5-Fold Cross Validation"],
                ["Estimasi proses", "± 45 detik (simulasi)"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 px-4 py-2.5">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="text-right font-semibold text-[#0F2942]">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setRetrainOpen(false)}
                disabled={isTraining}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-teal-700 disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleRetrain}
                disabled={isTraining}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isTraining ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <RotateCw className="h-4 w-4" aria-hidden="true" />
                )}
                {isTraining ? "Melatih model..." : "Mulai Latih Ulang"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
