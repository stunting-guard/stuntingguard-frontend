import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  Baby,
  Bath,
  BookOpen,
  ChevronDown,
  CreditCard,
  Droplets,
  GraduationCap,
  Heart,
  Landmark,
  Loader2,
  MapPin,
  RotateCcw,
  Ruler,
  Scale,
  Sparkles,
  User,
  Users,
  Utensils,
  Wallet,
} from "lucide-react";
import { api, getUser } from "../../services/api";

/* ------------------------- FALLBACK DATA ------------------------- */
const DEFAULT_OPTIONS = {
  statusSosialEkonomi: [
    "Prasejahtera / Penerima Bantuan (PKH/BPNT)",
    "Rentan Miskin / Bawah UMR",
    "Menengah / Sejahtera",
  ],
  pendidikan: [
    "Tidak Tamat SD",
    "SD / Sederajat",
    "SMP / Sederajat",
    "SMA / SMK / Sederajat",
    "Diploma / Sarjana (D3/S1+)",
  ],
  sanitasi: [
    "Jamban Sehat & Septictank Pribadi",
    "Jamban Layak Tanpa Septictank",
    "Sanitasi Komunal / MCK Bersama",
    "Tidak Memiliki Jamban / BAB Sembarangan",
  ],
  air: [
    "PDAM / Air Kemasan / Isi Ulang",
    "Sumur Pompa / Sumur Bor Terlindung",
    "Sumur Timba / Mata Air Terlindung",
    "Pamsimas / Penampungan Air Hujan",
    "Air Sungai / Sumur Terbuka Tidak Terlindung",
  ],
  asiEksklusif: [
    "Ya (ASI Eksklusif 0–6 Bulan / Masih Berjalan)",
    "Tidak (Diberi Susu Formula / Makanan Dini)",
  ],
  praktikMpasi: [
    "Belum Usia MPASI (< 6 Bulan)",
    "Tepat Waktu & Gizi Seimbang (Protein Hewani)",
    "Tepat Waktu Namun Kurang Beragam",
    "Terlambat / Terlalu Dini (< 6 Bulan)",
  ],
  jenisKelamin: ["Laki-laki", "Perempuan"],
};

const INITIAL_FORM = {
  // Bagian 1 — Identitas Keluarga & Balita
  wilayah: "",
  noKk: "",
  kepalaKeluarga: "",
  namaIbu: "",
  namaBalita: "",
  jenisKelamin: "Laki-laki",
  usia: "",

  // Bagian 2 — Faktor Sosio-Ekonomi & Lingkungan (8 Fitur Random Forest)
  statusSosialEkonomi: "",
  pendapatan: "",
  pendidikan: "",
  usiaIbu: "",
  sanitasi: "",
  air: "",
  asiEksklusif: "",
  praktikMpasi: "",

  // Bagian 3 — Data Pendukung Maternal & Kelahiran / Buku KIA (Opsional)
  tinggiBadanIbu: "",
  beratLahirGram: "",
};

/* ------------------------- Sub-komponen ------------------------- */
function Field({
  id,
  label,
  hint,
  error,
  required = true,
  className = "",
  children,
}) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-semibold text-[#0F2942]">
          {label}
        </label>
        {required ? (
          <span className="text-[10px] font-semibold text-[#1B8A5A]">Wajib</span>
        ) : (
          <span className="text-[10px] font-semibold text-slate-400">
            Opsional
          </span>
        )}
      </div>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-[11px] text-red-600">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-[11px] text-slate-400">{hint}</p>
      )}
    </div>
  );
}

const inputClass = (hasError) =>
  `w-full rounded-xl border bg-slate-50 py-2.5 pl-10 text-sm text-[#0F2942] placeholder:text-slate-400 outline-none transition focus:bg-white focus:ring-2 ${
    hasError
      ? "border-red-300 focus:border-red-400 focus:ring-red-200"
      : "border-slate-200 focus:border-[#1B8A5A] focus:ring-[#1B8A5A]/25"
  }`;

