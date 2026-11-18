// src/pages/aparatur/HasilPrediksi.jsx
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  Loader2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  MapPin,
  ClipboardCheck,
} from "lucide-react";
import { api } from "../../services/api";

/* ------------------------------------------------------------------ */
/* Helper normalisasi data                                            */
/* ------------------------------------------------------------------ */
const isObjectValue = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const readNestedPrimitive = (value, keys) => {
  if (value === null || value === undefined) return undefined;
  if (!isObjectValue(value)) return value;

  for (const key of keys) {
    const nested = value[key];
    if (
      nested !== undefined &&
      nested !== null &&
      !isObjectValue(nested) &&
      String(nested).trim() !== ""
    ) {
      return nested;
    }
  }

  return undefined;
};

const readAnthroValue = (value) =>
  readNestedPrimitive(value, [
    "nilai",
    "value",
    "angka",
    "tinggiBadan",
    "beratBadan",
  ]);

const readAnthroScore = (value) =>
  readNestedPrimitive(value, [
    "zScore",
    "zscore",
    "z_score",
    "score",
    "nilaiZ",
  ]);

const readAnthroStatus = (value) =>
  readNestedPrimitive(value, ["status", "label", "kategori"]);

const readTextValue = (value) =>
  readNestedPrimitive(value, [
    "label",
    "value",
    "nilai",
    "status",
    "kategori",
    "text",
    "nama",
  ]);

const toNumberOrNull = (value) => {
  const primitive = readAnthroValue(value);
  if (primitive === null || primitive === undefined || primitive === "") {
    return null;
  }
  const num = Number(primitive);
  return Number.isFinite(num) ? num : null;
};

const toTextOr = (value, fallback = "-") => {
  if (isObjectValue(value)) return fallback;
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
};

const firstDefined = (...values) =>
  values.find(
    (value) =>
      value !== undefined && value !== null && String(value).trim() !== ""
  );

function normalizeStatus(value) {
  const raw = String(value || "").toUpperCase();
  if (raw.includes("TINGGI") || raw.includes("MERAH")) return "Tinggi";
  if (raw.includes("SEDANG") || raw.includes("KUNING")) return "Sedang";
  if (raw.includes("RENDAH") || raw.includes("HIJAU")) return "Rendah";
  return "Tinggi";
}

const STATUS_BADGE = {
  Tinggi: "bg-red-50 text-red-700 ring-1 ring-red-200",
  Sedang: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Rendah: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
};

const HASIL_THEME = {
  Rendah: {
    banner:
      "border border-emerald-100 border-t-4 border-t-emerald-500 bg-gradient-to-r from-emerald-50 via-white to-teal-50",
    pill: "bg-emerald-600 text-white",
    pillLabel: "RISIKO RENDAH (AMAN)",
    priority: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    priorityLabel: "Pemantauan Rutin (Prioritas 3)",
    confidenceOuter: "border border-emerald-100 bg-white",
    confidenceBox: "border border-emerald-200 bg-emerald-50/60",
    confidenceValue: "text-emerald-600",
    confidenceLabel: "text-emerald-500",
    confidenceNote: "text-emerald-600",
    divider: "border-emerald-100",
    footerIcon: "text-emerald-600",
  },
  Sedang: {
    banner:
      "border border-amber-100 border-t-4 border-t-amber-500 bg-gradient-to-r from-amber-50 via-white to-yellow-50",
    pill: "bg-amber-500 text-white",
    pillLabel: "RISIKO SEDANG",
    priority: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    priorityLabel: "Status Prioritas Intervensi 2",
    confidenceOuter: "border border-amber-100 bg-white",
    confidenceBox: "border border-amber-200 bg-amber-50/60",
    confidenceValue: "text-amber-600",
    confidenceLabel: "text-amber-500",
    confidenceNote: "text-amber-600",
    divider: "border-amber-100",
    footerIcon: "text-amber-600",
  },
  Tinggi: {
    banner:
      "border border-red-100 border-t-4 border-t-red-500 bg-gradient-to-r from-red-50 via-white to-amber-50",
    pill: "bg-red-600 text-white",
    pillLabel: "RISIKO TINGGI (STUNTING)",
    priority: "bg-red-50 text-red-700 ring-1 ring-red-200",
    priorityLabel: "Status Prioritas Intervensi 1",
    confidenceOuter: "border border-red-100 bg-white",
    confidenceBox: "border border-red-200 bg-red-50/60",
    confidenceValue: "text-red-600",
    confidenceLabel: "text-red-500",
    confidenceNote: "text-red-600",
    divider: "border-red-100",
    footerIcon: "text-red-600",
  },
};

