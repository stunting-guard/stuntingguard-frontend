import { useMemo, useState } from "react";
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
  Power,
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

/* ------------------------------------------------------------------ */
/* Mock data — ganti dengan response API saat backend siap             */
/* ------------------------------------------------------------------ */
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

const MOCK_USERS = [
  {
    id: 1,
    nama: "Siti Rahmawati, S.Tr.Keb",
    email: "siti.rahma@desa-sehat.id",
    username: "siti_posyandu",
    peran: "Kader",
    peranDetail: "Kader Posyandu / Bidan",
    wilayah: "Posyandu Melati 1 (RW 02)",
    status: "Aktif",
  },
  {
    id: 2,
    nama: "Budi Santoso",
    email: "budi.kesra@sukamaju.go.id",
    username: "budi_desa",
    peran: "Aparatur",
    peranDetail: "Aparatur Desa",
    wilayah: "Kantor Desa Sukamaju (Sie Kesra)",
    status: "Aktif",
  },
  {
    id: 3,
    nama: "Dewi Lestari, Amd.Keb",
    email: "dewi.lestar@kader.id",
    username: "dewi_kader",
    peran: "Kader",
    peranDetail: "Kader Posyandu",
    wilayah: "Posyandu Mawar 2 (RW 04)",
    status: "Aktif",
  },
  {
    id: 4,
    nama: "Ahmad Fauzi",
    email: "ahmad.fauzi@mhs.kampus.ac.id",
    username: "ahmad_admin",
    peran: "Admin",
    peranDetail: "Admin / Mahasiswa",
    wilayah: "Kampus / Server Machine Learning",
    status: "Aktif",
    badge: "Peneliti",
  },
  {
    id: 5,
    nama: "Rina Wulandari",
    email: "rina.dinkes@kecamatan.go.id",
    username: "rina_desa",
    peran: "Aparatur",
    peranDetail: "Aparatur Desa / Dinkes",
    wilayah: "Puskesmas Pembantu Sukamaju",
    status: "Aktif",
  },
  {
    id: 6,
    nama: "Nurul Hidayah",
    email: "nurul.posyandu@desa.id",
    username: "nurul_kader",
    peran: "Kader",
    peranDetail: "Kader Posyandu",
    wilayah: "Posyandu Cempaka (RW 07)",
    status: "Nonaktif",
  },
  {
    id: 7,
    nama: "Sri Wahyuni, S.Keb",
    email: "sri.wahyuni@desa.id",
    username: "sri_posyandu",
    peran: "Kader",
    peranDetail: "Kader Posyandu / Bidan",
    wilayah: "Posyandu Kenanga (RW 01)",
    status: "Aktif",
  },
  {
    id: 8,
    nama: "Joko Susilo",
    email: "joko.susilo@desa.id",
    username: "joko_kader",
    peran: "Kader",
    peranDetail: "Kader Posyandu",
    wilayah: "Posyandu Anggrek (RW 03)",
    status: "Aktif",
  },
  {
    id: 9,
    nama: "Ratna Sari, S.KM",
    email: "ratna.sari@puskesmas.go.id",
    username: "ratna_kader",
    peran: "Kader",
    peranDetail: "Kader Posyandu / Gizi",
    wilayah: "Puskesmas Sukamaju",
    status: "Aktif",
  },
  {
    id: 10,
    nama: "Hendra Gunawan",
    email: "hendra@kecamatan.go.id",
    username: "hendra_desa",
    peran: "Aparatur",
    peranDetail: "Aparatur Desa",
    wilayah: "Kecamatan Sukamaju",
    status: "Aktif",
  },
  {
    id: 11,
    nama: "Maya Puspita",
    email: "maya.puspita@mhs.kampus.ac.id",
    username: "maya_admin",
    peran: "Admin",
    peranDetail: "Admin / Mahasiswa",
    wilayah: "Kampus / Server Machine Learning",
    status: "Aktif",
    badge: "Peneliti",
  },
  {
    id: 12,
    nama: "Andi Pratama",
    email: "andi.pratama@desa.id",
    username: "andi_kader",
    peran: "Kader",
    peranDetail: "Kader Posyandu",
    wilayah: "Posyandu Dahlia (RW 05)",
    status: "Aktif",
  },
];

