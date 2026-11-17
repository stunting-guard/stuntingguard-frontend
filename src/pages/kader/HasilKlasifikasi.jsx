import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  Bath,
  Building2,
  Clock,
  ClipboardCheck,
  Droplets,
  GraduationCap,
  HeartPulse,
  History,
  Loader2,
  PlusCircle,
  Wallet,
  FileText,
} from "lucide-react";
import { api } from "../../services/api";

/* ------------------------- FALLBACK DATA ------------------------- */
const MOCK_HASIL = {
  keluarga: "Bpk. Slamet & Balita: Ananda Yusuf (24 bln) • RW 03",
  status: "tinggi",
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

function resolveFaktorVisual(item) {
  const lbl = String(item.label || "").toLowerCase();
  let icon = AlertTriangle;
  let bar = "bg-slate-400";
  let text = "text-[#0F2942]";

  if (lbl.includes("sanitasi") || lbl.includes("jamban")) {
    icon = Bath;
    bar = "bg-red-700";
    text = "text-red-700";
  } else if (lbl.includes("air") || lbl.includes("sumur") || lbl.includes("sungai")) {
    icon = Droplets;
    bar = "bg-teal-700";
    text = "text-[#0F2942]";
  } else if (lbl.includes("pendapatan") || lbl.includes("ekonomi") || lbl.includes("umr")) {
    icon = Wallet;
    bar = "bg-emerald-600";
    text = "text-[#0F2942]";
  } else if (lbl.includes("pendidikan") || lbl.includes("pengasuh") || lbl.includes("sd") || lbl.includes("smp")) {
    icon = GraduationCap;
    bar = "bg-slate-500";
    text = "text-[#0F2942]";
  } else if (lbl.includes("kek") || lbl.includes("gizi") || lbl.includes("ibu") || lbl.includes("kehamilan")) {
    icon = HeartPulse;
    bar = "bg-slate-400";
    text = "text-[#0F2942]";
  }

  return {
    label: item.label,
    value: Number(item.value) || 0,
    icon: item.icon || icon,
    bar: item.bar || bar,
    text: item.text || text,
  };
}

const Bar = ({ value, className }) => (
  <div
    className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
    role="progressbar"
    aria-valuenow={value}
    aria-valuemin={0}
    aria-valuemax={100}
  >
    <div className={`h-full rounded-full ${className}`} style={{ width: `${value}%` }} />
  </div>
);

export default function HasilKlasifikasi() {
  const { id } = useParams();
  const location = useLocation();

  const [hasil, setHasil] = useState(() => {
    if (location.state?.hasil) return location.state.hasil;
    return null;
  });
  const [isLoading, setIsLoading] = useState(!location.state?.hasil);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchDetail() {
      try {
        if (id) {
          const res = await api.get(`/prediksi/${id}`);
          if (!isMounted) return;
          if (res?.success && res?.data) {
            setHasil(res.data);
            setErrorMessage("");
          } else {
            setErrorMessage(res?.message || "Data prediksi tidak ditemukan.");
          }
        } else if (!location.state?.hasil) {
          // Jika tidak ada ID di URL dan tidak ada state, coba cari riwayat terbaru
          const latestRes = await api.get("/riwayat?limit=1");
          if (!isMounted) return;
          if (
            latestRes?.success &&
            latestRes?.data?.items &&
            latestRes.data.items.length > 0
          ) {
            const firstId = latestRes.data.items[0].id;
            const detailRes = await api.get(`/prediksi/${firstId}`);
            if (detailRes?.success && detailRes?.data) {
              setHasil(detailRes.data);
              setErrorMessage("");
              return;
            }
          }
          // Fallback ke data mock bila database belum memiliki record
          setHasil(MOCK_HASIL);
        }
      } catch (err) {
        if (!isMounted) return;
        setErrorMessage(
          err?.data?.message || err?.message || "Gagal memuat detail hasil prediksi."
        );
        if (!hasil) {
          setHasil(MOCK_HASIL);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [id, location.state]);

  if (isLoading) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 rounded-2xl bg-white p-8 shadow-md">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B8A5A]" />
        <p className="text-sm font-medium text-slate-500">Memuat hasil klasifikasi risiko...</p>
      </div>
    );
  }

  const currentHasil = hasil || MOCK_HASIL;
  const statusKey = String(currentHasil.status || "tinggi").toLowerCase();
  const s = STATUS_STYLE[statusKey] || STATUS_STYLE.tinggi;
  const formattedFaktor = Array.isArray(currentHasil.faktor)
    ? currentHasil.faktor.map(resolveFaktorVisual)
    : MOCK_HASIL.faktor;

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-800"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
          <span>{errorMessage} (Menampilkan data acuan)</span>
        </div>
      )}

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
              Keluarga: {currentHasil.keluarga || "-"}
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
                (Tingkat Keyakinan Model: {currentHasil.keyakinan ?? 85}%)
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
          {(currentHasil.probabilitas || MOCK_HASIL.probabilitas).map((p) => {
            const pKey = String(p.key || "rendah").toLowerCase();
            const pStyle = STATUS_STYLE[pKey] || STATUS_STYLE.rendah;
            return (
              <div key={p.key || p.label} className="rounded-xl bg-slate-50 p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-[#0F2942]">
                    <span className={`h-2 w-2 rounded-full ${pStyle.dot}`} aria-hidden="true" />
                    {p.label}
                  </span>
                  <span className="font-semibold text-[#0F2942]">{p.value}%</span>
                </div>
                <div className="mt-2">
                  <Bar value={p.value} className={pStyle.bar} />
                </div>
                <p className="mt-2 text-[11px] text-slate-400">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Faktor dominan */}
      <section className="rounded-2xl bg-white p-4 shadow-md sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#0F2942]">Faktor Sosio-Ekonomi Dominan</h2>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
            {formattedFaktor.length} Faktor Kunci
          </span>
        </div>
        <ul className="mt-4 space-y-3.5">
          {formattedFaktor.map(({ label, value, icon: Icon, bar, text }) => (
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
              Rekomendasi Intervensi: {currentHasil.rekomendasi?.teks || "-"}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                Batas Waktu Penanganan:{" "}
                <b className="text-[#0F2942]">{currentHasil.rekomendasi?.batas || "-"}</b>
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                Penerima Rujukan:{" "}
                <b className="text-[#0F2942]">{currentHasil.rekomendasi?.penerima || "-"}</b>
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