const ANTROPOMETRI_TONE = {
  emerald: {
    border: "border-emerald-300",
    bar: "bg-emerald-500",
    icon: "bg-emerald-50 text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700",
    zScore: "text-emerald-600",
  },
  amber: {
    border: "border-amber-300",
    bar: "bg-amber-500",
    icon: "bg-amber-50 text-amber-600",
    badge: "bg-amber-50 text-amber-700",
    zScore: "text-amber-700",
  },
  red: {
    border: "border-red-300",
    bar: "bg-red-500",
    icon: "bg-red-50 text-red-600",
    badge: "bg-red-50 text-red-700",
    zScore: "text-red-600",
  },
  neutral: {
    border: "border-slate-200",
    bar: "bg-slate-400",
    icon: "bg-slate-50 text-slate-500",
    badge: "bg-slate-100 text-slate-600",
    zScore: "text-slate-500",
  },
};

function resolveAntropometriTone(status) {
  const raw = String(status || "").trim().toLowerCase();

  if (!raw || raw === "-") return ANTROPOMETRI_TONE.neutral;
  if (raw.includes("sangat pendek") || raw.includes("gizi buruk")) {
    return ANTROPOMETRI_TONE.red;
  }
  if (
    raw.includes("pendek") ||
    raw.includes("gizi kurang") ||
    raw.includes("gizi lebih")
  ) {
    return ANTROPOMETRI_TONE.amber;
  }
  if (raw.includes("normal") || raw.includes("tinggi") || raw.includes("gizi baik")) {
    return ANTROPOMETRI_TONE.emerald;
  }

  return ANTROPOMETRI_TONE.neutral;
}

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

function resolveIntervensiVisual(item, idx = 0) {
  const isAmber =
    idx % 2 === 1 || String(item.tag || "").toLowerCase().includes("protein");
  const isFlame = String(item.tag || item.judul || "").toLowerCase().includes("pmt");
  return {
    ...item,
    id: item.id || idx + 1,
    tone: item.tone || (isAmber ? "amber" : "teal"),
    footerIcon: item.footerIcon || (isFlame ? Flame : CalendarDays),
  };
}

function ambilDaftarIntervensi(data) {
  const list = Array.isArray(data?.intervensi)
    ? data.intervensi
    : Array.isArray(data?.rekomendasi?.intervensi)
      ? data.rekomendasi.intervensi
      : [];
  return list.map(resolveIntervensiVisual);
}