/* ------------------------- Halaman ------------------------- */
export default function InputDataKeluarga() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getUser();
  const isAparatur = location.pathname.startsWith("/aparatur") || currentUser?.role === "APARATUR";
  const dusunKader = currentUser?.dusun;
  const dusunInfoLabel = dusunKader
    ? `${dusunKader.nama || "Dusun"} (${dusunKader.rw || "RW -"}) • ${dusunKader.posyandu || "Posyandu"}`
    : "Dusun Melati (RW 01) • Posyandu Melati";

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [wilayahHints, setWilayahHints] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadMasterData() {
      try {
        const [optRes, wilRes] = await Promise.all([
          api.get("/master/form-options").catch(() => null),
          api.get("/master/wilayah").catch(() => null),
        ]);

        if (!isMounted) return;

        if (optRes?.success && optRes?.data) {
          setOptions((prev) => ({
            statusSosialEkonomi:
              optRes.data.statusSosialEkonomi || prev.statusSosialEkonomi,
            pendidikan: optRes.data.pendidikan || prev.pendidikan,
            sanitasi: optRes.data.sanitasi || prev.sanitasi,
            air: optRes.data.air || prev.air,
            asiEksklusif: optRes.data.asiEksklusif || prev.asiEksklusif,
            praktikMpasi: optRes.data.praktikMpasi || prev.praktikMpasi,
            jenisKelamin: optRes.data.jenisKelamin || prev.jenisKelamin,
          }));
        }

        if (wilRes?.success && wilRes?.data) {
          const suggestions = [];
          if (Array.isArray(wilRes.data.dusun)) {
            wilRes.data.dusun.forEach((d) => {
              if (d.rw && d.nama) {
                suggestions.push(`${d.nama}, ${d.rw}`);
              } else if (d.rw) {
                suggestions.push(`Desa Sukamaju, ${d.rw}`);
              }
            });
          }
          if (suggestions.length === 0 && Array.isArray(wilRes.data.rw)) {
            wilRes.data.rw.forEach((rw) =>
              suggestions.push(`Desa Sukamaju, ${rw}`)
            );
          }
          if (suggestions.length > 0) {
            const uniqueHints = [...new Set(suggestions)];
            setWilayahHints(uniqueHints);
            setForm((prev) => ({
              ...prev,
              wilayah: prev.wilayah || uniqueHints[0],
            }));
          }
        }
      } catch {
        // Fallback tetap menggunakan opsi lokal
      }
    }

    loadMasterData();
    return () => {
      isMounted = false;
    };
  }, []);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (submitError) setSubmitError("");
  };

  const handleChange = (e) => setField(e.target.name, e.target.value);

  const handleNumericOnly = (field, maxLength) => (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (maxLength) val = val.slice(0, maxLength);
    setField(field, val);
  };

  const handlePendapatan = (e) =>
    setField("pendapatan", e.target.value.replace(/\D/g, ""));

  const validate = () => {
    const next = {};

    // 1. Validasi Bagian 1 — Identitas
    if (!form.wilayah.trim()) {
      next.wilayah = "Isi wilayah (desa dan RW tempat tinggal keluarga).";
    }

    if (!form.noKk.trim()) {
      next.noKk = "Nomor Kartu Keluarga (No. KK) 16 digit wajib diisi.";
    } else if (!/^\d{16}$/.test(form.noKk.trim())) {
      next.noKk = "Nomor Kartu Keluarga harus terdiri dari 16 digit angka.";
    }

    if (!form.kepalaKeluarga.trim()) {
      next.kepalaKeluarga = "Nama kepala keluarga wajib diisi.";
    }

    if (!form.namaIbu.trim()) {
      next.namaIbu = "Nama ibu kandung/pengasuh wajib diisi.";
    }

    if (!form.namaBalita.trim()) {
      next.namaBalita = "Nama balita wajib diisi.";
    }

    if (!form.jenisKelamin) {
      next.jenisKelamin = "Pilih jenis kelamin balita.";
    }

    if (form.usia === "") {
      next.usia = "Isi usia balita dalam bulan.";
    } else if (Number(form.usia) < 0 || Number(form.usia) > 59) {
      next.usia = "Usia balita harus antara 0 sampai 59 bulan.";
    }

    // 2. Validasi Bagian 2 — 8 Fitur Model Random Forest
    if (!form.statusSosialEkonomi) {
      next.statusSosialEkonomi = "Pilih status sosial ekonomi keluarga.";
    }

    if (form.pendapatan === "") {
      next.pendapatan = "Isi estimasi pendapatan keluarga per bulan.";
    }

    if (!form.pendidikan) {
      next.pendidikan = "Pilih pendidikan terakhir ibu.";
    }

    if (form.usiaIbu === "") {
      next.usiaIbu = "Isi usia ibu saat ini.";
    } else if (Number(form.usiaIbu) < 15 || Number(form.usiaIbu) > 55) {
      next.usiaIbu = "Usia ibu harus berada pada rentang 15 sampai 55 tahun.";
    }

    if (!form.sanitasi) {
      next.sanitasi = "Pilih kondisi fasilitas sanitasi lingkungan.";
    }

    if (!form.air) {
      next.air = "Pilih sumber air bersih utama.";
    }

    if (!form.asiEksklusif) {
      next.asiEksklusif = "Pilih status pemberian ASI eksklusif.";
    }

    if (!form.praktikMpasi) {
      next.praktikMpasi = "Pilih praktik pemberian makanan pendamping ASI (MPASI).";
    }

    // 3. Validasi Bagian 3 — Data KIA (Opsional)
    if (
      form.tinggiBadanIbu !== "" &&
      (Number(form.tinggiBadanIbu) < 100 || Number(form.tinggiBadanIbu) > 200)
    ) {
      next.tinggiBadanIbu = "Tinggi badan ibu wajar antara 100 - 200 cm.";
    }

    if (
      form.beratLahirGram !== "" &&
      (Number(form.beratLahirGram) < 500 || Number(form.beratLahirGram) > 6000)
    ) {
      next.beratLahirGram = "Berat lahir wajar antara 500 - 6000 gram.";
    }

    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Scroll ke error pertama
      const firstErrorKey = Object.keys(found)[0];
      const el = document.getElementById(firstErrorKey);
      if (el) el.focus();
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        // Bagian 1: Identitas
        wilayah: form.wilayah.trim(),
        noKk: form.noKk.trim(),
        kepalaKeluarga: form.kepalaKeluarga.trim(),
        namaIbu: form.namaIbu.trim(),
        namaBalita: form.namaBalita.trim(),
        jenisKelamin: form.jenisKelamin,
        usia: Number(form.usia),

        // Bagian 2: 8 Fitur Model Jurnal (Random Forest)
        statusSosialEkonomi: form.statusSosialEkonomi,
        pendapatan: Number(form.pendapatan),
        pendidikan: form.pendidikan,
        usiaIbu: Number(form.usiaIbu),
        sanitasi: form.sanitasi,
        air: form.air,
        asiEksklusif: form.asiEksklusif,
        praktikMpasi: form.praktikMpasi,

        // Bagian 3: Data Pendukung KIA (Opsional)
        tinggiBadanIbu:
          form.tinggiBadanIbu !== ""
            ? parseFloat(form.tinggiBadanIbu)
            : undefined,
        beratLahirGram:
          form.beratLahirGram !== ""
            ? parseInt(form.beratLahirGram, 10)
            : undefined,
      };

      const res = await api.post("/prediksi", payload);

      if (res && res.success && res.data) {
        if (isAparatur) {
          navigate(`/aparatur/hasil-prediksi/${res.data.id}`, {
            state: { hasil: res.data },
          });
        } else {
          navigate(`/kader/hasil-klasifikasi/${res.data.id}`, {
            state: { hasil: res.data },
          });
        }
      } else {
        setSubmitError(res?.message || "Gagal memproses prediksi risiko stunting.");
      }
    } catch (err) {
      if (err?.data?.errors) {
        setErrors(err.data.errors);
      }
      setSubmitError(
        err?.data?.message ||
          err?.message ||
          "Terjadi kendala jaringan saat menghubungi server prediksi."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setSubmitError("");
  };

  const renderSelect = ({ id, icon: Icon, optionsList, placeholder }) => (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <select
        id={id}
        name={id}
        value={form[id]}
        onChange={handleChange}
        className={`${inputClass(!!errors[id])} appearance-none pr-9 ${
          form[id] ? "" : "text-slate-400"
        }`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {optionsList.map((o) => (
          <option key={o} value={o} className="text-[#0F2942]">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide text-[#1B8A5A]">
          <span
            className="h-1.5 w-1.5 rounded-full bg-[#1B8A5A]"
            aria-hidden="true"
          />
          {isAparatur
            ? "MODUL APARATUR DESA • FORM PREDIKSI RISIKO"
            : "FORMULIR SKRINING LAPANGAN TERSTANDISASI"}
        </span>
        <h1 className="mt-1.5 text-2xl font-bold text-[#0F2942] sm:text-3xl">
          {isAparatur ? "Input Prediksi Risiko Baru" : "Input Data Profil Keluarga"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Isi data identitas keluarga, 8 faktor determinan sosio-ekonomi (acuan jurnal Atmadji &amp; Nugraha, 2025; Ayue et al., 2025), serta catatan Buku KIA untuk estimasi risiko stunting.
        </p>

        {!isAparatur && (
          <div className="mt-3.5 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-semibold text-emerald-800">
            <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              Wilayah Penugasan: <strong>{dusunInfoLabel}</strong> (Terkunci Otomatis pada Akun Kader)
            </span>
          </div>
        )}
      </div>

      {submitError && (
        <div
          role="alert"
          className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700"
        >
          <AlertCircle
            className="h-4 w-4 shrink-0 text-red-600"
            aria-hidden="true"
          />
          <span>{submitError}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8"
      >
        {/* ========================================================================= */}
        {/* BAGIAN 1: IDENTITAS KELUARGA & BALITA                                     */}
        {/* ========================================================================= */}
        <section aria-labelledby="section-identitas" className="space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-[#1B8A5A]">
              <Users className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2
                id="section-identitas"
                className="text-base font-bold text-[#0F2942]"
              >
                Bagian 1 — Identitas Keluarga & Balita
              </h2>
              <p className="text-[11px] text-slate-400">
                Pencatatan kependudukan keluarga, kepala rumah tangga, dan profil usia balita sasaran.
              </p>
            </div>
          </div>

          <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
            <Field
              id="wilayah"
              label="Wilayah (Desa/RW)"
              hint="Lokasi survei atau domisili RW binaan Posyandu."
              error={errors.wilayah}
            >
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="wilayah"
                  name="wilayah"
                  type="text"
                  list="wilayah-suggestions"
                  placeholder="Desa Sukamaju, RW 03"
                  value={form.wilayah}
                  onChange={handleChange}
                  className={inputClass(!!errors.wilayah)}
                />
                {wilayahHints.length > 0 && (
                  <datalist id="wilayah-suggestions">
                    {wilayahHints.map((w) => (
                      <option key={w} value={w} />
                    ))}
                  </datalist>
                )}
              </div>
            </Field>

            <Field
              id="noKk"
              label="Nomor Kartu Keluarga (No. KK)"
              hint="Format 16 digit angka sesuai dokumen Kartu Keluarga resmi."
              error={errors.noKk}
            >
              <div className="relative">
                <CreditCard className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="noKk"
                  name="noKk"
                  type="text"
                  inputMode="numeric"
                  maxLength={16}
                  placeholder="3204128492040001"
                  value={form.noKk}
                  onChange={handleNumericOnly("noKk", 16)}
                  className={`${inputClass(!!errors.noKk)} tracking-wider font-mono`}
                />
              </div>
            </Field>

            <Field
              id="kepalaKeluarga"
              label="Nama Kepala Keluarga"
              hint="Nama bapak atau kepala keluarga yang tercantum di KK."
              error={errors.kepalaKeluarga}
            >
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="kepalaKeluarga"
                  name="kepalaKeluarga"
                  type="text"
                  placeholder="Bpk. Slamet Riyadi"
                  value={form.kepalaKeluarga}
                  onChange={handleChange}
                  className={inputClass(!!errors.kepalaKeluarga)}
                />
              </div>
            </Field>

            <Field
              id="namaIbu"
              label="Nama Ibu Kandung / Pengasuh"
              hint="Nama ibu kandung yang mendampingi tumbuh kembang balita."
              error={errors.namaIbu}
            >
              <div className="relative">
                <Heart className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="namaIbu"
                  name="namaIbu"
                  type="text"
                  placeholder="Ibu Siti Aminah"
                  value={form.namaIbu}
                  onChange={handleChange}
                  className={inputClass(!!errors.namaIbu)}
                />
              </div>
            </Field>

            <Field
              id="namaBalita"
              label="Nama Balita"
              hint="Nama lengkap balita yang diperiksa di Posyandu."
              error={errors.namaBalita}
            >
              <div className="relative">
                <Baby className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="namaBalita"
                  name="namaBalita"
                  type="text"
                  placeholder="Ananda Yusuf Pratama"
                  value={form.namaBalita}
                  onChange={handleChange}
                  className={inputClass(!!errors.namaBalita)}
                />
              </div>
            </Field>

            <Field
              id="jenisKelamin"
              label="Jenis Kelamin Balita"
              hint="Pilih jenis kelamin untuk standar antropometri pertumbuhan."
              error={errors.jenisKelamin}
            >
              <div className="flex gap-4 pt-1">
                {options.jenisKelamin.map((jk) => (
                  <label
                    key={jk}
                    className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition ${
                      form.jenisKelamin === jk
                        ? "border-[#1B8A5A] bg-emerald-50/70 text-[#1B8A5A]"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="jenisKelamin"
                      value={jk}
                      checked={form.jenisKelamin === jk}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span>{jk}</span>
                  </label>
                ))}
              </div>
            </Field>

            <Field
              id="usia"
              label="Usia Balita (Bulan)"
              hint="Variabel ini dicatat sebagai profil umur balita & filter pelaporan Posyandu (rentang 0–59 bulan)."
              error={errors.usia}
              className="md:col-span-2"
            >
              <div className="relative">
                <Baby className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="usia"
                  name="usia"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={59}
                  placeholder="14"
                  value={form.usia}
                  onChange={handleChange}
                  className={`${inputClass(!!errors.usia)} pr-16`}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  Bulan
                </span>
              </div>
            </Field>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BAGIAN 2: FAKTOR SOSIO-EKONOMI & LINGKUNGAN (8 FITUR RANDOM FOREST)         */}
        {/* ========================================================================= */}
        <section aria-labelledby="section-fitur-model" className="space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2
                id="section-fitur-model"
                className="text-base font-bold text-[#0F2942]"
              >
                Bagian 2 — Faktor Sosio-Ekonomi & Lingkungan (Fitur Utama Prediksi)
              </h2>
              <p className="text-[11px] text-slate-400">
                8 variabel prediktor determinan stunting tervalidasi jurnal (Atmadji & Nugraha, 2025; Ayue et al., 2025) untuk model Random Forest.
              </p>
            </div>
          </div>

          <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
            <Field
              id="statusSosialEkonomi"
              label="Status Sosial Ekonomi Keluarga"
              hint="Kategori kepesertaan bansos PKH/BPNT atau status ketahanan ekonomi keluarga."
              error={errors.statusSosialEkonomi}
            >
              {renderSelect({
                id: "statusSosialEkonomi",
                icon: Landmark,
                optionsList: options.statusSosialEkonomi,
                placeholder: "Pilih status sosial ekonomi",
              })}
            </Field>

            <Field
              id="pendapatan"
              label="Pendapatan Keluarga per Bulan"
              hint="Estimasi akumulasi penghasilan keluarga per bulan."
              error={errors.pendapatan}
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                  Rp
                </span>
                <input
                  id="pendapatan"
                  name="pendapatan"
                  type="text"
                  inputMode="numeric"
                  placeholder="1.500.000"
                  value={
                    form.pendapatan
                      ? Number(form.pendapatan).toLocaleString("id-ID")
                      : ""
                  }
                  onChange={handlePendapatan}
                  className={`${inputClass(!!errors.pendapatan)} pr-20`}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  / bulan
                </span>
              </div>
            </Field>

            <Field
              id="pendidikan"
              label="Pendidikan Terakhir Ibu"
              hint="Tingkat literasi formal ibu yang memengaruhi pola asuh & nutrisi."
              error={errors.pendidikan}
            >
              {renderSelect({
                id: "pendidikan",
                icon: GraduationCap,
                optionsList: options.pendidikan,
                placeholder: "Pilih jenjang pendidikan",
              })}
            </Field>

            <Field
              id="usiaIbu"
              label="Usia Ibu Saat Ini (Tahun)"
              hint="Usia reproduksi sehat ibu saat mengasuh balita (rentang 15–55 tahun)."
              error={errors.usiaIbu}
            >
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="usiaIbu"
                  name="usiaIbu"
                  type="number"
                  inputMode="numeric"
                  min={15}
                  max={55}
                  placeholder="26"
                  value={form.usiaIbu}
                  onChange={handleChange}
                  className={`${inputClass(!!errors.usiaIbu)} pr-16`}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  Tahun
                </span>
              </div>
            </Field>

            <Field
              id="sanitasi"
              label="Kondisi Sanitasi Lingkungan"
              hint="Kelayakan fasilitas pembuangan tinja dan kepemilikan jamban sehat."
              error={errors.sanitasi}
            >
              {renderSelect({
                id: "sanitasi",
                icon: Bath,
                optionsList: options.sanitasi,
                placeholder: "Pilih kondisi sanitasi",
              })}
            </Field>

            <Field
              id="air"
              label="Sumber Air Bersih"
              hint="Kualitas dan perlindungan sumber air minum harian balita."
              error={errors.air}
            >
              {renderSelect({
                id: "air",
                icon: Droplets,
                optionsList: options.air,
                placeholder: "Pilih sumber air",
              })}
            </Field>

            <Field
              id="asiEksklusif"
              label="Praktik ASI Eksklusif"
              hint="Pemberian ASI saja tanpa susu formula atau cairan lain pada 0–6 bulan."
              error={errors.asiEksklusif}
              className="md:col-span-2"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {options.asiEksklusif.map((asi) => (
                  <label
                    key={asi}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-xs transition ${
                      form.asiEksklusif === asi
                        ? "border-[#1B8A5A] bg-emerald-50/70 text-[#0F2942]"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="asiEksklusif"
                      value={asi}
                      checked={form.asiEksklusif === asi}
                      onChange={handleChange}
                      className="mt-0.5 text-[#1B8A5A] focus:ring-[#1B8A5A]"
                    />
                    <span className="font-medium leading-relaxed">{asi}</span>
                  </label>
                ))}
              </div>
            </Field>

            <Field
              id="praktikMpasi"
              label="Praktik Pemberian MPASI"
              hint="Kesesuaian waktu awal MPASI dan variasi gizi seimbang (terutama protein hewani)."
              error={errors.praktikMpasi}
              className="md:col-span-2"
            >
              {renderSelect({
                id: "praktikMpasi",
                icon: Utensils,
                optionsList: options.praktikMpasi,
                placeholder: "Pilih praktik pemberian MPASI",
              })}
            </Field>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* BAGIAN 3: DATA PENDUKUNG MATERNAL & KELAHIRAN / BUKU KIA (OPSIONAL)        */}
        {/* ========================================================================= */}
        <section aria-labelledby="section-kia" className="space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h2
                id="section-kia"
                className="text-base font-bold text-[#0F2942]"
              >
                Bagian 3 — Data Pendukung Maternal & Kelahiran / Buku KIA (Opsional)
              </h2>
              <p className="text-[11px] text-slate-400">
                Pencatatan antropometri maternal & rekap awal kelahiran bayi dari Buku KIA.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3.5 text-xs text-amber-900">
            <Activity className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Catatan Kader:</strong> Bagian ini bersifat <em>opsional</em> sebagai catatan pendukung rekam Posyandu dan tidak dimasukkan ke dalam 8 fitur utama model klasifikasi Random Forest sosio-ekonomi.
            </p>
          </div>

          <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
            <Field
              id="tinggiBadanIbu"
              label="Tinggi Badan Ibu (cm)"
              hint="Deteksi risiko perawakan pendek ibu (< 145 cm)."
              error={errors.tinggiBadanIbu}
              required={false}
            >
              <div className="relative">
                <Ruler className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="tinggiBadanIbu"
                  name="tinggiBadanIbu"
                  type="number"
                  step="0.1"
                  placeholder="152.5"
                  value={form.tinggiBadanIbu}
                  onChange={handleChange}
                  className={`${inputClass(!!errors.tinggiBadanIbu)} pr-16`}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  cm
                </span>
              </div>
            </Field>

            <Field
              id="beratLahirGram"
              label="Berat Badan Lahir Anak (gram)"
              hint="Deteksi riwayat Berat Badan Lahir Rendah / BBLR (< 2500 gram)."
              error={errors.beratLahirGram}
              required={false}
            >
              <div className="relative">
                <Scale className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="beratLahirGram"
                  name="beratLahirGram"
                  type="number"
                  inputMode="numeric"
                  placeholder="3100"
                  value={form.beratLahirGram}
                  onChange={handleChange}
                  className={`${inputClass(!!errors.beratLahirGram)} pr-16`}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  gram
                </span>
              </div>
            </Field>
          </div>
        </section>

        {/* Tombol Aksi */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-[#0F2942] transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-[#1B8A5A]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Atur Ulang
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2942] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F2942]/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B8A5A] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            )}
            {isSubmitting ? "Memproses Prediksi..." : "Prediksi Risiko Stunting"}
          </button>
        </div>
      </form>
    </div>
  );
}
