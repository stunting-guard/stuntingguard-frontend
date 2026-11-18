import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Baby,
  Building2,
  Check,
  CircleAlert,
  CircleCheck,
  Compass,
  HeartPulse,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  ShieldAlert,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import Modal from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";
import StatCard from "../../components/ui/StatCard";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import FilterSelect from "../../components/ui/FilterSelect";
import TableFooter from "../../components/ui/TableFooter";
import EmptyTableRow from "../../components/ui/EmptyTableRow";
import Field, { inputClass } from "../../components/ui/Field";
import useToast from "../../hooks/useToast";
import { api } from "../../services/api";

const PAGE_SIZE = 6;

const ZONA_META = {
  MERAH: {
    label: "Zona Merah",
    badge: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-600",
    desc: "Risiko Tinggi / Prioritas Khusus",
  },
  KUNING: {
    label: "Zona Kuning",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    dot: "bg-amber-500",
    desc: "Risiko Sedang / Pemantauan Intensif",
  },
  HIJAU: {
    label: "Zona Hijau",
    badge: "border-teal-200 bg-[#E7F5F0] text-teal-800",
    dot: "bg-teal-600",
    desc: "Kondisi Terpantau Baik & Aman",
  },
};

const ZONA_OPTIONS = [
  { value: "HIJAU", label: "Zona Hijau (Risiko Rendah / Aman)" },
  { value: "KUNING", label: "Zona Kuning (Risiko Sedang / Waspada)" },
  { value: "MERAH", label: "Zona Merah (Risiko Tinggi / Prioritas)" },
];

const FILTER_ZONA = [
  { value: "Semua", label: "Semua Zona Risiko" },
  { value: "MERAH", label: "Zona Merah (Prioritas Tinggi)" },
  { value: "KUNING", label: "Zona Kuning (Waspada)" },
  { value: "HIJAU", label: "Zona Hijau (Terkendali)" },
];

const EMPTY_FORM = {
  nama: "",
  namaSingkat: "",
  rw: "",
  posyandu: "",
  kecamatan: "Kecamatan Sukamaju",
  kapasitasBalita: 100,
  zona: "HIJAU",
  assignedUserIds: [],
};

const fmt = new Intl.NumberFormat("id-ID");

const inputFieldClass = (hasError) =>
  `${inputClass} ${
    hasError ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100" : ""
  }`;

function SortIcon({ active, direction }) {
  if (!active) return <ArrowUpDown className="h-3 w-3 shrink-0 text-slate-400" aria-hidden="true" />;
  if (direction === "asc") return <ArrowUp className="h-3 w-3 shrink-0 text-teal-700" aria-hidden="true" />;
  return <ArrowDown className="h-3 w-3 shrink-0 text-teal-700" aria-hidden="true" />;
}