function mapHasil(data = {}, meta = {}) {
  const balitaData =
    data.balita && typeof data.balita === "object" ? data.balita : {};
  const antropometriData =
    data.antropometri && typeof data.antropometri === "object"
      ? data.antropometri
      : {};
  const lingkunganData =
    data.lingkungan && typeof data.lingkungan === "object"
      ? data.lingkungan
      : {};
  const keluargaData =
    data.keluarga && typeof data.keluarga === "object" ? data.keluarga : {};

  const status = normalizeStatus(
    firstDefined(data.statusRisiko, data.risiko, data.status, meta.risiko)
  );
  const prioritasRaw = data.prioritas;
  const prioritas =
    typeof prioritasRaw === "number"
      ? prioritasRaw
      : String(prioritasRaw || "").includes("1")
        ? 1
        : 2;
  const nama =
    firstDefined(
      data.namaBalita,
      balitaData.nama,
      data.nama,
      meta.nama
    ) ?? "-";
  const nik =
    firstDefined(
      data.nikBalita,
      balitaData.nik,
      data.nik,
      data.noKk,
      meta.nik
    ) ?? "-";
  const usia =
    firstDefined(
      data.usiaBulan,
      data.usia,
      balitaData.usiaBulan,
      meta.usia
    ) ?? "-";
  const jenisKelamin =
    firstDefined(
      data.jenisKelamin,
      balitaData.jenisKelamin,
      meta.jenisKelamin
    ) ?? "-";

  const tinggiBadan = toNumberOrNull(
    firstDefined(
      readAnthroValue(data.tinggiBadan),
      data.tinggiBadanNilai,
      readAnthroValue(antropometriData.tinggiBadan),
      antropometriData.tinggiBadanNilai,
      data.tinggiBadanCm
    )
  );
  const zScoreTb = toNumberOrNull(
    firstDefined(
      readAnthroScore(data.zScoreTb),
      readAnthroScore(data.tinggiBadan),
      readAnthroScore(antropometriData.zScoreTb),
      readAnthroScore(antropometriData.tinggiBadan),
      data.zScoreTinggi
    )
  );
  const statusTb = toTextOr(
    firstDefined(
      readAnthroStatus(data.statusTb),
      readAnthroStatus(data.tinggiBadan),
      readAnthroStatus(antropometriData.statusTb),
      readAnthroStatus(antropometriData.tinggiBadan),
      data.statusTinggi
    )
  );

  const beratBadan = toNumberOrNull(
    firstDefined(
      readAnthroValue(data.beratBadan),
      data.beratBadanNilai,
      readAnthroValue(antropometriData.beratBadan),
      antropometriData.beratBadanNilai,
      data.beratBadanKg
    )
  );
  const zScoreBb = toNumberOrNull(
    firstDefined(
      readAnthroScore(data.zScoreBb),
      readAnthroScore(data.beratBadan),
      readAnthroScore(antropometriData.zScoreBb),
      readAnthroScore(antropometriData.beratBadan),
      data.zScoreBerat
    )
  );
  const statusBb = toTextOr(
    firstDefined(
      readAnthroStatus(data.statusBb),
      readAnthroStatus(data.beratBadan),
      readAnthroStatus(antropometriData.statusBb),
      readAnthroStatus(antropometriData.beratBadan),
      data.statusBerat
    )
  );

  const kondisiSanitasi = toTextOr(
    firstDefined(
      readTextValue(data.kondisiSanitasi),
      readTextValue(lingkunganData.kondisiSanitasi),
      readTextValue(lingkunganData.sanitasi),
      readTextValue(data.sanitasi),
      readTextValue(keluargaData.kondisiSanitasi),
      readTextValue(keluargaData.sanitasi)
    )
  );
  const sumberAir = toTextOr(
    firstDefined(
      readTextValue(data.sumberAir),
      readTextValue(lingkunganData.sumberAir),
      readTextValue(lingkunganData.air),
      readTextValue(data.air),
      readTextValue(keluargaData.sumberAir)
    )
  );
  const statusSosialEkonomi = toTextOr(
    firstDefined(
      readTextValue(data.statusSosialEkonomi),
      readTextValue(data.kategoriKeluarga),
      readTextValue(keluargaData.statusSosialEkonomi),
      readTextValue(keluargaData.kategoriKeluarga),
      readTextValue(lingkunganData.statusSosialEkonomi),
      readTextValue(lingkunganData.kategoriKeluarga)
    )
  );
  const dusun = toTextOr(
    firstDefined(
      readNestedPrimitive(data.dusun, ["nama"]),
      data.namaDusun,
      typeof data.dusun === "string" ? data.dusun : undefined,
      readNestedPrimitive(keluargaData.dusun, ["nama"]),
      typeof keluargaData.dusun === "string" ? keluargaData.dusun : undefined,
      readNestedPrimitive(lingkunganData.dusun, ["nama"]),
      lingkunganData.dusun,
      meta.dusun
    )
  );

  return {
    id: data.id ?? meta.id,
    status,
    judul:
      data.judul ||
      (status === "Tinggi"
        ? "Balita Terindikasi Berisiko Tinggi Stunting"
        : status === "Sedang"
          ? "Balita Berisiko Sedang Stunting"
          : "Balita Risiko Rendah Stunting"),
    deskripsi:
      data.deskripsi ||
      data.rekomendasi?.teks ||
      "Hasil analisis model prediktif berbasis faktor sosio-ekonomi dan lingkungan.",
    prioritas,
    keyakinan:
      data.keyakinan !== undefined && data.keyakinan !== null
        ? Math.round(Number(data.keyakinan))
        : null,
    ambangKritis:
      data.ambangKritis !== undefined && data.ambangKritis !== null
        ? Math.round(Number(data.ambangKritis))
        : null,
    balita: {
      nama,
      nik,
      jenisKelamin,
      usiaBulan: usia,
    },
    tinggiBadan: {
      nilai: tinggiBadan,
      zScore: zScoreTb,
      status: statusTb,
    },
    beratBadan: {
      nilai: beratBadan,
      zScore: zScoreBb,
      status: statusBb,
    },
    lingkungan: {
      dusun,
      rt: toTextOr(
        firstDefined(data.rt, meta.rt, balitaData.rt, lingkunganData.rt)
      ),
      rw: toTextOr(
        firstDefined(
          readNestedPrimitive(data.dusun, ["rw"]),
          data.rw,
          data.wilayah,
          keluargaData.rw,
          lingkunganData.rw,
          meta.rw
        )
      ),
      rtRw: `${toTextOr(
        firstDefined(data.rt, meta.rt, balitaData.rt, lingkunganData.rt)
      )} / ${toTextOr(
        firstDefined(
          readNestedPrimitive(data.dusun, ["rw"]),
          data.rw,
          data.wilayah,
          keluargaData.rw,
          lingkunganData.rw,
          meta.rw
        )
      )}`,
      noKk: toTextOr(firstDefined(data.noKk, keluargaData.noKk)),
      kepalaKeluarga: toTextOr(
        firstDefined(
          data.kepalaKeluarga,
          keluargaData.kepalaKeluarga,
          meta.kepalaKeluarga
        )
      ),
      namaIbu: toTextOr(
        firstDefined(data.namaIbu, keluargaData.namaIbu, meta.namaIbu)
      ),
      jamban: kondisiSanitasi,
      kondisiSanitasi,
      sumberAir,
      statusSosialEkonomi,
    },
    intervensi: ambilDaftarIntervensi(data),
  };
}