const EMPTY_FORM = {
  nama: "",
  email: "",
  username: "",
  peran: "Kader",
  peranDetail: "",
  wilayah: "",
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

/* ------------------------------------------------------------------ */
/* Helper                                                              */
/* ------------------------------------------------------------------ */
function inisial(nama) {
  return nama
    .split(",")[0]
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((kata) => kata[0])
    .join("")
    .toUpperCase();
}

function buatSandiSementara() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let sandi = "SG-";
  for (let i = 0; i < 8; i += 1) sandi += chars[Math.floor(Math.random() * chars.length)];
  return sandi;
}

/* ------------------------------------------------------------------ */
/* Sub-komponen lokal                                                  */
/* ------------------------------------------------------------------ */
function SortIcon({ active, direction }) {
  if (!active) return <ArrowUpDown className="h-3 w-3 shrink-0 text-slate-400" aria-hidden="true" />;
  if (direction === "asc") return <ArrowUp className="h-3 w-3 shrink-0 text-teal-700" aria-hidden="true" />;
  return <ArrowDown className="h-3 w-3 shrink-0 text-teal-700" aria-hidden="true" />;
}

/* ------------------------------------------------------------------ */
/* Halaman                                                             */
/* ------------------------------------------------------------------ */
export default function KelolaPengguna() {
  const [users, setUsers] = useState(MOCK_USERS);
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

  const [busyId, setBusyId] = useState(null);
  const { toast, showToast } = useToast();
  const schedule = useSafeTimeout();

  /* ------------------------- Filter, sort, pagination ------------------------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((user) => {
      const cocokQuery =
        !q ||
        [user.nama, user.email, user.username, user.wilayah, user.peranDetail].some((value) =>
          value.toLowerCase().includes(q)
        );
      const cocokRole = roleFilter === "Semua" || user.peran === roleFilter;
      const cocokStatus = statusFilter === "Semua" || user.status === statusFilter;
      return cocokQuery && cocokRole && cocokStatus;
    });
  }, [users, query, roleFilter, statusFilter]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const collator = new Intl.Collator("id-ID", { sensitivity: "base" });
    return [...filtered].sort((a, b) => {
      let hasil = 0;
      if (sortKey === "nama") hasil = collator.compare(a.nama, b.nama);
      else if (sortKey === "peran") {
        hasil = collator.compare(ROLE_META[a.peran].label, ROLE_META[b.peran].label);
      } else if (sortKey === "status") hasil = collator.compare(a.status, b.status);
      return sortDir === "asc" ? hasil : -hasil;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const from = sorted.length === 0 ? 0 : (current - 1) * PAGE_SIZE + 1;
  const to = Math.min(current * PAGE_SIZE, sorted.length);
  const pageRows = sorted.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const ringkasan = useMemo(() => {
    const total = users.length;
    const aktif = users.filter((user) => user.status === "Aktif").length;
    const peran = ROLE_OPTIONS.reduce(
      (acc, role) => ({ ...acc, [role]: users.filter((user) => user.peran === role).length }),
      {}
    );
    const terbesar = ROLE_OPTIONS.reduce((a, b) => (peran[b] > peran[a] ? b : a), ROLE_OPTIONS[0]);
    const persen = total === 0 ? 0 : (peran[terbesar] / total) * 100;
    return { total, aktif, nonaktif: total - aktif, peran, terbesar, persen };
  }, [users]);

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
      nama: user.nama,
      email: user.email,
      username: user.username,
      peran: user.peran,
      peranDetail: user.peranDetail,
      wilayah: user.wilayah,
      status: user.status,
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
    if (!/^[a-zA-Z0-9._-]{3,}$/.test(form.username.trim())) {
      next.username = "Username minimal 3 karakter (huruf, angka, titik, garis bawah).";
    }
    if (!form.wilayah.trim()) next.wilayah = "Wilayah tugas / instansi wajib diisi.";

    const emailSama = users.some(
      (user) =>
        user.id !== editing?.id &&
        user.email.toLowerCase() === form.email.trim().toLowerCase()
    );
    if (emailSama) next.email = "Email sudah digunakan akun lain.";

    const usernameSama = users.some(
      (user) =>
        user.id !== editing?.id &&
        user.username.toLowerCase() === form.username.trim().toLowerCase()
    );
    if (usernameSama) next.username = "Username sudah digunakan akun lain.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const simpanForm = (event) => {
    event.preventDefault();
    if (isSaving || !validasiForm()) return;

    const payload = {
      nama: form.nama.trim(),
      email: form.email.trim(),
      username: form.username.trim(),
      peran: form.peran,
      peranDetail:
        form.peranDetail.trim() || ROLE_META[form.peran]?.label || "Pengguna",
      wilayah: form.wilayah.trim(),
      status: form.status,
    };

    setIsSaving(true);
    // Simulasi penyimpanan — tidak mengirim data ke backend
    schedule(() => {
      if (editing) {
        setUsers((prev) =>
          prev.map((user) => (user.id === editing.id ? { ...user, ...payload } : user))
        );
        showToast(`Akun ${payload.nama} berhasil diperbarui (simulasi).`);
      } else {
        setUsers((prev) => [
          ...prev,
          { ...payload, id: Math.max(0, ...prev.map((user) => user.id)) + 1 },
        ]);
        showToast(`Akun ${payload.nama} berhasil ditambahkan (simulasi).`);
      }
      setIsSaving(false);
      setFormOpen(false);
      setEditing(null);
      setForm(EMPTY_FORM);
    }, 900);
  };

  /* ------------------------- Aksi akun ------------------------- */
  const toggleStatus = (user) => {
    if (busyId !== null) return;
    setBusyId(user.id);
    const statusBaru = user.status === "Aktif" ? "Nonaktif" : "Aktif";
    schedule(() => {
      setUsers((prev) =>
        prev.map((item) => (item.id === user.id ? { ...item, status: statusBaru } : item))
      );
      setBusyId(null);
      showToast(
        `Akun ${user.nama} ${statusBaru === "Aktif" ? "diaktifkan" : "dinonaktifkan"} (simulasi).`
      );
    }, 600);
  };

  const konfirmasiHapus = () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    schedule(() => {
      setUsers((prev) => prev.filter((user) => user.id !== deleteTarget.id));
      showToast(`Akun ${deleteTarget.nama} berhasil dihapus (simulasi).`);
      setIsDeleting(false);
      setDeleteTarget(null);
    }, 900);
  };

  const bukaReset = (user) => {
    setResetTarget(user);
    setResetState({ loading: false, password: "", copied: false });
  };

  const mulaiReset = () => {
    if (resetState.loading) return;
    setResetState({ loading: true, password: "", copied: false });
    schedule(() => {
      setResetState({ loading: false, password: buatSandiSementara(), copied: false });
      showToast(`Sandi sementara untuk ${resetTarget.nama} berhasil dibuat (simulasi).`);
    }, 900);
  };

  const salinSandi = async () => {
    try {
      await navigator.clipboard.writeText(resetState.password);
      setResetState((prev) => ({ ...prev, copied: true }));
    } catch {
      showToast("Gagal menyalin sandi. Silakan salin secara manual.");
    }
  };

  /* ------------------------- Render ------------------------- */
  return (
    <div className="space-y-5 sm:space-y-6">
      <Toast message={toast} />

      {/* Header halaman */}
      <PageHeader
        breadcrumb={[
          { label: "Administrasi Sistem" },
          { label: "Pengelolaan Pengguna / Skripsi" },
        ]}
        title="Manajemen Akun & Hak Akses Pengguna"
        description="Daftar pengguna terdaftar pada sistem klasifikasi stunting desa berdasarkan tingkatan peran (role-based access control) untuk validasi penelitian tugas akhir."
        actions={
          <button
            type="button"
            onClick={bukaTambah}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tambah Akun Baru
          </button>
        }
      />

      {/* Kartu ringkasan */}
      <section aria-label="Ringkasan pengguna" className="grid gap-4 lg:grid-cols-3">
        <StatCard
          label="Total Pengguna Terdaftar"
          icon={<Users className="h-5 w-5 shrink-0 text-slate-600" aria-hidden="true" />}
          iconWrapClassName={null}
          value={
            <>
              {fmt.format(ringkasan.total)}{" "}
              <span className="text-sm font-medium text-slate-500">Akun</span>
            </>
          }
          valueClassName="mt-3 text-4xl font-extrabold tracking-tight text-[#0F2942]"
          footer={
            <>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600" aria-hidden="true" />
                {ringkasan.aktif} Akun Aktif
              </span>
              <span className="text-slate-300" aria-hidden="true">
                •
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" aria-hidden="true" />
                {ringkasan.nonaktif} Akun Nonaktif Sementara
              </span>
            </>
          }
          footerClassName="flex flex-wrap items-center gap-x-2 gap-y-1 pt-5 text-xs font-semibold text-slate-600"
        />

        <StatCard
          label="Distribusi Tingkat Peran (Role)"
          icon={<ClipboardCheck className="h-5 w-5" aria-hidden="true" />}
          iconWrapClassName="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700"
          footer={
            <>
              <Crown className="h-3.5 w-3.5 shrink-0 text-teal-700" aria-hidden="true" />
              Proposisi terbesar: {ROLE_META[ringkasan.terbesar].label} (
              {satuDesimal(ringkasan.persen)}%)
            </>
          }
          footerClassName="flex items-center gap-1.5 pt-4 text-[11px] font-semibold text-slate-600"
        >
          <div className="mt-3 flex flex-col items-start gap-2">
            {ROLE_OPTIONS.map((role) => {
              const utama = role === ringkasan.terbesar;
              return (
                <span
                  key={role}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                    utama
                      ? "border-teal-200 bg-teal-50/70 text-teal-800"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {ROLE_META[role].label} ({ringkasan.peran[role]})
                </span>
              );
            })}
          </div>
        </StatCard>

        <StatCard
          label="Keamanan & Hak Akses"
          icon={<ShieldCheck className="h-5 w-5 shrink-0 text-teal-700" aria-hidden="true" />}
          iconWrapClassName={null}
          value="Role-Based Access Control"
          valueClassName="mt-3 max-w-[17rem] text-2xl font-extrabold leading-tight tracking-tight text-[#0F2942]"
          footer={
            <>
              <CircleCheck
                className="mt-px h-3.5 w-3.5 shrink-0 text-teal-700"
                aria-hidden="true"
              />
              RBAC Aktif & Terenkripsi Argon2id (Validasi Sidang)
            </>
          }
          footerClassName="flex items-start gap-1.5 pt-4 text-[11px] font-semibold text-slate-600"
        />
      </section>

      {/* Filter */}
      <section aria-label="Filter pengguna" className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <SearchInput
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Cari nama pengguna, username, atau email..."
            ariaLabel="Cari pengguna"
            inputClassName="text-xs text-slate-800"
          />

          <FilterSelect
            label="Filter peran"
            value={roleFilter}
            onChange={(value) => {
              setRoleFilter(value);
              setPage(1);
            }}
            options={FILTER_ROLE}
            className="xl:w-64"
          />

          <FilterSelect
            label="Filter status"
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            options={FILTER_STATUS}
            className="xl:w-64"
          />

          <div className="flex items-center justify-between gap-3 xl:ml-auto">
            <button
              type="button"
              onClick={resetFilter}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-teal-700"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset Filter
            </button>
            <span className="whitespace-nowrap text-[11px] font-semibold text-slate-500">
              Total {pageRows.length} Ditampilkan
            </span>
          </div>
        </div>
      </section>

      {/* Tabel pengguna */}
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1060px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                <th scope="col" className="px-5 py-3.5">No</th>
                <th scope="col" aria-sort={ariaSort("nama")} className="px-3 py-3.5">
                  <button
                    type="button"
                    onClick={() => toggleSort("nama")}
                    title="Urutkan berdasarkan nama"
                    className="inline-flex items-center gap-1.5 rounded uppercase tracking-wide transition hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-teal-700"
                  >
                    Nama Lengkap
                    <SortIcon active={sortKey === "nama"} direction={sortDir} />
                  </button>
                </th>
                <th scope="col" className="px-3 py-3.5">Username / Kredensial</th>
                <th scope="col" aria-sort={ariaSort("peran")} className="px-3 py-3.5">
                  <button
                    type="button"
                    onClick={() => toggleSort("peran")}
                    title="Urutkan berdasarkan peran"
                    className="inline-flex items-center gap-1.5 rounded uppercase tracking-wide transition hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-teal-700"
                  >
                    Peran / Role
                    <SortIcon active={sortKey === "peran"} direction={sortDir} />
                  </button>
                </th>
                <th scope="col" className="px-3 py-3.5">Wilayah Tugas / Instansi</th>
                <th scope="col" aria-sort={ariaSort("status")} className="px-3 py-3.5">
                  <button
                    type="button"
                    onClick={() => toggleSort("status")}
                    title="Urutkan berdasarkan status"
                    className="inline-flex items-center gap-1.5 rounded uppercase tracking-wide transition hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-teal-700"
                  >
                    Status Akun
                    <SortIcon active={sortKey === "status"} direction={sortDir} />
                  </button>
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageRows.length === 0 && (
                <EmptyTableRow
                  colSpan={7}
                  icon={Users}
                  title="Tidak ada pengguna yang cocok"
                  description="Ubah kata kunci atau atur ulang filter untuk melihat akun lain."
                />
              )}

              {pageRows.map((user, index) => {
                const meta = ROLE_META[user.peran] ?? ROLE_META.Kader;
                const RoleIcon = meta.icon;
                const aktif = user.status === "Aktif";
                return (
                  <tr key={user.id} className="transition hover:bg-slate-50/60">
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {String((current - 1) * PAGE_SIZE + index + 1).padStart(2, "0")}
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                            user.peran === "Admin"
                              ? "bg-teal-800 text-white"
                              : AVATAR_TONES[user.id % AVATAR_TONES.length]
                          }`}
                        >
                          {inisial(user.nama)}
                        </span>
                        <div className="min-w-0">
                          <p className="flex flex-wrap items-center gap-1.5 font-semibold text-[#0F2942]">
                            {user.nama}
                            {user.badge && (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-600">
                                {user.badge}
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-4">
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                        {user.username}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.badge}`}
                      >
                        <RoleIcon className="h-3 w-3" aria-hidden="true" />
                        {user.peranDetail || meta.label}
                      </span>
                    </td>

                    <td className="px-3 py-4 text-xs text-slate-600">{user.wilayah}</td>

                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold ${
                          aktif ? "text-teal-800" : "text-slate-500"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            aktif ? "bg-teal-600" : "bg-slate-400"
                          }`}
                          aria-hidden="true"
                        />
                        {user.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => bukaEdit(user)}
                          aria-label={`Edit ${user.nama}`}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-teal-50 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-teal-700"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          Edit
                        </button>

                        {aktif ? (
                          <button
                            type="button"
                            onClick={() => bukaReset(user)}
                            aria-label={`Reset sandi ${user.nama}`}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-teal-50 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-teal-700"
                          >
                            <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                            Reset
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleStatus(user)}
                            disabled={busyId === user.id}
                            aria-label={`Aktifkan ${user.nama}`}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-teal-50 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-teal-700 disabled:opacity-60"
                          >
                            <Power className="h-3.5 w-3.5" aria-hidden="true" />
                            {busyId === user.id ? "Memproses" : "Aktifkan"}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(user)}
                          aria-label={`Hapus ${user.nama}`}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <TableFooter
          className="border-t border-slate-100 bg-slate-50/60 text-[11px]"
          summary={
            <>
              Menampilkan <b className="text-slate-900">{from}</b>–
              <b className="text-slate-900">{to}</b> dari{" "}
              <b className="text-slate-900">{sorted.length}</b> akun pengguna terdaftar
            </>
          }
          page={current}
          totalPages={totalPages}
          onChange={goTo}
        />
      </section>

      {/* Modal tambah / edit pengguna */}
      {formOpen && (
        <Modal
          labelledBy="form-title"
          onClose={() => !isSaving && setFormOpen(false)}
          width="max-w-xl"
        >
          <div className="relative px-6 pb-5 pt-7 sm:px-8 sm:pb-6 sm:pt-8">
            <ModalClose onClick={() => setFormOpen(false)} disabled={isSaving} />

            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                {editing ? (
                  <Pencil className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <UserPlus className="h-5 w-5" aria-hidden="true" />
                )}
              </span>
              <div>
                <h2 id="form-title" className="text-xl font-bold text-[#0F2942]">
                  {editing ? "Edit Akun Pengguna" : "Tambah Akun Baru"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {editing
                    ? "Perbarui data profil dan hak akses akun pengguna."
                    : "Lengkapi data akun baru. Kata sandi awal dibuat otomatis (simulasi)."}
                </p>
              </div>
            </div>

            <form onSubmit={simpanForm} noValidate className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-4">
              <Field id="nama" label="Nama Lengkap" error={errors.nama} className="sm:col-span-2">
                <input
                  id="nama"
                  type="text"
                  value={form.nama}
                  onChange={(e) => ubahField("nama", e.target.value)}
                  placeholder="Contoh: Siti Rahmawati, S.Tr.Keb"
                  aria-invalid={Boolean(errors.nama)}
                  aria-describedby={errors.nama ? "nama-error" : undefined}
                  className={inputClass}
                />
              </Field>

              <Field id="email" label="Email" error={errors.email}>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => ubahField("email", e.target.value)}
                  placeholder="nama@instansi.go.id"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={inputClass}
                />
              </Field>

              <Field id="username" label="Username" error={errors.username}>
                <input
                  id="username"
                  type="text"
                  value={form.username}
                  onChange={(e) => ubahField("username", e.target.value)}
                  placeholder="nama_pengguna"
                  aria-invalid={Boolean(errors.username)}
                  aria-describedby={errors.username ? "username-error" : undefined}
                  className={inputClass}
                />
              </Field>

              <Field id="peran" label="Peran / Role">
                <div className="relative">
                  <select
                    id="peran"
                    value={form.peran}
                    onChange={(e) => ubahField("peran", e.target.value)}
                    className={`${inputClass} appearance-none pr-9`}
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role} value={role}>
                        {ROLE_META[role].label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </Field>

              <Field id="peranDetail" label="Detail Peran (opsional)">
                <input
                  id="peranDetail"
                  type="text"
                  value={form.peranDetail}
                  onChange={(e) => ubahField("peranDetail", e.target.value)}
                  placeholder={ROLE_META[form.peran]?.placeholder ?? "Kader Posyandu / Bidan"}
                  className={inputClass}
                />
              </Field>

              <Field
                id="wilayah"
                label="Wilayah Tugas / Instansi"
                error={errors.wilayah}
                className="sm:col-span-2"
              >
                <input
                  id="wilayah"
                  type="text"
                  value={form.wilayah}
                  onChange={(e) => ubahField("wilayah", e.target.value)}
                  placeholder="Contoh: Posyandu Melati 1 (RW 02)"
                  aria-invalid={Boolean(errors.wilayah)}
                  aria-describedby={errors.wilayah ? "wilayah-error" : undefined}
                  className={inputClass}
                />
              </Field>

              <fieldset className="sm:col-span-2">
                <legend className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Status Akun
                </legend>
                <div className="mt-2 flex gap-2">
                  {["Aktif", "Nonaktif"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => ubahField("status", status)}
                      aria-pressed={form.status === status}
                      className={`rounded-xl px-4 py-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-teal-700 ${
                        form.status === status
                          ? "bg-teal-800 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="mt-2 grid gap-3 sm:col-span-2 sm:grid-cols-2 max-sm:sticky max-sm:bottom-0 max-sm:z-10 max-sm:-mx-6 max-sm:-mb-5 max-sm:mt-1 max-sm:border-t max-sm:border-slate-100 max-sm:bg-white max-sm:px-6 max-sm:pb-4 max-sm:pt-3">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-teal-700 disabled:opacity-60"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  )}
                  {isSaving
                    ? "Menyimpan..."
                    : editing
                      ? "Simpan Perubahan"
                      : "Tambah Akun"}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Modal hapus pengguna */}
      {deleteTarget && (
        <Modal
          labelledBy="delete-title"
          onClose={() => !isDeleting && setDeleteTarget(null)}
          width="max-w-md"
        >
          <div className="relative px-6 pb-6 pt-8 sm:px-7">
            <ModalClose onClick={() => setDeleteTarget(null)} disabled={isDeleting} />

            <div className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle className="h-7 w-7" aria-hidden="true" />
              </span>
              <h2 id="delete-title" className="mt-4 text-xl font-bold text-[#0F2942]">
                Hapus Akun Pengguna?
              </h2>
              <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">
                Akun <b className="text-slate-800">{deleteTarget.nama}</b> (
                {deleteTarget.username}) akan dihapus dari daftar pengguna. Tindakan ini tidak
                dapat dibatalkan.
              </p>
            </div>

            <p className="mt-5 rounded-xl bg-red-50/60 px-4 py-3 text-[11px] font-medium text-red-700">
              Riwayat prediksi yang pernah dibuat akun ini tetap tersimpan pada sistem (simulasi).
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-teal-700 disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={konfirmasiHapus}
                disabled={isDeleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                )}
                {isDeleting ? "Menghapus..." : "Hapus Akun"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal reset kata sandi */}
      {resetTarget && (
        <Modal
          labelledBy="reset-title"
          onClose={() => !resetState.loading && setResetTarget(null)}
          width="max-w-md"
        >
          <div className="relative px-6 pb-6 pt-8 sm:px-7">
            <ModalClose onClick={() => setResetTarget(null)} disabled={resetState.loading} />

            <div className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                <KeyRound className="h-7 w-7" aria-hidden="true" />
              </span>
              <h2 id="reset-title" className="mt-4 text-xl font-bold text-[#0F2942]">
                Reset Kata Sandi
              </h2>
              <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">
                Sandi sementara akan dibuat untuk{" "}
                <b className="text-slate-800">{resetTarget.nama}</b> ({resetTarget.username}).
                Pengguna wajib menggantinya saat masuk berikutnya.
              </p>
            </div>

            {resetState.password ? (
              <>
                <div className="mt-5 rounded-xl border border-dashed border-teal-200 bg-teal-50/50 px-4 py-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Sandi sementara
                  </p>
                  <div className="mt-1 flex items-center justify-center gap-1.5">
                    <code className="text-lg font-bold tracking-[0.18em] text-teal-900">
                      {resetState.password}
                    </code>
                    <button
                      type="button"
                      onClick={salinSandi}
                      aria-label="Salin sandi sementara"
                      title="Salin sandi"
                      className="rounded-lg p-1.5 text-teal-700 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-teal-700"
                    >
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                  {resetState.copied && (
                    <p className="mt-1 text-[10px] font-semibold text-teal-700">
                      Tersalin ke papan klip
                    </p>
                  )}
                </div>

                <p className="mt-3 text-center text-[11px] text-slate-500">
                  Sandi berlaku 24 jam dan tidak ditampilkan lagi setelah dialog ditutup
                  (simulasi).
                </p>

                <button
                  type="button"
                  onClick={() => setResetTarget(null)}
                  className="mt-6 w-full rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                >
                  Selesai
                </button>
              </>
            ) : (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setResetTarget(null)}
                  disabled={resetState.loading}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-teal-700 disabled:opacity-60"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={mulaiReset}
                  disabled={resetState.loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {resetState.loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <KeyRound className="h-4 w-4" aria-hidden="true" />
                  )}
                  {resetState.loading ? "Membuat sandi..." : "Buat Sandi"}
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
