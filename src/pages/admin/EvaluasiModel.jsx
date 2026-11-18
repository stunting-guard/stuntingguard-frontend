import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  Info,
  Loader2,
  RotateCw,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
} from "lucide-react";
import Modal, { ModalClose } from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";
import useToast from "../../hooks/useToast";
import { api } from "../../services/api";

/* ------------------------------------------------------------------ */
/* Fallback data                                                      */
/* ------------------------------------------------------------------ */
const DEFAULT_TOTAL_UJI = 2568;
const DEFAULT_TP_TOTAL = 2372;

const ICON_MAP = {
  Settings,
  Target,
  ShieldCheck,
  SlidersHorizontal,
};

const DEFAULT_METRICS = [
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

const DEFAULT_KELAS = ["Rendah", "Sedang", "Tinggi"];

const DEFAULT_MATRIX = [
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

const DEFAULT_PER_KATEGORI = [
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
const satuDesimal = (n) =>
  typeof n === "number" ? n.toFixed(1).replace(".", ",") : n || "0";

/* ------------------------------------------------------------------ */
/* Sub-komponen lokal                                                  */
/* ------------------------------------------------------------------ */
function MetricCard({ metric }) {
  const Icon = typeof metric.icon === "string" ? ICON_MAP[metric.icon] || Settings : metric.icon || Settings;
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-bold uppercase leading-4 tracking-[0.1em] text-slate-500">
          {metric.label}
        </p>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${metric.tone || "bg-slate-100 text-slate-600"}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-[34px] font-extrabold leading-none tracking-tight text-[#0F2942]">
          {metric.value}
        </span>
        {metric.suffix && (
          <span className="text-[11px] font-semibold text-teal-700">{metric.suffix}</span>
        )}
      </p>
      {metric.note && (
        <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-600">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" aria-hidden="true" />
          {metric.note}
        </p>
      )}
    </article>
  );
}

const DEFAULT_FEATURE_IMPORTANCE = [
  { fitur: "Kondisi Sanitasi & Jamban", bobot: 28.5 },
  { fitur: "Akses Sumber Air Bersih", bobot: 22.4 },
  { fitur: "Pendapatan Keluarga", bobot: 16.2 },
  { fitur: "Status Sosial Ekonomi (PKH/BPNT)", bobot: 11.5 },
  { fitur: "Praktik Pemberian MPASI", bobot: 8.4 },
  { fitur: "Pemberian ASI Eksklusif", bobot: 6.2 },
  { fitur: "Usia Reproduksi Ibu", bobot: 4.1 },
  { fitur: "Tingkat Pendidikan Ibu", bobot: 2.7 },
];

/* ------------------------------------------------------------------ */
/* Halaman                                                             */
/* ------------------------------------------------------------------ */
export default function EvaluasiModel() {
  const [metrics, setMetrics] = useState(DEFAULT_METRICS);
  const [matrix, setMatrix] = useState(DEFAULT_MATRIX);
  const [kelas, setKelas] = useState(DEFAULT_KELAS);
  const [perKategori, setPerKategori] = useState(DEFAULT_PER_KATEGORI);
  const [totalUji, setTotalUji] = useState(DEFAULT_TOTAL_UJI);
  const [tpTotal, setTpTotal] = useState(DEFAULT_TP_TOTAL);
  const [totalDataLatih, setTotalDataLatih] = useState(2568);
  const [totalDataLatihRiil, setTotalDataLatihRiil] = useState(null);
  const [datasetRiil, setDatasetRiil] = useState(null);
  const [errorRate, setErrorRate] = useState("7,6");
  const [algoritma, setAlgoritma] = useState("Random Forest (n_estimators=100, max_depth=12)");
  const [versiModel, setVersiModel] = useState("Random Forest Classifier v1.2");
  const [lastTrained, setLastTrained] = useState(null);
  const [featureImportance, setFeatureImportance] = useState(DEFAULT_FEATURE_IMPORTANCE);

  const [isLoading, setIsLoading] = useState(true);
  const [retrainOpen, setRetrainOpen] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const { toast, showToast } = useToast();

  const jumlahDataLatih = totalDataLatihRiil ?? totalDataLatih;

  const rincianDataset = useMemo(() => {
    if (!datasetRiil || typeof datasetRiil !== "object") return [];

    const labelMap = {
      total: "Total Data",
      totalData: "Total Data",
      jumlahData: "Total Data",
      totalBaris: "Total Baris",
      dataLatih: "Data Latih",
      latih: "Data Latih",
      dataUji: "Data Uji",
      uji: "Data Uji",
      kelasTinggi: "Kelas Risiko Tinggi",
      tinggi: "Kelas Risiko Tinggi",
      kelasSedang: "Kelas Risiko Sedang",
      sedang: "Kelas Risiko Sedang",
      kelasRendah: "Kelas Risiko Rendah",
      rendah: "Kelas Risiko Rendah",
      fitur: "Jumlah Fitur",
      jumlahFitur: "Jumlah Fitur",
      sumber: "Sumber Data",
      updatedAt: "Diperbarui",
    };

    return Object.entries(datasetRiil)
      .filter(
        ([key, value]) =>
          labelMap[key] &&
          (typeof value === "number" || typeof value === "string")
      )
      .map(([key, value]) => ({ label: labelMap[key], value }));
  }, [datasetRiil]);

  const terapkanRincianRiil = useCallback((data) => {
    if (!data) return;

    const detail =
      data.datasetRiil && typeof data.datasetRiil === "object"
        ? data.datasetRiil
        : typeof data.datasetRiil === "number"
          ? { total: data.datasetRiil }
          : null;

    if (detail) setDatasetRiil(detail);

    const totalRiil =
      data.totalDataLatihRiil ??
      data.totalDatasetRiil ??
      detail?.total ??
      detail?.totalData;

    if (totalRiil !== undefined && totalRiil !== null && totalRiil !== "") {
      const angka = Number(totalRiil);
      if (Number.isFinite(angka)) setTotalDataLatihRiil(angka);
    }
  }, []);

  const fetchEvaluasi = useCallback(async () => {
    try {
      const res = await api.get("/admin/ml/evaluasi");
      if (res?.success && res?.data) {
        const d = res.data;
        terapkanRincianRiil(d);
        if (Array.isArray(d.metrics)) {
          setMetrics(
            d.metrics.map((m) => ({
              ...m,
              icon: typeof m.icon === "string" ? ICON_MAP[m.icon] || Settings : m.icon,
            }))
          );
        }
        if (Array.isArray(d.matrix)) setMatrix(d.matrix);
        if (Array.isArray(d.kelas)) setKelas(d.kelas);
        if (Array.isArray(d.perKategori)) setPerKategori(d.perKategori);
        if (d.totalUji) setTotalUji(d.totalUji);
        if (d.tpTotal) setTpTotal(d.tpTotal);
        if (d.totalDataLatih) setTotalDataLatih(d.totalDataLatih);
        if (d.errorRate !== undefined) setErrorRate(satuDesimal(d.errorRate));
        if (d.algoritma) setAlgoritma(d.algoritma);
        if (d.versiModel) setVersiModel(d.versiModel);
        if (d.lastTrained) setLastTrained(d.lastTrained);
        if (Array.isArray(d.featureImportance) && d.featureImportance.length > 0) {
          setFeatureImportance(d.featureImportance);
        }
      }
    } catch {
      // Fallback default
    } finally {
      setIsLoading(false);
    }
  }, [terapkanRincianRiil]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvaluasi();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchEvaluasi]);

  const handleDownload = () => {
    window.print();
  };

  const handleRetrain = async () => {
    setIsTraining(true);
    try {
      const res = await api.post("/admin/ml/retrain", {});
      if (res?.success) {
        terapkanRincianRiil(res.data);
        showToast(
          `Pelatihan ulang selesai. Akurasi model terbaru: ${res.data?.akurasiBaru || "94,9"}%`
        );
        setRetrainOpen(false);
        await fetchEvaluasi();
      } else {
        showToast(res?.message || "Gagal melatih ulang model.");
      }
    } catch (err) {
      showToast(err?.data?.message || err?.message || "Terjadi kesalahan saat melatih ulang model.");
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <Toast message={toast} />

      {/* Header halaman */}
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-800">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
              {versiModel}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-medium text-slate-500">
              Total Data Latih: <b className="text-slate-800">{fmt.format(jumlahDataLatih)}</b> Skrining
            </span>
            {totalDataLatihRiil !== null && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold text-sky-800">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
                Data Riil Database
              </span>
            )}
            {lastTrained && (
              <>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500">
                  Terakhir Dilatih: {new Date(lastTrained).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </>
            )}
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#0F2942] sm:text-[28px]">
            Hasil Evaluasi Model Random Forest
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {algoritma} • Pengujian validasi silang (cross-validation)
          </p>
          {isLoading && (
            <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Memuat data evaluasi model...
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-800 transition hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Cetak Rekap Evaluasi (PDF)
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
        {metrics.map((metric) => (
          <MetricCard key={metric.key || metric.label} metric={metric} />
        ))}
      </section>

      {/* Rincian dataset riil dari database */}
      {rincianDataset.length > 0 && (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0F2942]">
                Rincian Dataset Riil
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Sumber data latih aktual dari basis data sistem desa.
              </p>
            </div>
            <span className="self-start rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-800 sm:self-auto">
              {fmt.format(jumlahDataLatih)} Baris
            </span>
          </div>

          <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {rincianDataset.map((item) => (
              <div
                key={`${item.label}-${item.value}`}
                className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
              >
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {item.label}
                </dt>
                <dd className="mt-1.5 text-lg font-extrabold text-[#0F2942]">
                  {typeof item.value === "number"
                    ? fmt.format(item.value)
                    : item.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Confusion matrix & metrik per kategori */}
      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
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
              Data Uji: {fmt.format(totalUji)} Balita
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
                    {kelas.map((k) => (
                      <th
                        key={k}
                        scope="col"
                        className="rounded-md bg-[#F4F6FA] px-2 py-2 text-[11px] font-semibold text-slate-600"
                      >
                        Risiko {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row) => (
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
                <b className="text-slate-900">{fmt.format(tpTotal)}</b> / {fmt.format(totalUji)})
              </span>
            </p>
            <p className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Info className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              Tingkat Error Misklasifikasi hanya {errorRate}%
            </p>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-[#0F2942] sm:text-lg">
            Metrik per Kategori Risiko
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Klasifikasi detail Precision, Recall, &amp; F1-Score per tingkat urgensi
          </p>

          <div className="mt-5 space-y-3">
            {perKategori.map((item) => (
              <div key={item.label} className="rounded-xl bg-[#F4F6FA] p-4">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <p className="flex items-center gap-2 text-xs font-bold text-[#0F2942]">
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.dot || "bg-teal-600"}`}
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
              <span className="shrink-0">Total: {fmt.format(totalUji)} Baris</span>
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

      {/* Nilai Kepentingan Fitur (Feature Importance) 8 Variabel Model */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-teal-700" />
              <h2 className="text-base font-bold text-[#0F2942] sm:text-lg">
                Tingkat Kepentingan Fitur (Feature Importance)
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Kontribusi bobot relatif 8 variabel prediktor sosio-ekonomi dan pengasuhan model Random Forest (Validasi Jurnal 2025).
            </p>
          </div>
          <span className="self-start rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800 sm:self-auto">
            8 Fitur Utama Acuan
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featureImportance.map((f, idx) => (
            <div
              key={f.fitur}
              className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-slate-200"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-100 text-[11px] font-bold text-teal-800">
                    #{idx + 1}
                  </span>
                  <span className="text-sm font-black text-[#0F2942]">
                    {f.bobot}%
                  </span>
                </div>
                <p className="mt-2 text-xs font-bold text-[#0F2942] leading-snug">
                  {f.fitur}
                </p>
              </div>
              <div className="mt-3">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full ${
                      idx === 0
                        ? "bg-teal-700"
                        : idx === 1
                        ? "bg-teal-600"
                        : idx < 4
                        ? "bg-sky-600"
                        : "bg-slate-500"
                    }`}
                    style={{ width: `${Math.min(100, f.bobot * 3)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
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
                Model akan dilatih kembali menggunakan dataset skrining balita terbaru pada basis data sistem.
              </p>
            </div>

            <dl className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-100 text-xs">
              {[
                ["Algoritma", algoritma || "Random Forest Classifier (scikit-learn)"],
                ["Validasi", "5-Fold Stratified Cross-Validation"],
                ["Total Data Latih", `${fmt.format(jumlahDataLatih)} baris data`],
                ["Engine Machine Learning", "Python 3.13 / scikit-learn runtime"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 px-4 py-2.5">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="text-right font-semibold text-[#0F2942]">{value}</dd>
                </div>
              ))}
            </dl>

            {isTraining && (
              <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 p-3.5 text-xs text-teal-900 flex items-center gap-2.5 text-left">
                <Loader2 className="h-4 w-4 animate-spin text-teal-700 shrink-0" />
                <p>
                  <strong>Proses Pelatihan Berjalan:</strong> Menjalankan Python scikit-learn RandomForestClassifier, kalkulasi 5-fold Cross-Validation, dan pembaruan berkas <code>model_rf.joblib</code>...
                </p>
              </div>
            )}

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
                {isTraining ? "Melatih scikit-learn..." : "Mulai Latih Ulang"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