function mapKandidat(item = {}, sumber = "keluarga") {
  return {
    id: item.id ?? item.skriningId,
    nama: item.namaBalita || item.balita?.nama || item.nama || "-",
    dusun:
      item.dusun?.nama ||
      item.namaDusun ||
      (typeof item.dusun === "string" ? item.dusun : "-"),
    usia: item.usiaBulan ?? item.usia ?? "-",
    risiko: normalizeStatus(item.statusRisiko || item.risiko || item.status),
    sumber,
  };
}

function gabungKandidat(prioritas, keluarga) {
  const map = new Map();
  [...prioritas, ...keluarga].forEach((item) => {
    if (item.id === undefined || item.id === null || item.id === "") return;
    if (!map.has(item.id)) map.set(item.id, item);
  });
  return [...map.values()];
}

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
      {badge && (
        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          {badge}
        </span>
      )}
    </div>
  );
}

function ParamCard({ label, icon: Icon, accent, children, footer }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm ${accent.border}`}
    >
      {accent.bar && (
        <span className={`absolute inset-x-0 top-0 h-1 ${accent.bar}`} aria-hidden />
      )}
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {label}
        </p>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full ${accent.icon}`}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3">{children}</div>
      <div className="mt-4 border-t border-slate-100 pt-3">{footer}</div>
    </div>
  );
}

