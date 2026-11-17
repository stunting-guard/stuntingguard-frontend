import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Building2,
  Check,
  ChevronDown,
  CircleCheck,
  ClipboardCheck,
  Copy,
  Crown,
  KeyRound,
  Landmark,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import Modal, { ModalClose } from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";
import StatCard from "../../components/ui/StatCard";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import FilterSelect from "../../components/ui/FilterSelect";
import TableFooter from "../../components/ui/TableFooter";
import EmptyTableRow from "../../components/ui/EmptyTableRow";
import Field, { inputClass } from "../../components/ui/Field";
import useToast from "../../hooks/useToast";
import useSafeTimeout from "../../hooks/useSafeTimeout";
import { api } from "../../services/api";

const PAGE_SIZE = 6;

const ROLE_META = {
  Kader: {
    label: "Kader Posyandu",
    badge: "bg-teal-50 text-teal-800",
    icon: Building2,
    placeholder: "Kader Posyandu / Bidan",
  },
  Aparatur: {
    label: "Aparatur Desa",
    badge: "bg-slate-100 text-slate-700",
    icon: Landmark,
    placeholder: "Aparatur Desa / Dinkes",
  },
  Admin: {
    label: "Admin / Peneliti",
    badge: "bg-teal-800 text-white",
    icon: KeyRound,
    placeholder: "Admin / Mahasiswa",
  },
};

const ROLE_OPTIONS = ["Kader", "Aparatur", "Admin"];

const FILTER_ROLE = [
  { value: "Semua", label: "Semua Peran (Kader, Desa, Admin)" },
  { value: "Kader", label: "Kader Posyandu" },
  { value: "Aparatur", label: "Aparatur Desa" },
  { value: "Admin", label: "Admin / Peneliti" },
];

const FILTER_STATUS = [
  { value: "Semua", label: "Semua Status (Aktif & Nonaktif)" },
  { value: "Aktif", label: "Aktif" },
  { value: "Nonaktif", label: "Nonaktif" },
];

const EMPTY_FORM = {
  nama: "",
  email: "",
  username: "",
  password: "",
  peran: "Kader",
  peranDetail: "",
  wilayah: "",
  dusunId: "",
  status: "Aktif",
};

const AVATAR_TONES = [
  "bg-teal-100 text-teal-800",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-700",
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
];

const fmt = new Intl.NumberFormat("id-ID");
const satuDesimal = (n) => n.toFixed(1).replace(".", ",");

function inisial(nama = "") {
  return nama
    .split(",")[0]
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((kata) => kata[0])
    .join("")
    .toUpperCase() || "SG";
}

function SortIcon({ active, direction }) {
  if (!active) return <ArrowUpDown className="h-3 w-3 shrink-0 text-slate-400" aria-hidden="true" />;
  if (direction === "asc") return <ArrowUp className="h-3 w-3 shrink-0 text-teal-700" aria-hidden="true" />;
  return <ArrowDown className="h-3 w-3 shrink-0 text-teal-700" aria-hidden="true" />;
}