export default function KelolaDusun() {
  const [dusunList, setDusunList] = useState([]);
  const [availableKader, setAvailableKader] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [query, setQuery] = useState("");
  const [zonaFilter, setZonaFilter] = useState("Semua");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  // Form Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Delete Modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast, showToast } = useToast();

  // 1. Fetch available Kader for assignments
  const fetchAvailableKader = useCallback(async () => {
    try {
      const res = await api.get("/admin/users", { role: "Kader", limit: 100 });
      if (res?.success && Array.isArray(res?.data?.items)) {
        setAvailableKader(res.data.items);
      }
    } catch {
      // Non-fatal fallback
    }
  }, []);

  // 2. Fetch Dusun list from backend
  const fetchDusun = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const res = await api.get("/admin/dusun");
      if (res?.success && Array.isArray(res.data)) {
        setDusunList(res.data);
      } else {
        throw new Error(res?.message || "Gagal memuat daftar wilayah dusun.");
      }
    } catch (err) {
      setDusunList([]);
      setLoadError(err?.data?.message || err?.message || "Gagal memuat data wilayah dusun.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDusun();
    fetchAvailableKader();
  }, [fetchDusun, fetchAvailableKader]);

  // Ringkasan metrik statistik
  const ringkasan = useMemo(() => {
    const totalDusun = dusunList.length;
    let zonaMerah = 0;
    let totalBalita = 0;
    const kaderSet = new Set();

    dusunList.forEach((d) => {
      if (d.zona === "MERAH") zonaMerah += 1;
      totalBalita += d.totalBalitaTerdaftar || d.jumlahSkrining || 0;
      if (Array.isArray(d.kaderTerdaftar)) {
        d.kaderTerdaftar.forEach((k) => kaderSet.add(k.id));
      }
    });

    return {
      totalDusun,
      zonaMerah,
      totalBalita,
      totalKader: kaderSet.size,
    };
  }, [dusunList]);

  // Filter & Search
  const filteredList = useMemo(() => {
    let result = [...dusunList];

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (d) =>
          d.nama?.toLowerCase().includes(q) ||
          d.namaSingkat?.toLowerCase().includes(q) ||
          d.rw?.toLowerCase().includes(q) ||
          d.posyandu?.toLowerCase().includes(q) ||
          d.kecamatan?.toLowerCase().includes(q)
      );
    }

    if (zonaFilter !== "Semua") {
      result = result.filter((d) => d.zona === zonaFilter);
    }

    if (sortKey) {
      result.sort((a, b) => {
        let valA = a[sortKey];
        let valB = b[sortKey];
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();
        if (valA < valB) return sortDir === "asc" ? -1 : 1;
        if (valA > valB) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [dusunList, query, zonaFilter, sortKey, sortDir]);

  // Pagination
  const totalCount = filteredList.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedList = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredList.slice(start, start + PAGE_SIZE);
  }, [filteredList, currentPage]);

  const from = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, totalCount);

  const resetFilter = () => {
    setQuery("");
    setZonaFilter("Semua");
    setSortKey(null);
    setSortDir("asc");
    setPage(1);
  };

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  // ------------------------- Handlers Form -------------------------
  const bukaTambah = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setFormOpen(true);
  };

  const bukaEdit = (dusun) => {
    setEditing(dusun);
    const assignedIds = Array.isArray(dusun.kaderTerdaftar)
      ? dusun.kaderTerdaftar.map((k) => k.id)
      : [];

    setForm({
      nama: dusun.nama || "",
      namaSingkat: dusun.namaSingkat || "",
      rw: dusun.rw || "",
      posyandu: dusun.posyandu || "",
      kecamatan: dusun.kecamatan || "Kecamatan Sukamaju",
      kapasitasBalita: dusun.kapasitasBalita || 100,
      zona: dusun.zona || "HIJAU",
      assignedUserIds: assignedIds,
    });
    setErrors({});
    setFormOpen(true);
  };

  const ubahField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const toggleKaderAssignment = (userId) => {
    setForm((prev) => {
      const exists = prev.assignedUserIds.includes(userId);
      const nextIds = exists
        ? prev.assignedUserIds.filter((id) => id !== userId)
        : [...prev.assignedUserIds, userId];
      return { ...prev, assignedUserIds: nextIds };
    });
  };

  const validasiForm = () => {
    const nextErrors = {};
    if (!form.nama.trim()) nextErrors.nama = "Nama dusun wajib diisi.";
    if (!form.rw.trim()) nextErrors.rw = "Nomor RW wajib diisi (contoh: RW 01).";
    if (form.kapasitasBalita && Number(form.kapasitasBalita) <= 0) {
      nextErrors.kapasitasBalita = "Kapasitas balita harus lebih dari 0.";
    }
    return nextErrors;
  };

  const simpanForm = async (e) => {
    e.preventDefault();
    const nextErrors = validasiForm();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        nama: form.nama.trim(),
        namaSingkat: form.namaSingkat.trim() || undefined,
        rw: form.rw.trim(),
        posyandu: form.posyandu.trim() || undefined,
        kecamatan: form.kecamatan.trim() || "Kecamatan Sukamaju",
        kapasitasBalita: Number(form.kapasitasBalita) || 100,
        zona: form.zona,
        assignedUserIds: form.assignedUserIds,
      };

      if (editing) {
        const res = await api.put(`/admin/dusun/${editing.id}`, payload);
        if (res?.success) {
          showToast(`Dusun ${form.nama} berhasil diperbarui.`);
          setFormOpen(false);
          fetchDusun();
          fetchAvailableKader();
        } else {
          showToast(res?.message || "Gagal memperbarui dusun.");
        }
      } else {
        const res = await api.post("/admin/dusun", payload);
        if (res?.success) {
          showToast(`Dusun ${form.nama} berhasil ditambahkan.`);
          setFormOpen(false);
          fetchDusun();
          fetchAvailableKader();
        } else {
          showToast(res?.message || "Gagal menambahkan dusun.");
        }
      }
    } catch (err) {
      if (err?.data?.errors) {
        setErrors(err.data.errors);
      }
      showToast(err?.data?.message || err?.message || "Terjadi kesalahan saat menyimpan data dusun.");
    } finally {
      setIsSaving(false);
    }
  };

  // ------------------------- Handlers Hapus -------------------------
  const konfirmasiHapus = (dusun) => setDeleteTarget(dusun);

  const eksekusiHapus = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/admin/dusun/${deleteTarget.id}`);
      if (res?.success) {
        showToast(`Dusun ${deleteTarget.nama} berhasil dihapus.`);
        setDeleteTarget(null);
        fetchDusun();
        fetchAvailableKader();
      } else {
        showToast(res?.message || "Gagal menghapus dusun.");
      }
    } catch (err) {
      showToast(err?.data?.message || err?.message || "Gagal menghapus dusun.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <Toast message={toast} />

      {/* Header Halaman */}
      <PageHeader
        chip="Master Wilayah & Organisasi Lapangan"
        title="Kelola Dusun & Penugasan Kader"
        description="Pengaturan wilayah administratif dusun/RW desa, kapasitas balita sasaran posyandu, zonasi risiko, dan penugasan kader aktif."
        actions={
          <button
            type="button"
            onClick={bukaTambah}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tambah Dusun
          </button>
        }
      />

      {/* Ringkasan Metrik Statistik */}
      <section aria-label="Ringkasan Dusun" className="grid gap-4 md:grid-cols-4 lg:gap-5">
        <StatCard
          label="Total Wilayah Dusun"
          value={isLoading ? "..." : fmt.format(ringkasan.totalDusun)}
          caption="Wilayah Terdaftar"
          icon={<Compass className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />}
          footerBorder
          footer={
            <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-teal-800">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              Desa Sukamaju
            </span>
          }
        />

        <StatCard
          label="Dusun Zona Merah"
          value={isLoading ? "..." : fmt.format(ringkasan.zonaMerah)}
          caption="Prioritas Intervensi"
          icon={<ShieldAlert className="h-5 w-5 text-red-600" strokeWidth={1.8} aria-hidden="true" />}
          iconWrapClassName="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600"
          footerBorder
          footer={
            <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
              <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />
              {ringkasan.zonaMerah > 0 ? "Perlu Akselerasi PMT" : "Nihil Zona Merah"}
            </span>
          }
        />

        <StatCard
          label="Total Balita Skrining"
          value={isLoading ? "..." : fmt.format(ringkasan.totalBalita)}
          caption="Data Balita Riil"
          icon={<Baby className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />}
          footerBorder
          footer={
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#E7F5F0] px-2.5 py-1 text-[11px] font-semibold text-teal-800">
              <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Tersebar di Seluruh RW
            </span>
          }
        />

        <StatCard
          label="Kader Terpetakan"
          value={isLoading ? "..." : fmt.format(ringkasan.totalKader)}
          caption="Kader Ditugaskan"
          icon={<UserCheck className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />}
          footerBorder
          footer={
            <span className="inline-flex items-center gap-1.5 rounded-md bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-800">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              Posyandu Lapangan
            </span>
          }
        />
      </section>

      {/* Filter & Pencarian */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-md">
            <SearchInput
              value={query}
              onChange={(val) => {
                setQuery(val);
                setPage(1);
              }}
              placeholder="Cari nama dusun, RW, atau posyandu..."
              aria-label="Cari dusun"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-full sm:w-56">
              <FilterSelect
                label="Filter Zonasi Risiko"
                value={zonaFilter}
                onChange={(val) => {
                  setZonaFilter(val);
                  setPage(1);
                }}
                options={FILTER_ZONA}
                icon={ShieldAlert}
              />
            </div>

            {(query || zonaFilter !== "Semua" || sortKey) && (
              <button
                type="button"
                onClick={resetFilter}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-teal-700"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Tabel Dusun */}
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold text-slate-600">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => toggleSort("nama")}
                      className="inline-flex items-center gap-1.5 font-semibold transition hover:text-teal-800"
                    >
                      Nama Dusun &amp; RW
                      <SortIcon active={sortKey === "nama"} direction={sortDir} />
                    </button>
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    Posyandu &amp; Wilayah
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-center">
                    Kapasitas / Skrining
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-center">
                    Zonasi Risiko
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Kader Penanggung Jawab
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-slate-500">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-teal-700" />
                      <p className="mt-2">Memuat daftar wilayah dusun...</p>
                    </td>
                  </tr>
                ) : loadError ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-xs text-red-700">
                      <AlertTriangle className="mx-auto h-6 w-6" aria-hidden="true" />
                      <p className="mt-2">{loadError}</p>
                      <button
                        type="button"
                        onClick={fetchDusun}
                        className="mt-3 rounded-lg border border-red-200 px-3 py-1.5 font-semibold hover:bg-red-50"
                      >
                        Coba lagi
                      </button>
                    </td>
                  </tr>
                ) : pagedList.length === 0 ? (
                  <EmptyTableRow
                    colSpan={6}
                    title="Tidak ada wilayah dusun"
                    description="Tidak ada dusun yang cocok dengan kata kunci pencarian atau filter zonasi."
                  />
                ) : (
                  pagedList.map((d) => {
                    const zonaMeta = ZONA_META[d.zona] || ZONA_META.HIJAU;
                    const skriningCount = d.totalBalitaTerdaftar ?? d.jumlahSkrining ?? 0;
                    const kaderList = Array.isArray(d.kaderTerdaftar) ? d.kaderTerdaftar : [];

                    return (
                      <tr key={d.id} className="transition hover:bg-slate-50/60">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
                              <MapPin className="h-4 w-4" aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-[#0F2942]">
                                {d.nama}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {d.rw} • Singkatan: {d.namaSingkat || "-"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-slate-600">
                          <p className="font-semibold text-slate-800">{d.posyandu || "-"}</p>
                          <p className="text-[11px] text-slate-400">{d.kecamatan || "Kecamatan Sukamaju"}</p>
                        </td>
                        <td className="px-3 py-4 text-center">
                          <p className="font-bold text-[#0F2942]">
                            {skriningCount} / {d.kapasitasBalita || 100}
                          </p>
                          <p className="text-[10px] text-slate-400">Balita Sasaran</p>
                        </td>
                        <td className="px-3 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${zonaMeta.badge}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${zonaMeta.dot}`}
                              aria-hidden="true"
                            />
                            {d.zona}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {kaderList.length === 0 ? (
                            <span className="text-[11px] italic text-slate-400">
                              Belum ada penugasan kader
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {kaderList.map((k) => (
                                <span
                                  key={k.id}
                                  className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                                >
                                  <UserCheck className="h-3 w-3 text-teal-700" />
                                  {k.nama || k.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => bukaEdit(d)}
                              title="Edit Dusun & Penugasan"
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-teal-800"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => konfirmasiHapus(d)}
                              title="Hapus Dusun"
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <TableFooter
            summary={`Menampilkan ${from}–${to} dari ${fmt.format(totalCount)} dusun`}
            page={currentPage}
            totalPages={totalPages}
            onChange={(newPage) => setPage(Math.min(Math.max(newPage, 1), totalPages))}
          />
        </div>
      </section>

      {/* Modal Tambah / Edit Dusun */}
      <Modal
        open={formOpen}
        onClose={() => !isSaving && setFormOpen(false)}
        title={editing ? "Perbarui Data Dusun & Penugasan" : "Tambah Dusun Baru"}
        description="Lengkapi nama wilayah administratif, data posyandu, zonasi risiko, serta penugasan kader aktif."
      >
        <form onSubmit={simpanForm} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="nama" label="Nama Dusun" error={errors.nama} required>
              <input
                id="nama"
                type="text"
                value={form.nama}
                onChange={(e) => ubahField("nama", e.target.value)}
                placeholder="Contoh: Dusun Melati"
                className={inputFieldClass(!!errors.nama)}
              />
            </Field>

            <Field id="namaSingkat" label="Nama Singkat / Label">
              <input
                id="namaSingkat"
                type="text"
                value={form.namaSingkat}
                onChange={(e) => ubahField("namaSingkat", e.target.value)}
                placeholder="Contoh: Melati"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="rw" label="Nomor RW" error={errors.rw} required>
              <input
                id="rw"
                type="text"
                value={form.rw}
                onChange={(e) => ubahField("rw", e.target.value)}
                placeholder="Contoh: RW 01"
                className={inputFieldClass(!!errors.rw)}
              />
            </Field>

            <Field id="posyandu" label="Nama Posyandu">
              <input
                id="posyandu"
                type="text"
                value={form.posyandu}
                onChange={(e) => ubahField("posyandu", e.target.value)}
                placeholder="Contoh: Posyandu Melati 1"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="kecamatan" label="Kecamatan">
              <input
                id="kecamatan"
                type="text"
                value={form.kecamatan}
                onChange={(e) => ubahField("kecamatan", e.target.value)}
                placeholder="Kecamatan Sukamaju"
                className={inputClass}
              />
            </Field>

            <Field
              id="kapasitasBalita"
              label="Kapasitas Balita"
              error={errors.kapasitasBalita}
            >
              <input
                id="kapasitasBalita"
                type="number"
                min="1"
                value={form.kapasitasBalita}
                onChange={(e) => ubahField("kapasitasBalita", e.target.value)}
                placeholder="100"
                className={inputFieldClass(!!errors.kapasitasBalita)}
              />
            </Field>

            <Field id="zona" label="Zonasi Risiko Awal">
              <select
                id="zona"
                value={form.zona}
                onChange={(e) => ubahField("zona", e.target.value)}
                className={inputClass}
              >
                {ZONA_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Penugasan Kader */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F2942]">
                Penugasan Kader Posyandu
              </span>
              <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                {form.assignedUserIds.length} Terpilih
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Pilih kader yang ditugaskan untuk melakukan skrining dan pemantauan di wilayah dusun ini.
            </p>

            <div className="mt-3 max-h-40 space-y-2 overflow-y-auto pr-1">
              {availableKader.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  Tidak ada kader dengan role KADER yang ditemukan di sistem.
                </p>
              ) : (
                availableKader.map((k) => {
                  const isChecked = form.assignedUserIds.includes(k.id);
                  return (
                    <label
                      key={k.id}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border p-2 text-xs transition ${
                        isChecked
                          ? "border-teal-300 bg-teal-50/50 text-[#0F2942]"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleKaderAssignment(k.id)}
                          className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
                        />
                        <div className="truncate">
                          <p className="font-semibold truncate">{k.nama || k.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{k.email}</p>
                        </div>
                      </div>
                      {k.dusun && k.dusun.id !== editing?.id && (
                        <span className="text-[10px] text-slate-400 shrink-0">
                          Saat ini: Dusun {k.dusun.nama}
                        </span>
                      )}
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              disabled={isSaving}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-teal-700 disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Simpan Perubahan" : "Tambah Dusun"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal
        open={!!deleteTarget}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        title="Hapus Wilayah Dusun"
        description="Tindakan ini tidak dapat dibatalkan. Pastikan tidak ada data skrining yang terhubung."
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Apakah Anda yakin ingin menghapus wilayah{" "}
            <strong className="text-[#0F2942]">
              {deleteTarget?.nama} ({deleteTarget?.rw})
            </strong>
            ?
          </p>

          {(deleteTarget?.totalBalitaTerdaftar > 0 || deleteTarget?.jumlahSkrining > 0) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 flex items-start gap-2">
              <CircleAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                Peringatan: Wilayah ini memiliki{" "}
                <strong>
                  {deleteTarget?.totalBalitaTerdaftar || deleteTarget?.jumlahSkrining} data skrining balita
                </strong>
                . Backend akan memblokir penghapusan dusun yang masih memiliki data skrining.
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-teal-700 disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={eksekusiHapus}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Hapus Dusun
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