function EmptyHasil({ pesan, onKeDataKeluarga }) {
  return (
    <section className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
        <ClipboardCheck className="h-7 w-7" aria-hidden="true" />
      </span>
      <div className="max-w-md">
        <h2 className="text-lg font-bold text-slate-900">
          Belum Ada Data Hasil Prediksi
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
          {pesan}
        </p>
      </div>
      <button
        type="button"
        onClick={onKeDataKeluarga}
        className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900"
      >
        <Users className="h-4 w-4" aria-hidden="true" />
        Buka Data Keluarga
      </button>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Halaman                                                             */
/* ------------------------------------------------------------------ */
export default function HasilPrediksi() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [daftarPrioritas, setDaftarPrioritas] = useState([]);
  const [isLoadingDaftar, setIsLoadingDaftar] = useState(true);
  const [hasil, setHasil] = useState(() => {
    const initial = location.state?.hasil;
    return initial ? mapHasil(initial) : null;
  });
  const [isLoading, setIsLoading] = useState(
    Boolean(id && !location.state?.hasil)
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isReclassifying, setIsReclassifying] = useState(false);

  const theme = HASIL_THEME[hasil?.status] || HASIL_THEME.Tinggi;
  const tbTone = resolveAntropometriTone(hasil?.tinggiBadan?.status);
  const bbTone = resolveAntropometriTone(hasil?.beratBadan?.status);

  const muatDaftarPrioritas = useCallback(async () => {
    try {
      const [lapRes, kelRes] = await Promise.all([
        api.get("/aparatur/laporan").catch(() => null),
        api.get("/aparatur/data-keluarga").catch(() => null),
      ]);

      const prioritas = Array.isArray(lapRes?.data?.balitaPrioritas)
        ? lapRes.data.balitaPrioritas.map((item) => mapKandidat(item, "prioritas"))
        : [];
      const keluarga = Array.isArray(kelRes?.data?.keluarga)
        ? kelRes.data.keluarga.map((item) => mapKandidat(item, "keluarga"))
        : [];

      const gabungan = gabungKandidat(prioritas, keluarga);
      setDaftarPrioritas(gabungan);
      return gabungan;
    } finally {
      setIsLoadingDaftar(false);
    }
  }, []);

  useEffect(() => {
    muatDaftarPrioritas();
  }, [muatDaftarPrioritas]);

  // Jika belum ada :id di URL, pilih item riil pertama yang tersedia
  useEffect(() => {
    if (id) return;
    if (daftarPrioritas.length > 0) {
      navigate(`/aparatur/hasil-prediksi/${daftarPrioritas[0].id}`, {
        replace: true,
      });
    }
  }, [id, daftarPrioritas, navigate]);

  // Muat detail hasil prediksi berdasarkan :id
  useEffect(() => {
    let isMounted = true;

    async function loadDetail() {
      if (!id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const res = await api.get(`/aparatur/hasil-prediksi/${id}`);
        if (!isMounted) return;

        if (res?.success && res?.data) {
          const meta = daftarPrioritas.find(
            (item) => String(item.id) === String(id)
          );
          setHasil(mapHasil(res.data, meta));
        } else {
          setHasil(null);
          setErrorMessage(
            res?.message || "Data hasil prediksi tidak ditemukan."
          );
        }
      } catch (err) {
        if (!isMounted) return;
        setHasil(null);
        setErrorMessage(
          err?.data?.message ||
            err?.message ||
            "Gagal memuat detail data balita."
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDetail();

    return () => {
      isMounted = false;
    };
  }, [id, daftarPrioritas]);

  const pilihBalita = (kandidat) => {
    if (!kandidat?.id) return;
    setSuccessMessage("");
    setErrorMessage("");
    if (String(kandidat.id) === String(id)) return;
    navigate(`/aparatur/hasil-prediksi/${kandidat.id}`);
  };

  const handlePrint = () => window.print();

  const handleKlasifikasiUlang = async () => {
    const targetId = hasil?.id ?? id;
    if (!targetId) return;

    setIsReclassifying(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const res = await api.reclassifyHasilPrediksi(targetId);

      if (res && res.success === false) {
        throw new Error(res.message || "Gagal mengklasifikasi ulang.");
      }

      setSuccessMessage(
        res?.message ||
          "Klasifikasi ulang model Random Forest berhasil diperbarui."
      );

      const meta = daftarPrioritas.find(
        (item) => String(item.id) === String(targetId)
      );

      // Gunakan respons terbaru dari server, lalu sinkronkan dengan detail terkini
      let terbaru = res?.data ? mapHasil(res.data, meta) : null;

      try {
        const detailRes = await api.get(
          `/aparatur/hasil-prediksi/${targetId}`
        );
        if (detailRes?.success && detailRes?.data) {
          terbaru = mapHasil(detailRes.data, meta);
        }
      } catch {
        // Tetap gunakan respons reclassify jika detail gagal dimuat
      }

      if (terbaru) {
        setHasil({ ...terbaru, id: terbaru.id ?? targetId });
      }

      muatDaftarPrioritas();
    } catch (err) {
      setErrorMessage(
        err?.data?.message ||
          err?.message ||
          "Gagal mengklasifikasi ulang data balita."
      );
    } finally {
      setIsReclassifying(false);
    }
  };

  const selectedId = hasil?.id ?? id ?? "";
  const isMenungguData = isLoading || (!id && isLoadingDaftar);

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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            Hasil Evaluasi &amp; Klasifikasi Risiko
          </h1>
          {isMenungguData && (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Memuat data...
            </span>
          )}
        </div>
      </section>

      {/* Pemilih balita prioritas */}
      <section className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Users className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Pemilih Balita Prioritas
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Pilih balita dari data skrining Posyandu se-desa untuk melihat detail
                hasil prediksi risiko stunting.
              </p>
            </div>
          </div>

          <div className="relative w-full lg:w-80">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              aria-label="Pilih balita prioritas"
              value={selectedId}
              onChange={(e) => {
                const next = daftarPrioritas.find(
                  (item) => String(item.id) === String(e.target.value)
                );
                if (next) pilihBalita(next);
              }}
              disabled={isLoadingDaftar || daftarPrioritas.length === 0}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-9 text-xs font-semibold text-slate-700 outline-none transition focus:border-teal-600 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {isLoadingDaftar
                  ? "Memuat daftar balita..."
                  : daftarPrioritas.length === 0
                    ? "Belum ada data balita"
                    : "Pilih balita prioritas"}
              </option>
              {daftarPrioritas.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama} — {item.dusun} ({item.usia} bln)
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {isLoadingDaftar && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-teal-700" />
            Memuat daftar balita prioritas dari server...
          </div>
        )}

        {!isLoadingDaftar && daftarPrioritas.length === 0 && (
          <p className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            Belum ada data balita prioritas. Daftar akan muncul setelah kader mengirim
            hasil skrining keluarga &amp; balita.
          </p>
        )}

        {daftarPrioritas.length > 0 && (
          <div className="mt-4 grid max-h-60 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
            {daftarPrioritas.map((item) => {
              const active = String(selectedId) === String(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => pilihBalita(item)}
                  className={`flex items-start justify-between gap-2 rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-teal-600 bg-teal-50/70 ring-1 ring-teal-600/20"
                      : "border-slate-200 bg-slate-50/60 hover:border-teal-200 hover:bg-teal-50/40"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold text-slate-900">
                      {item.nama}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                      {item.dusun} • {item.usia} bln
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      STATUS_BADGE[item.risiko]
                    }`}
                  >
                    {item.risiko}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800"
        >
          <CircleCheck className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {isMenungguData && !hasil ? (
        <section className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
          <p className="text-sm font-medium text-slate-500">
            Memuat detail hasil prediksi balita...
          </p>
        </section>
      ) : !hasil ? (
        <EmptyHasil
          pesan={
            errorMessage ||
            "Database belum memiliki data hasil prediksi. Silakan pastikan data skrining balita sudah tersedia."
          }
          onKeDataKeluarga={() => navigate("/aparatur/data-keluarga")}
        />
      ) : (
        <>
          {/* Informasi sumber data */}
          <section className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-teal-200 bg-teal-50/80 p-4 text-xs text-teal-900 shadow-sm sm:flex-row sm:items-center">
            <div className="flex items-start gap-3 sm:items-center">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-white">
                <Users className="h-4 w-4" />
              </span>
              <div>
                <p className="font-bold text-teal-950">
                  Data Skrining Lapangan Kader Posyandu se-Desa
                </p>
                <p className="mt-0.5 text-slate-600">
                  Data dikumpulkan oleh kader di setiap dusun dan dianalisis menggunakan
                  mesin Random Forest terpusat.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-teal-800 ring-1 ring-teal-200">
              <Sparkles className="h-3.5 w-3.5" />
              Data Terverifikasi Sistem
            </span>
          </section>

          {/* Hasil klasifikasi */}
          <section
            className={`rounded-2xl p-6 shadow-sm ${theme.banner}`}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide ${theme.pill}`}
                  >
                    <span className="h-2 w-2 rounded-full bg-white" />
                    {theme.pillLabel}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${theme.priority}`}
                  >
                    {theme.priorityLabel}
                  </span>
                </div>
                <h2 className="mt-4 text-2xl font-bold text-slate-900">
                  {hasil.judul}
                </h2>
                <p className="mt-2 text-sm text-slate-600">{hasil.deskripsi}</p>
              </div>

              <div
                className={`flex items-center gap-4 rounded-2xl px-5 py-4 shadow-sm ${theme.confidenceOuter}`}
              >
                <div
                  className={`rounded-xl px-3 py-2 text-center ${theme.confidenceBox}`}
                >
                  <p className={`text-2xl font-bold ${theme.confidenceValue}`}>
                    {hasil.keyakinan !== null ? `${hasil.keyakinan}%` : "-"}
                  </p>
                  <p
                    className={`text-[10px] font-bold uppercase ${theme.confidenceLabel}`}
                  >
                    {hasil.status}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Tingkat Keyakinan
                  </p>
                  <p className="text-base font-bold text-slate-900">
                    Keyakinan Model:{" "}
                    {hasil.keyakinan !== null ? `${hasil.keyakinan}%` : "-"}
                  </p>
                  <p className={`text-xs font-semibold ${theme.confidenceNote}`}>
                    Ambang Kritis &gt;{" "}
                    {hasil.ambangKritis !== null ? `${hasil.ambangKritis}%` : "-"}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`mt-6 flex flex-col gap-4 border-t pt-5 md:flex-row md:items-center md:justify-between ${theme.divider}`}
            >
              <p className="flex items-center gap-2 text-xs text-slate-500">
                <CircleCheck className={`h-4 w-4 ${theme.footerIcon}`} />
                Data klasifikasi terverifikasi sistem dan siap digunakan operasional desa.
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
                  onClick={handleKlasifikasiUlang}
                  disabled={isReclassifying}
                  className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-white px-4 py-2.5 text-sm font-semibold text-teal-800 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
                >
                  {isReclassifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mengklasifikasi Ulang...
                    </>
                  ) : (
                    <>
                      <RotateCw className="h-4 w-4" />
                      Klasifikasi Ulang Model RF
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/aparatur/data-keluarga")}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                >
                  <Users className="h-4 w-4" />
                  Data Keluarga
                </button>
              </div>
            </div>
          </section>

          {/* Data balita & variabel */}
          <section className="space-y-4">
            <SectionTitle
              icon={ClipboardList}
              title="Data Balita & Variabel Pengukuran"
              badge="4 Parameter Kunci"
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <ParamCard
                label="Identitas Balita"
                icon={Smile}
                accent={{ border: "border-slate-200", icon: "bg-teal-50 text-teal-700" }}
                footer={
                  <p className="flex items-center gap-2 text-xs font-semibold text-teal-800">
                    <Cake className="h-4 w-4" />
                    {hasil.balita.jenisKelamin}, {hasil.balita.usiaBulan} Bulan
                  </p>
                }
              >
                <p className="text-lg font-bold text-slate-900">
                  {hasil.balita.nama}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  NIK: {hasil.balita.nik}
                </p>
              </ParamCard>

              <ParamCard
                label="Tinggi Badan (TB)"
                icon={MoveVertical}
                accent={{
                  border: tbTone.border,
                  bar: tbTone.bar,
                  icon: tbTone.icon,
                }}
                footer={
                  <span
                    className={`inline-block rounded-md px-2 py-1 text-xs font-bold ${tbTone.badge}`}
                  >
                    Status: {hasil.tinggiBadan.status}
                  </span>
                }
              >
                <p className="text-3xl font-bold text-slate-900">
                  {hasil.tinggiBadan.nilai !== null ? hasil.tinggiBadan.nilai : "-"}{" "}
                  <span className="text-sm font-medium text-slate-500">cm</span>
                </p>
                <p className={`mt-1 text-xs font-semibold ${tbTone.zScore}`}>
                  Z-score:{" "}
                  {hasil.tinggiBadan.zScore !== null
                    ? String(hasil.tinggiBadan.zScore).replace("-", "−")
                    : "-"}{" "}
                  SD
                </p>
              </ParamCard>

              <ParamCard
                label="Berat Badan (BB)"
                icon={Hourglass}
                accent={{
                  border: bbTone.border,
                  bar: bbTone.bar,
                  icon: bbTone.icon,
                }}
                footer={
                  <span
                    className={`inline-block rounded-md px-2 py-1 text-xs font-bold ${bbTone.badge}`}
                  >
                    Status: {hasil.beratBadan.status}
                  </span>
                }
              >
                <p className="text-3xl font-bold text-slate-900">
                  {hasil.beratBadan.nilai !== null ? hasil.beratBadan.nilai : "-"}{" "}
                  <span className="text-sm font-medium text-slate-500">kg</span>
                </p>
                <p className={`mt-1 text-xs font-semibold ${bbTone.zScore}`}>
                  Z-score:{" "}
                  {hasil.beratBadan.zScore !== null
                    ? String(hasil.beratBadan.zScore).replace("-", "−")
                    : "-"}{" "}
                  SD
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
                      {hasil.lingkungan.kondisiSanitasi}
                    </li>
                    <li className="flex items-center gap-2 text-amber-700">
                      <Droplet className="h-3.5 w-3.5" />
                      {hasil.lingkungan.sumberAir}
                    </li>
                  </ul>
                }
              >
                <p className="text-lg font-bold text-slate-900">
                  {hasil.lingkungan.dusun}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {hasil.lingkungan.rtRw} (Kat:{" "}
                  {hasil.lingkungan.statusSosialEkonomi})
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  Kel. {hasil.lingkungan.kepalaKeluarga}
                </p>
              </ParamCard>
            </div>
          </section>

          {/* Rencana intervensi */}
          <section className="space-y-4">
            <SectionTitle
              icon={Settings}
              title="Rencana Intervensi Cepat Desa"
              badge={`${hasil.intervensi.length} Tindakan`}
            />

            {hasil.intervensi.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-500 shadow-sm">
                Belum ada rencana intervensi dari server untuk balita ini.
              </p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {hasil.intervensi.map((item) => {
                  const tone = INTERVENSI_TONE[item.tone] || INTERVENSI_TONE.teal;
                  const FooterIcon = item.footerIcon || CalendarDays;
                  return (
                    <article
                      key={item.id}
                      className={`rounded-2xl border p-5 shadow-sm ${tone.card}`}
                    >
                      <div className="flex gap-4">
                        <span
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl font-bold ${tone.number}`}
                        >
                          {item.id}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <h3 className="text-lg font-bold text-slate-900">
                              {item.judul}
                            </h3>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.tag}`}
                            >
                              {item.tag}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            {item.deskripsi}
                          </p>
                          <p
                            className={`mt-3 flex items-center gap-2 text-xs font-bold ${tone.footer}`}
                          >
                            <FooterIcon className="h-4 w-4" />
                            {item.footer}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
