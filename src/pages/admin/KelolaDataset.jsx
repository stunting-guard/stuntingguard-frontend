import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  CircleCheck,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Loader2,
  Mars,
  RotateCw,
  SlidersHorizontal,
  Table2,
  UploadCloud,
  Users,
  Venus,
  X,
} from "lucide-react";
import Modal, { ModalClose } from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";
import StatCard from "../../components/ui/StatCard";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import FilterSelect from "../../components/ui/FilterSelect";
import TableFooter from "../../components/ui/TableFooter";
import EmptyTableRow from "../../components/ui/EmptyTableRow";
import useToast from "../../hooks/useToast";
import useSafeTimeout from "../../hooks/useSafeTimeout";

/* ------------------------------------------------------------------ */
/* Mock data — ganti dengan response API saat backend sudah siap       */
/* ------------------------------------------------------------------ */
const MOCK_SUMMARY = {
  totalData: 12840,
  jumlahFitur: 6,
  statusDataset: "Siap Latih",
  pageSize: 5,
};

const MOCK_BALITA = [
  { id: "BLT-001", kepalaKeluarga: "Ahmad Fauzi", usia: 12, jk: "L", berat: 8.4, tinggi: 74.2, sanitasi: "Tidak Layak (BABS)", sanitasiLayak: false, air: "Sumur Terbuka", risiko: "Tinggi" },
  { id: "BLT-002", kepalaKeluarga: "Siti Aminah", usia: 18, jk: "P", berat: 9.1, tinggi: 79.5, sanitasi: "Layak Bersama", sanitasiLayak: true, air: "Sumur Bor Terlindung", risiko: "Tinggi" },
  { id: "BLT-003", kepalaKeluarga: "Budi Santoso", usia: 24, jk: "L", berat: 11.2, tinggi: 86.3, sanitasi: "Layak Sendiri", sanitasiLayak: true, air: "Mata Air Terlindung", risiko: "Sedang" },
  { id: "BLT-004", kepalaKeluarga: "Rina Marlina", usia: 15, jk: "P", berat: 8.9, tinggi: 77.8, sanitasi: "Layak Sendiri", sanitasiLayak: true, air: "PDAM / Perpipaan", risiko: "Rendah" },
  { id: "BLT-005", kepalaKeluarga: "Dedi Kurniawan", usia: 9, jk: "L", berat: 7.2, tinggi: 68.4, sanitasi: "Tidak Layak (Plengsengan)", sanitasiLayak: false, air: "Sumur Terbuka", risiko: "Tinggi" },
  { id: "BLT-006", kepalaKeluarga: "Wawan Setiawan", usia: 30, jk: "L", berat: 12.5, tinggi: 90.1, sanitasi: "Layak Bersama", sanitasiLayak: true, air: "Sumur Bor Terlindung", risiko: "Sedang" },
  { id: "BLT-007", kepalaKeluarga: "Nur Aisyah", usia: 22, jk: "P", berat: 10.3, tinggi: 83.7, sanitasi: "Layak Sendiri", sanitasiLayak: true, air: "PDAM / Perpipaan", risiko: "Rendah" },
  { id: "BLT-008", kepalaKeluarga: "Joko Susilo", usia: 36, jk: "L", berat: 13.8, tinggi: 94.6, sanitasi: "Layak Sendiri", sanitasiLayak: true, air: "Mata Air Terlindung", risiko: "Rendah" },
  { id: "BLT-009", kepalaKeluarga: "Sri Wahyuni", usia: 11, jk: "P", berat: 6.9, tinggi: 66.8, sanitasi: "Tidak Layak (BABS)", sanitasiLayak: false, air: "Sungai / Air Permukaan", risiko: "Tinggi" },
  { id: "BLT-010", kepalaKeluarga: "Hendra Gunawan", usia: 27, jk: "L", berat: 12.1, tinggi: 88.2, sanitasi: "Layak Bersama", sanitasiLayak: true, air: "Sumur Bor Terlindung", risiko: "Sedang" },
  { id: "BLT-011", kepalaKeluarga: "Dewi Lestari", usia: 16, jk: "P", berat: 8.2, tinggi: 73.5, sanitasi: "Tidak Layak (BABS)", sanitasiLayak: false, air: "Sumur Terbuka", risiko: "Tinggi" },
  { id: "BLT-012", kepalaKeluarga: "Agus Setiawan", usia: 33, jk: "L", berat: 13.1, tinggi: 92.4, sanitasi: "Layak Sendiri", sanitasiLayak: true, air: "PDAM / Perpipaan", risiko: "Rendah" },
  { id: "BLT-013", kepalaKeluarga: "Yuni Rahmawati", usia: 20, jk: "P", berat: 9.6, tinggi: 81.3, sanitasi: "Layak Bersama", sanitasiLayak: true, air: "Mata Air Terlindung", risiko: "Sedang" },
  { id: "BLT-014", kepalaKeluarga: "Rudi Hartono", usia: 8, jk: "L", berat: 6.8, tinggi: 64.2, sanitasi: "Tidak Layak (Plengsengan)", sanitasiLayak: false, air: "Sumur Terbuka", risiko: "Tinggi" },
  { id: "BLT-015", kepalaKeluarga: "Siti Nurhaliza", usia: 25, jk: "P", berat: 11, tinggi: 85.9, sanitasi: "Layak Sendiri", sanitasiLayak: true, air: "PDAM / Perpipaan", risiko: "Rendah" },
  { id: "BLT-016", kepalaKeluarga: "Eko Prasetyo", usia: 14, jk: "L", berat: 8.1, tinggi: 71.9, sanitasi: "Tidak Layak (BABS)", sanitasiLayak: false, air: "Sungai / Air Permukaan", risiko: "Tinggi" },
  { id: "BLT-017", kepalaKeluarga: "Fitri Handayani", usia: 29, jk: "P", berat: 12.3, tinggi: 89, sanitasi: "Layak Bersama", sanitasiLayak: true, air: "Sumur Bor Terlindung", risiko: "Sedang" },
  { id: "BLT-018", kepalaKeluarga: "Bambang Sutrisno", usia: 21, jk: "L", berat: 9.9, tinggi: 82.6, sanitasi: "Layak Sendiri", sanitasiLayak: true, air: "Mata Air Terlindung", risiko: "Sedang" },
];