export default function KelolaPengguna() {
  const [users, setUsers] = useState([]);
  const [dusunOptions, setDusunOptions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [resetTarget, setResetTarget] = useState(null);
  const [resetState, setResetState] = useState({ loading: false, password: "", copied: false });

  const { toast, showToast } = useToast();
  const schedule = useSafeTimeout();

  // Muat opsi wilayah / dusun untuk penugasan kader
  useEffect(() => {
    let isMounted = true;
    async function loadMasterWilayah() {
      try {
        const res = await api.get("/master/wilayah");
        if (isMounted && res?.success && Array.isArray(res?.data?.dusun)) {
          setDusunOptions(res.data.dusun);
        }
      } catch {
        // Fallback default
      }
    }
    loadMasterWilayah();
    return () => {
      isMounted = false;
    };
  }, []);

  // Muat data pengguna dari backend
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = {
        search: query.trim() || undefined,
        role: roleFilter !== "Semua" ? roleFilter : undefined,
        page,
        limit: PAGE_SIZE,
        sortKey: sortKey || undefined,
        sortDir: sortDir || undefined,
      };

      const res = await api.get("/admin/users", params);

      if (res?.success && res?.data) {
        setUsers(res.data.items || []);
        if (res.data.meta) {
          setTotalCount(res.data.meta.total || 0);
          setTotalPages(res.data.meta.totalPages || 1);
        }
      }
    } catch (err) {
      showToast(err?.data?.message || err?.message || "Gagal memuat data pengguna.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [query, roleFilter, page, sortKey, sortDir]);

  /* ------------------------- Filter, sort, pagination ------------------------- */
  const from = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, totalCount);

  const ringkasan = useMemo(() => {
    const total = totalCount || users.length;
    const aktif = users.filter((u) => u.status === "Aktif").length;
    const peran = ROLE_OPTIONS.reduce(
      (acc, role) => ({
        ...acc,
        [role]: users.filter((u) => u.peran === role || u.role === role.toUpperCase()).length,
      }),
      {}
    );
    const terbesar = ROLE_OPTIONS.reduce(
      (a, b) => ((peran[b] || 0) > (peran[a] || 0) ? b : a),
      ROLE_OPTIONS[0]
    );
    const persen = total === 0 ? 0 : ((peran[terbesar] || 0) / total) * 100;
    return { total, aktif, nonaktif: total - aktif, peran, terbesar, persen };
  }, [users, totalCount]);

  const resetFilter = () => {
    setQuery("");
    setRoleFilter("Semua");
    setStatusFilter("Semua");
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

  const goTo = (target) => setPage(Math.min(Math.max(target, 1), totalPages));

  const ariaSort = (key) =>
    sortKey === key ? (sortDir === "asc" ? "ascending" : "descending") : "none";

  /* ------------------------- Aksi form ------------------------- */
  const bukaTambah = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setFormOpen(true);
  };

  const bukaEdit = (user) => {
    setEditing(user);
    setForm({
      nama: user.nama || user.name || "",
      email: user.email || "",
      username: user.username || "",
      password: "",
      peran: user.peran || "Kader",
      peranDetail: user.peranDetail || "",
      wilayah: user.wilayah || "",
      dusunId: user.dusunId ? String(user.dusunId) : "",
      status: user.status || "Aktif",
    });
    setErrors({});
    setFormOpen(true);
  };

  const ubahField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validasiForm = () => {
    const next = {};
    if (!form.nama.trim()) next.nama = "Nama lengkap wajib diisi.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Masukkan alamat email yang valid.";
    }
    return next;
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
        name: form.nama.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.peran.toUpperCase(),
        dusunId: form.dusunId ? Number(form.dusunId) : undefined,
        password: form.password ? form.password.trim() : undefined,
      };

      if (editing) {
        const res = await api.put(`/admin/users/${editing.id}`, payload);
        if (res?.success) {
          showToast(`Akun ${form.nama} berhasil diperbarui.`);
          setFormOpen(false);
          fetchUsers();
        } else {
          showToast(res?.message || "Gagal memperbarui pengguna.");
        }
      } else {
        const res = await api.post("/admin/users", payload);
        if (res?.success) {
          const tempPass = res.data?.temporaryPassword;
          showToast(
            `Pengguna ${form.nama} berhasil ditambahkan.` +
              (tempPass ? ` Sandi awal: ${tempPass}` : "")
          );
          setFormOpen(false);
          fetchUsers();
        } else {
          showToast(res?.message || "Gagal membuat pengguna.");
        }
      }
    } catch (err) {
      if (err?.data?.errors) {
        setErrors(err.data.errors);
      }
      showToast(err?.data?.message || err?.message || "Terjadi kesalahan saat menyimpan akun.");
    } finally {
      setIsSaving(false);
    }
  };

  /* ------------------------- Aksi hapus ------------------------- */
  const konfirmasiHapus = (user) => setDeleteTarget(user);

  const eksekusiHapus = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/admin/users/${deleteTarget.id}`);
      if (res?.success) {
        showToast(`Akun ${deleteTarget.nama || deleteTarget.name} telah dihapus.`);
        setDeleteTarget(null);
        fetchUsers();
      } else {
        showToast(res?.message || "Gagal menghapus pengguna.");
      }
    } catch (err) {
      showToast(err?.data?.message || err?.message || "Gagal menghapus pengguna.");
    } finally {
      setIsDeleting(false);
    }
  };

  /* ------------------------- Aksi reset sandi ------------------------- */
  const konfirmasiReset = (user) => {
    setResetTarget(user);
    setResetState({ loading: false, password: "", copied: false });
  };

  const eksekusiReset = async () => {
    if (!resetTarget) return;
    setResetState({ loading: true, password: "", copied: false });

    try {
      const res = await api.patch(`/admin/users/${resetTarget.id}/reset-password`, {});
      if (res?.success && res?.data) {
        const pass = res.data.temporaryPassword || res.data.password || "SG-Temp123";
        setResetState({ loading: false, password: pass, copied: false });
        showToast(`Kata sandi akun ${resetTarget.nama} berhasil direset.`);
      } else {
        setResetState({ loading: false, password: "", copied: false });
        showToast(res?.message || "Gagal mereset kata sandi.");
      }
    } catch (err) {
      setResetState({ loading: false, password: "", copied: false });
      showToast(err?.data?.message || err?.message || "Gagal mereset kata sandi.");
    }
  };

  const salinSandi = async () => {
    if (!resetState.password) return;
    try {
      await navigator.clipboard.writeText(resetState.password);
      setResetState((prev) => ({ ...prev, copied: true }));
      schedule(() => setResetState((prev) => ({ ...prev, copied: false })), 2000);
      showToast("Sandi sementara berhasil disalin ke papan klip.");
    } catch {
      showToast("Gagal menyalin sandi.");
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <Toast message={toast} />

      {/* Header halaman */}
      <PageHeader
        chip="Panel Kendali Akun Pengguna"
        title="Kelola Pengguna Sistem"
        description="Pengaturan hak akses role-based access control (RBAC) untuk Kader Posyandu, Aparatur Desa, dan Admin sistem."
        action={
          <button
            type="button"
            onClick={bukaTambah}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Tambah Pengguna
          </button>
        }
      />

      {/* Ringkasan metrik */}
      <section aria-label="Ringkasan pengguna" className="grid gap-4 md:grid-cols-3 lg:gap-5">
        <StatCard
          label="Total Pengguna Terdaftar"
          value={fmt.format(ringkasan.total)}
          caption="Akun Sistem"
          icon={<Users className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />}
          footerBorder
          footer={
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#E7F5F0] px-2.5 py-1 text-[11px] font-semibold text-teal-800">
                <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {ringkasan.aktif} Akun Aktif
              </span>
              {ringkasan.nonaktif > 0 && (
                <span className="text-[11px] text-slate-500">
                  {ringkasan.nonaktif} Nonaktif
                </span>
              )}
            </div>
          }
        />

        <StatCard
          label="Distribusi Peran Terbanyak"
          value={ROLE_META[ringkasan.terbesar]?.label || "Kader Posyandu"}
          caption={`${satuDesimal(ringkasan.persen)}% Dari Total Akun`}
          icon={<Crown className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />}
        />

        <StatCard
          label="Hak Akses Berjenjang"
          value="3 Level"
          caption="Role-Based Security"
          icon={<ShieldCheck className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />}
          footerBorder
          footer={
            <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-teal-800">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Role: Admin, Aparatur, Kader
            </span>
          }
        />
      </section>

      {/* Filter & pencarian */}
      <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-md">
            <SearchInput
              value={query}
              onChange={(val) => {
                setQuery(val);
                setPage(1);
              }}
              placeholder="Cari nama, email, username, atau wilayah tugas..."
              aria-label="Cari pengguna"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-full sm:w-56">
              <FilterSelect
                label="Filter Peran"
                value={roleFilter}
                onChange={(val) => {
                  setRoleFilter(val);
                  setPage(1);
                }}
                options={FILTER_ROLE}
                icon={Building2}
              />
            </div>

            <div className="w-full sm:w-52">
              <FilterSelect
                label="Filter Status"
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
                options={FILTER_STATUS}
                icon={CircleCheck}
              />
            </div>

            {(query || roleFilter !== "Semua" || statusFilter !== "Semua") && (
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

        {/* Tabel pengguna */}
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold text-slate-600">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => toggleSort("nama")}
                      className="inline-flex items-center gap-1.5 font-semibold transition hover:text-teal-800"
                      aria-sort={ariaSort("nama")}
                    >
                      Pengguna &amp; Kontak
                      <SortIcon active={sortKey === "nama"} direction={sortDir} />
                    </button>
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    <button
                      type="button"
                      onClick={() => toggleSort("peran")}
                      className="inline-flex items-center gap-1.5 font-semibold transition hover:text-teal-800"
                      aria-sort={ariaSort("peran")}
                    >
                      Peran &amp; Hak Akses
                      <SortIcon active={sortKey === "peran"} direction={sortDir} />
                    </button>
                  </th>
                  <th scope="col" className="px-3 py-3.5">
                    Wilayah Tugas / Instansi
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => toggleSort("status")}
                      className="inline-flex items-center gap-1.5 font-semibold transition hover:text-teal-800"
                      aria-sort={ariaSort("status")}
                    >
                      Status
                      <SortIcon active={sortKey === "status"} direction={sortDir} />
                    </button>
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-slate-500">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-teal-700" />
                      <p className="mt-2">Memuat daftar pengguna sistem...</p>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <EmptyTableRow colSpan={5} message="Tidak ada pengguna yang cocok dengan kriteria pencarian." />
                ) : (
                  users.map((u, idx) => {
                    const roleKey = u.peran || (u.role === "ADMIN" ? "Admin" : u.role === "APARATUR" ? "Aparatur" : "Kader");
                    const roleMeta = ROLE_META[roleKey] || ROLE_META.Kader;
                    const RoleIcon = roleMeta.icon;
                    const tone = AVATAR_TONES[idx % AVATAR_TONES.length];

                    return (
                      <tr key={u.id} className="transition hover:bg-slate-50/60">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${tone}`}
                              aria-hidden="true"
                            >
                              {inisial(u.nama || u.name)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-bold text-[#0F2942]">
                                {u.nama || u.name}
                              </p>
                              <p className="truncate text-[11px] text-slate-400">
                                {u.email} • @{u.username}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold ${roleMeta.badge}`}
                          >
                            <RoleIcon className="h-3 w-3" aria-hidden="true" />
                            {roleMeta.label}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-slate-600">
                          <p className="truncate max-w-xs">{u.wilayah || (u.dusun?.nama ? `Dusun ${u.dusun.nama}` : "-")}</p>
                        </td>
                        <td className="px-3 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              u.status === "Nonaktif"
                                ? "bg-slate-100 text-slate-600"
                                : "bg-teal-50 text-teal-800"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                u.status === "Nonaktif" ? "bg-slate-400" : "bg-teal-600"
                              }`}
                              aria-hidden="true"
                            />
                            {u.status || "Aktif"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => konfirmasiReset(u)}
                              title="Reset Password Pengguna"
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-teal-800"
                            >
                              <KeyRound className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => bukaEdit(u)}
                              title="Edit Profil Pengguna"
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-teal-800"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => konfirmasiHapus(u)}
                              title="Hapus Pengguna"
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

          <TableFooter from={from} to={to} total={totalCount} page={page} totalPages={totalPages} onPageChange={goTo} />
        </div>
      </section>

      {/* Modal Tambah / Edit Pengguna */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Perbarui Data Pengguna" : "Tambah Pengguna Baru"}
        description="Lengkapi informasi kredensial dan hak akses akun sistem StuntingGuard Desa."
      >
        <form onSubmit={simpanForm} noValidate className="space-y-4">
          <Field id="nama" label="Nama Lengkap" error={errors.nama} required>
            <input
              id="nama"
              type="text"
              value={form.nama}
              onChange={(e) => ubahField("nama", e.target.value)}
              placeholder="Contoh: Siti Rahmawati, S.Tr.Keb"
              className={inputClass(!!errors.nama)}
            />
          </Field>

          <Field id="email" label="Alamat Email" error={errors.email} required>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => ubahField("email", e.target.value)}
              placeholder="nama@desa-sehat.id"
              className={inputClass(!!errors.email)}
            />
          </Field>

          {!editing && (
            <Field
              id="password"
              label="Kata Sandi Awal (Opsional)"
              hint="Kosongkan jika ingin sistem membuat kata sandi acak otomatis."
              error={errors.password}
            >
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => ubahField("password", e.target.value)}
                placeholder="Minimal 6 karakter"
                className={inputClass(!!errors.password)}
              />
            </Field>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="peran" className="mb-1 block text-xs font-semibold text-slate-700">
                Peran Pengguna (Role)
              </label>
              <div className="relative">
                <select
                  id="peran"
                  value={form.peran}
                  onChange={(e) => ubahField("peran", e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-8 text-xs font-medium text-slate-800 outline-none focus:border-teal-700"
                >
                  <option value="Kader">Kader Posyandu</option>
                  <option value="Aparatur">Aparatur Desa</option>
                  <option value="Admin">Admin / Peneliti</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {form.peran === "Kader" && (
              <div>
                <label htmlFor="dusunId" className="mb-1 block text-xs font-semibold text-slate-700">
                  Penugasan Dusun
                </label>
                <div className="relative">
                  <select
                    id="dusunId"
                    value={form.dusunId}
                    onChange={(e) => ubahField("dusunId", e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-8 text-xs font-medium text-slate-800 outline-none focus:border-teal-700"
                  >
                    <option value="">Pilih Dusun / Posyandu</option>
                    {dusunOptions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nama} ({d.rw})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-800 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-900 disabled:opacity-75"
            >
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {editing ? "Simpan Perubahan" : "Buat Akun"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Reset Password */}
      <Modal
        open={!!resetTarget}
        onClose={() => setResetTarget(null)}
        title="Reset Kata Sandi Pengguna"
        description={`Setel ulang kata sandi sementara untuk akun ${resetTarget?.nama || resetTarget?.name}.`}
      >
        <div className="space-y-4">
          {resetState.password ? (
            <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
              <p className="text-xs font-semibold text-teal-800">
                Kata Sandi Sementara Berhasil Dibuat:
              </p>
              <div className="mt-2 flex items-center justify-between rounded-lg bg-white p-3 font-mono text-sm font-bold tracking-wider text-teal-900 border border-teal-200">
                <span>{resetState.password}</span>
                <button
                  type="button"
                  onClick={salinSandi}
                  className="inline-flex items-center gap-1 rounded bg-teal-100 px-2 py-1 text-xs font-semibold text-teal-800 transition hover:bg-teal-200"
                >
                  {resetState.copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Tersalin
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Salin
                    </>
                  )}
                </button>
              </div>
              <p className="mt-2 text-[11px] text-teal-700">
                Berikan kata sandi ini kepada pengguna bersangkutan untuk login pertama kali.
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menyetel ulang kata sandi akun{" "}
              <b>{resetTarget?.nama || resetTarget?.name}</b> ({resetTarget?.email})? Sistem akan
              menghasilkan kata sandi acak baru yang aman.
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setResetTarget(null)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              {resetState.password ? "Tutup" : "Batal"}
            </button>
            {!resetState.password && (
              <button
                type="button"
                onClick={eksekusiReset}
                disabled={resetState.loading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-800 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-900 disabled:opacity-75"
              >
                {resetState.loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {resetState.loading ? "Mereset..." : "Konfirmasi Reset"}
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal Hapus Pengguna */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Akun Pengguna"
        description="Tindakan ini permanen dan akan menghapus akses login pengguna ke sistem."
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
            <span>
              Perhatian: Akun <b>{deleteTarget?.nama || deleteTarget?.name}</b> akan dihapus secara
              permanen dari sistem.
            </span>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={eksekusiHapus}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-75"
            >
              {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isDeleting ? "Menghapus..." : "Hapus Pengguna"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
