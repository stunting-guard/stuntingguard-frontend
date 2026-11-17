import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Baby,
  Bath,
  ChevronDown,
  Droplets,
  GraduationCap,
  HeartPulse,
  Loader2,
  MapPin,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { api } from "../../services/api";

/* ------------------------- FALLBACK DATA ------------------------- */
const DEFAULT_OPTIONS = {
  pendidikan: [
    "Tidak Sekolah",
    "SD (Sekolah Dasar / Sederajat)",
    "SMP (Sekolah Menengah Pertama)",
    "SMA (Sekolah Menengah Atas)",
    "Perguruan Tinggi",
  ],
  kek: ["Pernah KEK (Kurang Energi Kronis)", "Tidak Pernah KEK"],
  air: [
    "PDAM / Perpipaan",
    "Sumur Bor / Pompa",
    "Sumur Gali Terlindung",
    "Mata Air Tidak Terlindung",
    "Sungai / Air Permukaan",
  ],
  sanitasi: [
    "Jamban Pribadi Layak",
    "MCK Komunal",
    "Jamban Tidak Layak",
    "Tidak Ada Jamban",
  ],
};

const INITIAL_FORM = {
  wilayah: "",
  usia: "",
  pendapatan: "",
  pendidikan: "",
  kek: "",
  air: "",
  sanitasi: "",
};

/* ------------------------- Sub-komponen ------------------------- */
function Field({ id, label, hint, error, className = "", children }) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-semibold text-[#0F2942]">
          {label}
        </label>
        <span className="text-[10px] font-semibold text-[#1B8A5A]">Wajib</span>
      </div>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-[11px] text-red-600">
          {error}
        </p>
      ) : (
        <p className="mt-1.5 text-[11px] text-slate-400">{hint}</p>
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
            pendidikan: optRes.data.pendidikan || prev.pendidikan,
            kek: optRes.data.kek || prev.kek,
            air: optRes.data.air || prev.air,
            sanitasi: optRes.data.sanitasi || prev.sanitasi,
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
            wilRes.data.rw.forEach((rw) => suggestions.push(`Desa Sukamaju, ${rw}`));
          }
          if (suggestions.length > 0) {
            setWilayahHints([...new Set(suggestions)]);
          }
        }
      } catch {
        // Fallback tetap menggunakan data lokal
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

  const handlePendapatan = (e) =>
    setField("pendapatan", e.target.value.replace(/\D/g, ""));

  const validate = () => {
    const next = {};
    if (!form.wilayah.trim()) next.wilayah = "Isi desa dan RW tempat tinggal keluarga.";
    if (form.usia === "") next.usia = "Isi usia balita dalam bulan.";
    else if (Number(form.usia) < 0 || Number(form.usia) > 59)
      next.usia = "Usia balita harus antara 0 sampai 59 bulan.";
    if (form.pendapatan === "") next.pendapatan = "Isi pendapatan keluarga per bulan.";
    ["pendidikan", "kek", "air", "sanitasi"].forEach((k) => {
      if (!form[k]) next[k] = "Pilih salah satu opsi.";
    });
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        wilayah: form.wilayah.trim(),
        usia: Number(form.usia),
        pendapatan: Number(form.pendapatan),
        pendidikan: form.pendidikan,
        kek: form.kek,
        air: form.air,
        sanitasi: form.sanitasi,
      };

      const res = await api.post("/prediksi", payload);

      if (res && res.success && res.data) {
        navigate(`/kader/hasil-klasifikasi/${res.data.id}`, {
          state: { hasil: res.data },
        });
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
    <div>
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide text-[#1B8A5A]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#1B8A5A]" aria-hidden="true" />
        FORMULIR SKRINING LAPANGAN
      </span>
      <h1 className="mt-1 text-2xl font-bold text-[#0F2942] sm:text-3xl">
        Input Data Profil Keluarga
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Masukkan data sosio-ekonomi untuk klasifikasi risiko stunting dengan Random Forest.
      </p>

      {submitError && (
        <div
          role="alert"
          className="mt-4 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
          <span>{submitError}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-6 rounded-2xl bg-white p-5 shadow-lg shadow-[#0F2942]/5 sm:p-8"
      >
        <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
          <Field
            id="wilayah"
            label="Wilayah (Desa/RW)"
            hint="Lokasi kelembagaan survei Posyandu."
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
            id="usia"
            label="Usia Balita (Bulan)"
            hint="Rentang usia minimal 0 - 59 bulan."
            error={errors.usia}
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

          <Field
            id="pendapatan"
            label="Pendapatan Keluarga"
            hint="Total atau nilai penghitungan bulan di sini."
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
                value={form.pendapatan ? Number(form.pendapatan).toLocaleString("id-ID") : ""}
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
            hint="Faktor literasi kesehatan & nutrisi sampai tanggal."
            error={errors.pendidikan}
          >
            {renderSelect({
              id: "pendidikan",
              icon: GraduationCap,
              optionsList: options.pendidikan,
              placeholder: "Pilih pendidikan terakhir",
            })}
          </Field>

          <Field
            id="kek"
            label="Riwayat Kehamilan Ibu"
            hint="Catatan gizi pada masa gestasi (Ibu KIA)."
            error={errors.kek}
          >
            {renderSelect({
              id: "kek",
              icon: HeartPulse,
              optionsList: options.kek,
              placeholder: "Pilih riwayat kehamilan",
            })}
          </Field>

          <Field
            id="air"
            label="Sumber Air Bersih"
            hint="Aksesibilitas air minum dan kebutuhan sanitasi."
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
            id="sanitasi"
            label="Kondisi Sanitasi"
            hint="Kelembaban fungsi wajib dan kebiasaan jamban keluarga."
            error={errors.sanitasi}
            className="md:col-span-2"
          >
            {renderSelect({
              id: "sanitasi",
              icon: Bath,
              optionsList: options.sanitasi,
              placeholder: "Pilih kondisi sanitasi",
            })}
          </Field>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
            {isSubmitting ? "Memproses..." : "Prediksi Risiko"}
          </button>
        </div>
      </form>
    </div>
  );
}