const RISIKO_BADGE = {
  Tinggi: "bg-red-50 text-red-700",
  Sedang: "bg-amber-50 text-amber-700",
  Rendah: "bg-teal-50 text-teal-700",
};

const SORT_OPTIONS = [
  { value: "id-asc", label: "ID Balita (A-Z)" },
  { value: "id-desc", label: "ID Balita (Z-A)" },
  { value: "usia-asc", label: "Usia (Termuda)" },
  { value: "usia-desc", label: "Usia (Tertua)" },
];

const KATEGORI_OPTIONS = ["Semua Kategori Risiko", "Tinggi", "Sedang", "Rendah"];

const TEMPLATE_CSV = [
  "id_balita,nama_kepala_keluarga,usia_bulan,jenis_kelamin,berat_badan,tinggi_badan,sanitasi_jamban,sumber_air,status_risiko",
  "BLT-001,Contoh Nama,12,L,8.4,74.2,Layak Sendiri,PDAM / Perpipaan,Rendah",
].join("\r\n");

const fmt = new Intl.NumberFormat("id-ID");
const fmtDesimal = (n) => n.toFixed(1).replace(".", ",");

function validasiFile(file) {
  if (!file.name.toLowerCase().endsWith(".csv")) return "Format file harus .csv";
  if (file.size === 0) return "File kosong. Pilih file CSV yang berisi data.";
  if (file.size > 5 * 1024 * 1024) return "Ukuran file maksimal 5 MB.";
  return "";
}

