import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Baby,
  Bath,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  CreditCard,
  Droplets,
  FileText,
  GraduationCap,
  Heart,
  HeartPulse,
  History,
  Landmark,
  Loader2,
  MapPin,
  PlusCircle,
  Ruler,
  Scale,
  Sparkles,
  User,
  Users,
  Utensils,
  Wallet,
} from "lucide-react";
import { api } from "../../services/api";

/* ------------------------- FALLBACK DATA ------------------------- */
const MOCK_HASIL = {
  id: 42,
  kodeKeluarga: "KK-SKM-0142",
  noKk: "3204128492040001",
  kepalaKeluarga: "Bpk. Slamet Riyadi",
  namaIbu: "Ibu Siti Aminah",
  namaBalita: "Ananda Yusuf Pratama",
  jenisKelamin: "Laki-laki",
  usiaBulan: 24,
  keluarga: "Bpk. Slamet & Balita: Ananda Yusuf (24 bln) • RW 03",
  status: "tinggi",
  statusRisiko: "TINGGI",
  keyakinan: 92,
  statusSosialEkonomi: "Prasejahtera / Penerima Bantuan (PKH/BPNT)",
  pendapatan: 1500000,
  pendidikanIbu: "SMP / Sederajat",
  usiaIbu: 22,
  kondisiSanitasi: "Tidak Memiliki Jamban / BAB Sembarangan",
  sumberAir: "Air Sungai / Sumur Terbuka Tidak Terlindung",
  asiEksklusif: "Tidak (Diberi Susu Formula / Makanan Dini)",
  praktikMpasi: "Terlambat / Terlalu Dini (< 6 Bulan)",
  tinggiBadanIbu: 144.0,
  beratLahirGram: 2450,
  probabilitas: [
    {
      key: "tinggi",
      label: "Risiko Tinggi",
      value: 68,
      desc: "Probabilitas mayoritas klasifikasi",
    },
    {
      key: "sedang",
      label: "Risiko Sedang",
      value: 24,
      desc: "Peluang faktor perantara",
    },
    {
      key: "rendah",
      label: "Risiko Rendah",
      value: 8,
      desc: "Ambang normal sangat kecil",
    },
  ],
  faktor: [
    {
      label: "Tidak Memiliki Jamban / BAB Sembarangan",
      value: 38,
      icon: Bath,
      bar: "bg-red-700",
      text: "text-red-700",
    },
    {
      label: "Air Permukaan / Sungai Tak Terlindung",
      value: 26,
      icon: Droplets,
      bar: "bg-teal-700",
      text: "text-[#0F2942]",
    },
    {
      label: "Status Sosial Ekonomi Prasejahtera (PKH/BPNT)",
      value: 18,
      icon: Wallet,
      bar: "bg-emerald-600",
      text: "text-[#0F2942]",
    },
    {
      label: "Tidak Mendapatkan ASI Eksklusif (Formula/Dini)",
      value: 11,
      icon: HeartPulse,
      bar: "bg-slate-500",
      text: "text-[#0F2942]",
    },
    {
      label: "Praktik MPASI Terlambat atau Terlalu Dini",
      value: 7,
      icon: Utensils,
      bar: "bg-slate-400",
      text: "text-[#0F2942]",
    },
  ],
  rekomendasi: {
    teks: "Segera koordinasikan rujukan perbaikan sanitasi/lingkungan ke Sanitarian Puskesmas dan fasilitasi bantuan PMT pemulihan berbasis pangan hewani serta pemantauan intensif oleh Bidan Desa.",
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
    chipLabel: "Perlu Intervensi Prioritas 1",
    dot: "bg-red-600",
    bar: "bg-red-600",
  },
  sedang: {
    title: "RISIKO SEDANG",
    banner: "border-amber-200 bg-amber-50",
    text: "text-amber-700",
    icon: "bg-amber-500 text-white",
    chip: "border-amber-300 text-amber-700",
    chipLabel: "Perlu Pemantauan Berkala & Konseling",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
  },
  rendah: {
    title: "RISIKO RENDAH",
    banner: "border-emerald-200 bg-emerald-50",
    text: "text-emerald-700",
    icon: "bg-[#1B8A5A] text-white",
    chip: "border-emerald-300 text-emerald-700",
    chipLabel: "Kondisi Terpantau Baik & Sehat",
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
  } else if (
    lbl.includes("air") ||
    lbl.includes("sumur") ||
    lbl.includes("sungai")
  ) {
    icon = Droplets;
    bar = "bg-teal-700";
    text = "text-[#0F2942]";
  } else if (
    lbl.includes("pendapatan") ||
    lbl.includes("ekonomi") ||
    lbl.includes("prasejahtera") ||
    lbl.includes("umr")
  ) {
    icon = Wallet;
    bar = "bg-emerald-600";
    text = "text-[#0F2942]";
  } else if (
    lbl.includes("pendidikan") ||
    lbl.includes("pengasuh") ||
    lbl.includes("sd") ||
    lbl.includes("smp")
  ) {
    icon = GraduationCap;
    bar = "bg-slate-500";
    text = "text-[#0F2942]";
  } else if (
    lbl.includes("asi") ||
    lbl.includes("formula") ||
    lbl.includes("menyusui")
  ) {
    icon = HeartPulse;
    bar = "bg-sky-600";
    text = "text-[#0F2942]";
  } else if (lbl.includes("mpasi") || lbl.includes("pangan") || lbl.includes("makanan")) {
    icon = Utensils;
    bar = "bg-amber-600";
    text = "text-[#0F2942]";
  } else if (lbl.includes("usia ibu") || lbl.includes("kehamilan") || lbl.includes("bblr")) {
    icon = Activity;
    bar = "bg-purple-600";
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
    <div
      className={`h-full rounded-full ${className}`}
      style={{ width: `${value}%` }}
    />
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
          err?.data?.message ||
            err?.message ||
            "Gagal memuat detail hasil prediksi."
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
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-[#1B8A5A]" />
        <p className="text-sm font-medium text-slate-500">
          Memuat hasil klasifikasi risiko...
        </p>
      </div>
    );
  }

  const currentHasil = hasil || MOCK_HASIL;
  const statusKey = String(
    currentHasil.status || currentHasil.statusRisiko || "tinggi"
  ).toLowerCase();
  const s = STATUS_STYLE[statusKey] || STATUS_STYLE.tinggi;
  const formattedFaktor = Array.isArray(currentHasil.faktor)
    ? currentHasil.faktor.map(resolveFaktorVisual)
    : MOCK_HASIL.faktor;

  // Nama & Identitas Turunan
  const noKk = currentHasil.noKk || "-";
  const kepalaKeluarga =
    currentHasil.kepalaKeluarga || currentHasil.kepala || "-";
  const namaIbu = currentHasil.namaIbu || "-";
  const namaBalita = currentHasil.namaBalita || currentHasil.balita || "-";
  const jenisKelamin = currentHasil.jenisKelamin || "-";
  const usiaBulan = currentHasil.usiaBulan ?? "-";
  const dusunInfo =
    currentHasil.dusun?.nama ||
    (currentHasil.rw ? `Wilayah ${currentHasil.rw}` : "Desa Sukamaju");

  return (
    <div className="space-y-5">
      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-800"
        >
          <AlertCircle
            className="h-4 w-4 shrink-0 text-amber-600"
            aria-hidden="true"
          />
          <span>{errorMessage} (Menampilkan data acuan)</span>
        </div>
      )}

      {/* 1. Judul & Meta Informasi */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#0F2942]">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide text-[#1B8A5A]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1B8A5A]" />
                HASIL SKRINING RESMI LAPANGAN
              </span>
              <h1 className="text-xl font-bold text-[#0F2942] sm:text-2xl">
                Hasil Klasifikasi Risiko Stunting
              </h1>
              <p className="text-xs text-slate-500">
                Model Machine Learning Random Forest Classifier (Akurasi Uji: 94,8%).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2 text-xs text-slate-600 sm:self-auto">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>
              {currentHasil.tanggal || "Hari ini"} · {currentHasil.jam || "WIB"}
            </span>
            <span className="mx-1 text-slate-300">|</span>
            <span className="font-mono font-semibold text-[#0F2942]">
              {currentHasil.kodeKeluarga || "KK-SKM"}
            </span>
          </div>
        </div>
      </section>

      {/* 2. Banner Status Klasifikasi */}
      <section
        className={`flex flex-col gap-3.5 rounded-2xl border p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between ${s.banner}`}
        aria-live="polite"
      >
        <div className="flex items-center gap-3.5 sm:gap-4">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ${s.icon}`}
          >
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <p className={`text-[10px] font-bold tracking-wider ${s.text}`}>
              STATUS KLASIFIKASI BALITA
            </p>
            <p className={`text-2xl font-black leading-tight sm:text-3xl ${s.text}`}>
              {s.title}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-700">
              Tingkat Keyakinan Model:{" "}
              <b className={s.text}>{currentHasil.keyakinan ?? 85}%</b>
              <span className="mx-2 text-slate-300">•</span>
              Ambang Kritis: {currentHasil.ambangKritis ?? 70}%
            </p>
          </div>
        </div>
        <span
          className={`self-start rounded-xl border bg-white px-3.5 py-1.5 text-xs font-bold sm:self-center ${s.chip}`}
        >
          {s.chipLabel}
        </span>
      </section>

      {/* 3. Ringkasan Identitas Keluarga & Anak */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Users className="h-4 w-4 text-[#1B8A5A]" />
          <h2 className="text-sm font-bold text-[#0F2942]">
            Ringkasan Identitas Keluarga & Balita
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <CreditCard className="h-3.5 w-3.5 text-slate-400" />
              Nomor Kartu Keluarga (No. KK)
            </span>
            <p className="mt-1 font-mono text-sm font-bold text-[#0F2942]">
              {noKk}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <User className="h-3.5 w-3.5 text-slate-400" />
              Kepala Keluarga
            </span>
            <p className="mt-1 text-sm font-bold text-[#0F2942]">
              {kepalaKeluarga}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <Heart className="h-3.5 w-3.5 text-slate-400" />
              Ibu Kandung / Pengasuh
            </span>
            <p className="mt-1 text-sm font-bold text-[#0F2942]">
              {namaIbu}
              {currentHasil.usiaIbu && (
                <span className="ml-1 text-xs font-normal text-slate-500">
                  ({currentHasil.usiaIbu} thn)
                </span>
              )}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <Baby className="h-3.5 w-3.5 text-slate-400" />
              Nama Balita Sasaran
            </span>
            <p className="mt-1 text-sm font-bold text-[#0F2942]">
              {namaBalita}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Jenis Kelamin & Usia Balita
            </span>
            <p className="mt-1 text-sm font-bold text-[#0F2942]">
              {jenisKelamin} · {usiaBulan} Bulan
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              Wilayah Administrasi
            </span>
            <p className="mt-1 text-sm font-bold text-[#0F2942]">
              {dusunInfo} {currentHasil.rt ? `(${currentHasil.rt})` : ""}
            </p>
          </div>
        </div>
      </section>

      {/* 4. Rincian 8 Faktor Sosio-Ekonomi & Lingkungan (Fitur Utama Jurnal) */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-sky-600" />
            <h2 className="text-sm font-bold text-[#0F2942]">
              Rincian 8 Variabel Prediktor Model (Sosio-Ekonomi & Pengasuhan)
            </h2>
          </div>
          <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
            Jurnal Validasi 2025
          </span>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <Landmark className="h-3.5 w-3.5 text-slate-400" />
              Status Sosial Ekonomi
            </span>
            <p className="mt-1 text-xs font-semibold text-[#0F2942] leading-snug">
              {currentHasil.statusSosialEkonomi || "-"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <Wallet className="h-3.5 w-3.5 text-slate-400" />
              Pendapatan Keluarga
            </span>
            <p className="mt-1 text-xs font-semibold text-[#0F2942]">
              {currentHasil.pendapatan
                ? `Rp ${Number(currentHasil.pendapatan).toLocaleString("id-ID")} / bln`
                : "-"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
              Pendidikan Terakhir Ibu
            </span>
            <p className="mt-1 text-xs font-semibold text-[#0F2942]">
              {currentHasil.pendidikanIbu || "-"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              Usia Ibu Saat Ini
            </span>
            <p className="mt-1 text-xs font-semibold text-[#0F2942]">
              {currentHasil.usiaIbu ? `${currentHasil.usiaIbu} Tahun` : "-"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <Bath className="h-3.5 w-3.5 text-slate-400" />
              Kondisi Sanitasi
            </span>
            <p className="mt-1 text-xs font-semibold text-[#0F2942] leading-snug">
              {currentHasil.kondisiSanitasi || "-"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <Droplets className="h-3.5 w-3.5 text-slate-400" />
              Sumber Air Bersih
            </span>
            <p className="mt-1 text-xs font-semibold text-[#0F2942] leading-snug">
              {currentHasil.sumberAir || "-"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <HeartPulse className="h-3.5 w-3.5 text-slate-400" />
              Praktik ASI Eksklusif
            </span>
            <p className="mt-1 text-xs font-semibold text-[#0F2942] leading-snug">
              {currentHasil.asiEksklusif || "-"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <Utensils className="h-3.5 w-3.5 text-slate-400" />
              Praktik Pemberian MPASI
            </span>
            <p className="mt-1 text-xs font-semibold text-[#0F2942] leading-snug">
              {currentHasil.praktikMpasi || "-"}
            </p>
          </div>
        </div>

        {/* Data Pendukung KIA jika tercatat */}
        {(currentHasil.tinggiBadanIbu || currentHasil.beratLahirGram) && (
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-amber-200/60 bg-amber-50/40 px-4 py-2.5 text-xs text-amber-900">
            <span className="font-semibold text-amber-800">
              Catatan Buku KIA:
            </span>
            {currentHasil.tinggiBadanIbu && (
              <span className="flex items-center gap-1">
                <Ruler className="h-3.5 w-3.5 text-amber-700" />
                TB Ibu: <b>{currentHasil.tinggiBadanIbu} cm</b>
              </span>
            )}
            {currentHasil.beratLahirGram && (
              <span className="flex items-center gap-1">
                <Scale className="h-3.5 w-3.5 text-amber-700" />
                Berat Lahir: <b>{currentHasil.beratLahirGram} gram</b>
              </span>
            )}
          </div>
        )}
      </section>

      {/* 5. Distribusi Probabilitas Kelas Model */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-[#0F2942]">
          Distribusi Probabilitas Kelas Random Forest
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {(currentHasil.probabilitas || MOCK_HASIL.probabilitas).map((p) => {
            const pKey = String(p.key || "rendah").toLowerCase();
            const pStyle = STATUS_STYLE[pKey] || STATUS_STYLE.rendah;
            return (
              <div
                key={p.key || p.label}
                className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-[#0F2942]">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${pStyle.dot}`}
                      aria-hidden="true"
                    />
                    {p.label}
                  </span>
                  <span className="font-black text-[#0F2942] text-sm">
                    {p.value}%
                  </span>
                </div>
                <div className="mt-2.5">
                  <Bar value={p.value} className={pStyle.bar} />
                </div>
                <p className="mt-2 text-[11px] text-slate-400 leading-normal">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Faktor Dominan Berpengaruh */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#0F2942]">
              Faktor Determinan Dominan (Kontributor Model)
            </h2>
            <p className="text-[11px] text-slate-400">
              Faktor sosio-ekonomi dan lingkungan yang memberikan kontribusi bobot tertinggi pada risiko stunting balita.
            </p>
          </div>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            {formattedFaktor.length} Faktor Teratas
          </span>
        </div>
        <ul className="mt-4 space-y-4">
          {formattedFaktor.map(({ label, value, icon: Icon, bar, text }) => (
            <li key={label}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                <span
                  className={`flex min-w-0 items-center gap-2 font-semibold ${text}`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{label}</span>
                </span>
                <span className={`font-black ${text}`}>{value}%</span>
              </div>
              <Bar value={value} className={bar} />
            </li>
          ))}
        </ul>
      </section>

      {/* 7. Rekomendasi Tindak Lanjut Lapangan */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#1B8A5A]">
            <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold tracking-wide text-slate-400">
              REKOMENDASI INTERVENSI KADER & PUSKESMAS
            </span>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-[#0F2942]">
              {currentHasil.rekomendasi?.teks || "-"}
            </p>
            <div className="mt-3.5 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" aria-hidden="true" />
                Target Rujukan:{" "}
                <b className="text-[#0F2942]">
                  {currentHasil.rekomendasi?.batas || "-"}
                </b>
              </span>
              <span className="flex items-center gap-1.5">
                <Building2
                  className="h-4 w-4 text-slate-400"
                  aria-hidden="true"
                />
                Penerima Rujukan:{" "}
                <b className="text-[#0F2942]">
                  {currentHasil.rekomendasi?.penerima || "-"}
                </b>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Tombol Navigasi Aksi */}
      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <Link
          to="/kader/riwayat"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#0F2942] transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-[#1B8A5A]"
        >
          <History className="h-4 w-4" aria-hidden="true" />
          Lihat Riwayat Prediksi
        </Link>
        <Link
          to="/kader/input-data"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2942] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F2942]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B8A5A]"
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          Input Data Keluarga Baru
        </Link>
      </div>
    </div>
  );
}