function ukuranFile(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/* ------------------------------------------------------------------ */
/* Sub-komponen lokal                                                  */
/* ------------------------------------------------------------------ */
function InfoChip({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">
      <Icon className="h-4 w-4" aria-hidden="true" />
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Halaman                                                             */
/* ------------------------------------------------------------------ */
export default function KelolaDataset() {
  const summary = MOCK_SUMMARY;
  const balita = MOCK_BALITA;

  const [query, setQuery] = useState("");
  const [kategori, setKategori] = useState(KATEGORI_OPTIONS[0]);
  const [urutan, setUrutan] = useState("id-asc");
  const [page, setPage] = useState(1);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef(null);

  const [detailRow, setDetailRow] = useState(null);
  const { toast, showToast } = useToast();
  const schedule = useSafeTimeout();

  /* ------------------------- Filter, sort, pagination ------------------------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return balita.filter((b) => {
      const cocokQuery =
        !q || b.id.toLowerCase().includes(q) || b.kepalaKeluarga.toLowerCase().includes(q);
      const cocokKategori = kategori === KATEGORI_OPTIONS[0] || b.risiko === kategori;
      return cocokQuery && cocokKategori;
    });
  }, [balita, query, kategori]);

  const rows = useMemo(() => {
    return [...filtered].sort((a, b) => {
      switch (urutan) {
        case "id-desc":
          return b.id.localeCompare(a.id);
        case "usia-asc":
          return a.usia - b.usia;
        case "usia-desc":
          return b.usia - a.usia;
        default:
          return a.id.localeCompare(b.id);
      }
    });
  }, [filtered, urutan]);

  const totalPages = Math.max(1, Math.ceil(rows.length / summary.pageSize));
  const current = Math.min(page, totalPages);
  const from = rows.length === 0 ? 0 : (current - 1) * summary.pageSize + 1;
  const to = Math.min(current * summary.pageSize, rows.length);
  const pageRows = rows.slice((current - 1) * summary.pageSize, current * summary.pageSize);

  const resetFilter = () => {
    setQuery("");
    setKategori(KATEGORI_OPTIONS[0]);
    setUrutan("id-asc");
    setPage(1);
  };

  const goTo = (p) => setPage(Math.min(Math.max(p, 1), totalPages));

  /* ------------------------- Aksi file ------------------------- */
  const handleDownloadTemplate = () => {
    const blob = new Blob([`\uFEFF${TEMPLATE_CSV}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template-dataset-balita.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Template CSV berhasil diunduh.");
  };

  const openUpload = () => {
    setFile(null);
    setFileError("");
    setDragActive(false);
    setUploadOpen(true);
  };

  const terimaFile = (list) => {
    if (isUploading) return;
    const picked = list?.[0];
    if (!picked) return;
    const err = validasiFile(picked);
    setFileError(err);
    setFile(err ? null : picked);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    terimaFile(e.dataTransfer.files);
  };

  const handleFileInput = (e) => {
    terimaFile(e.target.files);
    e.target.value = "";
  };

  const handleUpload = () => {
    if (!file) {
      setFileError("Pilih file CSV terlebih dahulu.");
      return;
    }
    setIsUploading(true);
    // Simulasi proses unggah — tidak mengirim apa pun ke backend
    schedule(() => {
      setIsUploading(false);
      setUploadOpen(false);
      setFile(null);
      showToast(`Dataset "${file.name}" berhasil diunggah (simulasi).`);
    }, 1200);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <Toast message={toast} />

      {/* Header halaman */}
      <PageHeader
        title="Pengelolaan Dataset Balita"
        description="Data antropometri dan faktor risiko stunting balita untuk pelatihan algoritma Random Forest."
        actions={
          <>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-800 transition hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Unduh Template CSV
            </button>
            <button
              type="button"
              onClick={openUpload}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              <UploadCloud className="h-4 w-4" aria-hidden="true" />
              Unggah Dataset (.CSV)
            </button>
          </>
        }
      />

      {/* Kartu ringkasan */}
      <section className="grid gap-4 lg:grid-cols-3">
        <StatCard
          label="Total Data Tersimpan"
          icon={<Users className="h-6 w-6" aria-hidden="true" />}
          iconWrapClassName="flex h-11 w-11 shrink-0 items-center justify-center text-slate-700"
          value={
            <>
              {fmt.format(summary.totalData)}{" "}
              <span className="text-sm font-medium text-slate-500">Balita / Baris</span>
            </>
          }
          valueClassName="mt-3 text-4xl font-extrabold tracking-tight text-[#0F2942]"
          footer={
            <>
              <CircleCheck className="h-4 w-4 text-slate-500" aria-hidden="true" />
              100% Lengkap (Tanpa Missing Value)
            </>
          }
          footerClassName="flex items-center gap-2 pt-5 text-xs font-semibold text-slate-600"
        />

        <StatCard
          label="Jumlah Fitur / Variabel"
          icon={<SlidersHorizontal className="h-5 w-5" aria-hidden="true" />}
          iconWrapClassName="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700"
          value={
            <>
              {summary.jumlahFitur}{" "}
              <span className="text-sm font-medium text-slate-500">Fitur Masukan</span>
            </>
          }
          valueClassName="mt-3 text-4xl font-extrabold tracking-tight text-[#0F2942]"
          footer={<InfoChip icon={CircleCheck}>Tervalidasi Akademik (Z-Score TB/U)</InfoChip>}
        />

        <StatCard
          label="Status Dataset"
          icon={
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-700 text-white">
                <Check className="h-4 w-4" aria-hidden="true" />
              </span>
            </span>
          }
          iconWrapClassName={null}
          value={summary.statusDataset}
          valueClassName="mt-3 text-4xl font-extrabold tracking-tight text-teal-800"
          footer={<InfoChip icon={CircleCheck}>Telah Melalui Normalisasi &amp; Imputasi</InfoChip>}
        />
      </section>

      {/* Filter */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <SearchInput
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Cari ID Balita atau nama kepala keluarga..."
            ariaLabel="Cari data balita"
          />

          <FilterSelect
            inline
            label="Kategori:"
            value={kategori}
            onChange={(value) => {
              setKategori(value);
              setPage(1);
            }}
            options={KATEGORI_OPTIONS.map((option) => ({ value: option, label: option }))}
          />

          <FilterSelect
            inline
            label="Urutan:"
            value={urutan}
            onChange={(value) => {
              setUrutan(value);
              setPage(1);
            }}
            options={SORT_OPTIONS}
          />

          <div className="flex items-center gap-2 xl:ml-auto">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-2 text-[11px] font-semibold text-teal-800">
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              Format: UTF-8 CSV
            </span>
            <button
              type="button"
              onClick={resetFilter}
              aria-label="Atur ulang filter"
              title="Atur ulang filter"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-teal-700"
            >
              <RotateCw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Tabel pratinjau */}
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex flex-col gap-2 bg-sky-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-[#0F2942]">
            <Table2 className="h-5 w-5 text-teal-700" aria-hidden="true" />
            Pratinjau Data Primer Antropometri
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Sampel Head ({summary.pageSize} Baris per Halaman)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="bg-sky-50/70 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-6 py-3">No</th>
                <th scope="col" className="px-3 py-3">ID Balita</th>
                <th scope="col" className="px-3 py-3">Usia (Bulan)</th>
                <th scope="col" className="px-3 py-3">Jenis Kelamin</th>
                <th scope="col" className="px-3 py-3">Sanitasi Jamban</th>
                <th scope="col" className="px-3 py-3">Sumber Air Bersih</th>
                <th scope="col" className="px-3 py-3">Status Risiko</th>
                <th scope="col" className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageRows.length === 0 && (
                <EmptyTableRow
                  colSpan={8}
                  icon={Table2}
                  title="Tidak ada data yang cocok"
                  description="Ubah kata kunci atau atur ulang filter untuk melihat data lain."
                />
              )}
              {pageRows.map((b, i) => (
                <tr key={b.id} className="transition hover:bg-slate-50/60">
                  <td className="px-6 py-4 text-slate-500">
                    {(current - 1) * summary.pageSize + i + 1}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4">
                    <p className="font-bold text-teal-700">{b.id}</p>
                    <p className="text-[11px] text-slate-400">{b.kepalaKeluarga}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-slate-700">{b.usia} Bulan</td>
                  <td className="whitespace-nowrap px-3 py-4 text-slate-700">
                    <span className="inline-flex items-center gap-1.5">
                      {b.jk === "L" ? (
                        <Mars className="h-4 w-4 text-teal-700" aria-hidden="true" />
                      ) : (
                        <Venus className="h-4 w-4 text-rose-500" aria-hidden="true" />
                      )}
                      {b.jk === "L" ? "Laki-laki" : "Perempuan"}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={
                        b.sanitasiLayak
                          ? "text-xs font-medium text-slate-700"
                          : "inline-block rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700"
                      }
                    >
                      {b.sanitasi}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-slate-700">{b.air}</td>
                  <td className="px-3 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${RISIKO_BADGE[b.risiko]}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          b.risiko === "Tinggi"
                            ? "bg-red-500"
                            : b.risiko === "Sedang"
                              ? "bg-amber-500"
                              : "bg-teal-600"
                        }`}
                        aria-hidden="true"
                      />
                      Risiko {b.risiko}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setDetailRow(b)}
                      aria-label={`Lihat detail ${b.id}`}
                      title="Lihat detail"
                      className="rounded-md p-1.5 text-slate-500 transition hover:bg-teal-50 hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-teal-700"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TableFooter
          className="bg-sky-50/70"
          summary={
            <>
              Menampilkan <b className="text-slate-900">{from}</b>–
              <b className="text-slate-900">{to}</b> dari{" "}
              <b className="text-slate-900">{rows.length}</b> entri pratinjau
              <span className="hidden sm:inline">
                {" "}
                • Total dataset {fmt.format(summary.totalData)}
              </span>
            </>
          }
          page={current}
          totalPages={totalPages}
          onChange={goTo}
        />
      </section>

      {/* Modal unggah dataset */}
      {uploadOpen && (
        <Modal labelledBy="upload-title" onClose={() => !isUploading && setUploadOpen(false)}>
          <div className="relative px-6 pb-6 pt-8 sm:px-8">
            <ModalClose onClick={() => setUploadOpen(false)} disabled={isUploading} />

            <div className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-teal-700">
                <UploadCloud className="h-7 w-7" aria-hidden="true" />
              </span>
              <h2 id="upload-title" className="mt-4 text-xl font-bold text-[#0F2942]">
                Unggah Dataset CSV
              </h2>
              <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">
                Impor data antropometri balita untuk melatih ulang model Random Forest. Pastikan
                format kolom sesuai template.
              </p>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`mt-6 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${
                dragActive
                  ? "border-teal-600 bg-teal-50/70"
                  : fileError
                    ? "border-red-300 bg-red-50/40"
                    : "border-slate-200 bg-slate-50/60"
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileInput}
                className="hidden"
                aria-label="Pilih file CSV"
              />

              {file ? (
                <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-left shadow-sm">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-teal-700">
                      <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[#0F2942]">
                        {file.name}
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        {ukuranFile(file.size)} • siap diunggah
                      </span>
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setFileError("");
                    }}
                    disabled={isUploading}
                    aria-label="Hapus file terpilih"
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-teal-700 shadow-sm">
                    <UploadCloud className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Tarik &amp; lepas file di sini, atau{" "}
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="text-teal-700 underline underline-offset-2 hover:text-teal-900 focus-visible:outline-2 focus-visible:outline-teal-700"
                    >
                      pilih file
                    </button>
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Hanya file .csv • Maksimal 5 MB
                  </p>
                </>
              )}
            </div>

            {fileError && (
              <p
                role="alert"
                className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
              >
                <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                {fileError}
              </p>
            )}

            <ul className="mt-4 grid gap-2 text-[11px] text-slate-500 sm:grid-cols-3">
              <li className="rounded-lg bg-slate-50 px-3 py-2 text-center font-medium">
                Encoding UTF-8
              </li>
              <li className="rounded-lg bg-slate-50 px-3 py-2 text-center font-medium">
                Header di baris 1
              </li>
              <li className="rounded-lg bg-slate-50 px-3 py-2 text-center font-medium">
                Maks. 12.000 baris
              </li>
            </ul>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setUploadOpen(false)}
                disabled={isUploading}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-teal-700 disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <UploadCloud className="h-4 w-4" aria-hidden="true" />
                )}
                {isUploading ? "Mengunggah..." : "Unggah Dataset"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal detail baris */}
      {detailRow && (
        <Modal labelledBy="detail-title" onClose={() => setDetailRow(null)} width="max-w-md">
          <div className="relative px-6 pb-6 pt-7 sm:px-7">
            <ModalClose onClick={() => setDetailRow(null)} />

            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <Table2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 id="detail-title" className="text-lg font-bold text-[#0F2942]">
                  Detail Data Balita
                </h2>
                <p className="text-xs text-slate-500">
                  {detailRow.id} • {detailRow.kepalaKeluarga}
                </p>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-100">
              {[
                ["Usia", `${detailRow.usia} bulan`],
                ["Jenis Kelamin", detailRow.jk === "L" ? "Laki-laki" : "Perempuan"],
                ["Berat Badan", `${fmtDesimal(detailRow.berat)} kg`],
                ["Tinggi Badan", `${fmtDesimal(detailRow.tinggi)} cm`],
                ["Sanitasi Jamban", detailRow.sanitasi],
                ["Sumber Air Bersih", detailRow.air],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 px-4 py-2.5 text-sm">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="text-right font-semibold text-[#0F2942]">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-xs font-semibold text-slate-600">Status Risiko</span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${RISIKO_BADGE[detailRow.risiko]}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    detailRow.risiko === "Tinggi"
                      ? "bg-red-500"
                      : detailRow.risiko === "Sedang"
                        ? "bg-amber-500"
                        : "bg-teal-600"
                  }`}
                  aria-hidden="true"
                />
                Risiko {detailRow.risiko}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setDetailRow(null)}
              className="mt-6 w-full rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Tutup
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

