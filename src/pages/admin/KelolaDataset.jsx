import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CircleCheck,
  Download,
  Eye,
  FileSpreadsheet,
  Loader2,
  Mars,
  SlidersHorizontal,
  Trash2,
  UploadCloud,
  Users,
  Venus,
  X,
} from "lucide-react";
import Modal from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";
import StatCard from "../../components/ui/StatCard";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import FilterSelect from "../../components/ui/FilterSelect";
import TableFooter from "../../components/ui/TableFooter";
import EmptyTableRow from "../../components/ui/EmptyTableRow";
import useToast from "../../hooks/useToast";
import { api } from "../../services/api";

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
  "BLT-001,Ahmad Fauzi,12,L,8.4,74.2,Layak Sendiri,PDAM / Perpipaan,Rendah",
  "BLT-002,Siti Aminah,18,P,9.1,79.5,Tidak Layak (BABS),Sumur Terbuka,Tinggi",
].join("\r\n");

const fmt = new Intl.NumberFormat("id-ID");
const fmtDesimal = (n) => (typeof n === "number" ? n.toFixed(1).replace(".", ",") : n || "0");

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
/* Halaman                                                             */
/* ------------------------------------------------------------------ */
export default function KelolaDataset() {
  const [summary, setSummary] = useState(null);
  const [balita, setBalita] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

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
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast, showToast } = useToast();

  const fetchDataset = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const params = {
        search: query.trim() || undefined,
        kategori: kategori !== KATEGORI_OPTIONS[0] ? kategori : undefined,
        urutan,
        page,
        limit: 10,
      };

      const res = await api.get("/admin/dataset", params);
      if (!res?.success || !res?.data) {
        throw new Error(res?.message || "Respons dataset dari server tidak valid.");
      }

      const meta = res.data.meta || {};
      const nextTotalPages = Math.max(1, Number(meta.totalPages) || 1);
      setBalita(Array.isArray(res.data.items) ? res.data.items : []);
      setSummary(res.data.summary || null);
      setTotalCount(Number(meta.total) || 0);
      setTotalPages(nextTotalPages);
      if (page > nextTotalPages) setPage(nextTotalPages);
    } catch (err) {
      setBalita([]);
      setSummary(null);
      setTotalCount(0);
      setTotalPages(1);
      setLoadError(err?.data?.message || err?.message || "Gagal memuat dataset.");
    } finally {
      setIsLoading(false);
    }
  }, [page, query, kategori, urutan]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDataset();
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchDataset]);

  const from = totalCount === 0 ? 0 : (page - 1) * 10 + 1;
  const to = Math.min(page * 10, totalCount);

  const goTo = (target) => setPage(Math.min(Math.max(target, 1), totalPages));

  /* ------------------------- Aksi upload ------------------------- */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      pilihFile(e.dataTransfer.files[0]);
    }
  };

  const pilihFile = (f) => {
    const err = validasiFile(f);
    setFileError(err);
    setFile(err ? null : f);
  };

  const submitUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/admin/dataset/import", formData);

      if (res?.success) {
        showToast(res.message || "File CSV dataset berhasil diimpor.");
        setUploadOpen(false);
        setFile(null);
        fetchDataset();
      } else {
        setFileError(res?.message || "Gagal mengimpor file CSV.");
      }
    } catch (err) {
      setFileError(err?.data?.message || err?.message || "Terjadi kesalahan saat mengunggah file.");
    } finally {
      setIsUploading(false);
    }
  };

  /* ------------------------- Aksi hapus ------------------------- */
  const handleHapusRow = async (item) => {
    const targetId = item.skriningId || item.id;
    if (!window.confirm(`Hapus baris data ${item.namaBalita || item.kepalaKeluarga} dari dataset?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await api.delete(`/admin/dataset/${targetId}`);
      if (res?.success) {
        showToast("Baris dataset berhasil dihapus.");
        fetchDataset();
      } else {
        showToast(res?.message || "Gagal menghapus baris dataset.");
      }
    } catch (err) {
      showToast(err?.data?.message || err?.message || "Gagal menghapus baris dataset.");
    } finally {
      setIsDeleting(false);
    }
  };

  const unduhTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template-dataset-balita.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Template CSV berhasil diunduh.");
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <Toast message={toast} />

      {/* Header halaman */}
      <PageHeader
        chip="Manajemen Dataset Mesin"
        title="Kelola Dataset Balita"
        description="Dataset komprehensif antropometri dan determinan lingkungan untuk pelatihan model Random Forest StuntingGuard."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={unduhTemplate}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-teal-700"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Unduh Template CSV
            </button>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setFileError("");
                setUploadOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              <UploadCloud className="h-4 w-4" aria-hidden="true" />
              Upload Dataset CSV
            </button>
          </div>
        }
      />

      {/* Kartu ringkasan */}
      <section aria-label="Ringkasan dataset" className="grid gap-4 md:grid-cols-3 lg:gap-5">
        <StatCard
          label="Total Data Balita"
          value={fmt.format(summary?.totalData ?? totalCount)}
          caption="Baris sesuai filter"
          icon={<Users className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />}
        />

        <StatCard
          label="Jumlah Fitur Determinan"
          value={summary ? `${summary.jumlahFitur} Fitur` : "—"}
          caption="Variabel Input Prediksi"
          icon={<SlidersHorizontal className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />}
        />

        <StatCard
          label="Status Kesiapan Latih"
          value={summary?.statusDataset || (isLoading ? "Memuat..." : "—")}
          valueClassName="mt-4 text-3xl font-extrabold leading-none tracking-tight text-teal-800 sm:text-4xl"
          caption="Status dari dataset backend"
          icon={<CircleCheck className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />}
        />
      </section>

      {/* Tabel dataset */}
      <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-md">
            <SearchInput
              value={query}
              onChange={(val) => {
                setQuery(val);
                setPage(1);
              }}
              placeholder="Cari kepala keluarga atau ID balita..."
              aria-label="Cari data balita"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-full sm:w-56">
              <FilterSelect
                label="Filter Risiko"
                value={kategori}
                onChange={(val) => {
                  setKategori(val);
                  setPage(1);
                }}
                options={KATEGORI_OPTIONS.map((k) => ({ value: k, label: k }))}
              />
            </div>

            <div className="w-full sm:w-56">
              <FilterSelect
                label="Urutkan Data"
                value={urutan}
                onChange={(val) => {
                  setUrutan(val);
                  setPage(1);
                }}
                options={SORT_OPTIONS}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-xl border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold text-slate-600">
                <tr>
                  <th scope="col" className="px-5 py-3.5">ID / Balita</th>
                  <th scope="col" className="px-3 py-3.5">Kepala Keluarga</th>
                  <th scope="col" className="px-3 py-3.5">Usia / JK</th>
                  <th scope="col" className="px-3 py-3.5">BB / TB</th>
                  <th scope="col" className="px-3 py-3.5">Sanitasi &amp; Air</th>
                  <th scope="col" className="px-3 py-3.5 text-center">Status Risiko</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-slate-500">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-teal-700" />
                      <p className="mt-2">Memuat baris dataset balita...</p>
                    </td>
                  </tr>
                ) : loadError ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-xs text-red-700">
                      <AlertTriangle className="mx-auto h-6 w-6" aria-hidden="true" />
                      <p className="mt-2">{loadError}</p>
                      <button
                        type="button"
                        onClick={fetchDataset}
                        className="mt-3 rounded-lg border border-red-200 px-3 py-1.5 font-semibold hover:bg-red-50"
                      >
                        Coba lagi
                      </button>
                    </td>
                  </tr>
                ) : balita.length === 0 ? (
                  <EmptyTableRow
                    colSpan={7}
                    title="Dataset kosong"
                    description="Tidak ada data balita yang cocok dengan pencarian atau filter ini."
                  />
                ) : (
                  balita.map((b) => (
                    <tr key={b.id} className="transition hover:bg-slate-50/60">
                      <td className="px-5 py-3.5 font-bold text-teal-900">
                        {b.id}
                        <p className="text-[10px] font-normal text-slate-400">{b.namaBalita || "-"}</p>
                      </td>
                      <td className="px-3 py-3.5 font-semibold text-slate-800">{b.kepalaKeluarga}</td>
                      <td className="px-3 py-3.5 text-slate-600">
                        <span className="inline-flex items-center gap-1 font-medium">
                          {b.jk === "P" ? (
                            <Venus className="h-3.5 w-3.5 text-rose-500" />
                          ) : (
                            <Mars className="h-3.5 w-3.5 text-sky-600" />
                          )}
                          {b.usia} Bulan
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-slate-600">
                        {fmtDesimal(b.berat)} kg • {fmtDesimal(b.tinggi)} cm
                      </td>
                      <td className="px-3 py-3.5 text-slate-600">
                        <p className="truncate max-w-[180px]">{b.sanitasi}</p>
                        <p className="truncate max-w-[180px] text-[10px] text-slate-400">{b.air}</p>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            RISIKO_BADGE[b.risiko] || RISIKO_BADGE.Rendah
                          }`}
                        >
                          {b.risiko}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailRow(b)}
                            title="Lihat Detail Balita"
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-teal-800"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleHapusRow(b)}
                            disabled={isDeleting}
                            title="Hapus Dari Dataset"
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <TableFooter
            summary={`Menampilkan ${from}–${to} dari ${fmt.format(totalCount)} data`}
            page={page}
            totalPages={totalPages}
            onChange={goTo}
          />
        </div>
      </section>

      {/* Modal Upload Dataset CSV */}
      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload File Dataset CSV"
        description="Unggah berkas data antropometri balita berformat CSV untuk memperbarui dataset latihan model."
      >
        <form onSubmit={submitUpload} className="space-y-4">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition ${
              dragActive
                ? "border-teal-700 bg-teal-50"
                : fileError
                ? "border-red-300 bg-red-50/50"
                : "border-slate-200 bg-slate-50 hover:bg-slate-100/70"
            }`}
          >
            <UploadCloud className="h-10 w-10 text-teal-700" />
            <p className="mt-3 text-xs font-semibold text-slate-700">
              Tarik &amp; letakkan file CSV Anda di sini, atau{" "}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-teal-800 underline hover:text-teal-900"
              >
                pilih dari komputer
              </button>
            </p>
            <p className="mt-1 text-[11px] text-slate-400">Format .csv maksimal 5 MB</p>

            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={(e) => e.target.files && pilihFile(e.target.files[0])}
              className="hidden"
            />
          </div>

          {fileError && (
            <p className="text-xs font-medium text-red-600">{fileError}</p>
          )}

          {file && !fileError && (
            <div className="flex items-center justify-between rounded-xl bg-teal-50 px-4 py-3 text-xs text-teal-900 border border-teal-200">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-teal-700" />
                <span className="font-semibold">{file.name}</span>
                <span className="text-slate-500">({ukuranFile(file.size)})</span>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-slate-400 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setUploadOpen(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!file || isUploading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-800 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-900 disabled:opacity-75"
            >
              {isUploading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isUploading ? "Mengimpor Data..." : "Impor ke Dataset"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Detail Balita */}
      <Modal
        open={!!detailRow}
        onClose={() => setDetailRow(null)}
        title={`Detail Balita: ${detailRow?.id}`}
        description="Informasi antropometri dan determinan lingkungan dari dataset skrining."
      >
        {detailRow && (
          <div className="space-y-4 text-xs">
            <div className="grid gap-3 sm:grid-cols-2 rounded-xl bg-slate-50 p-4 border border-slate-100">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Kepala Keluarga</p>
                <p className="mt-1 font-bold text-slate-800">{detailRow.kepalaKeluarga}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Nama Balita</p>
                <p className="mt-1 font-bold text-slate-800">{detailRow.namaBalita || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Usia &amp; Jenis Kelamin</p>
                <p className="mt-1 font-semibold text-slate-700">
                  {detailRow.usia} Bulan ({detailRow.jenisKelamin || (detailRow.jk === "P" ? "Perempuan" : "Laki-laki")})
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Status Risiko</p>
                <span
                  className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    RISIKO_BADGE[detailRow.risiko] || RISIKO_BADGE.Rendah
                  }`}
                >
                  {detailRow.risiko}
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 rounded-xl bg-slate-50 p-4 border border-slate-100">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Tinggi Badan</p>
                <p className="mt-1 font-bold text-slate-800">{fmtDesimal(detailRow.tinggi)} cm</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Berat Badan</p>
                <p className="mt-1 font-bold text-slate-800">{fmtDesimal(detailRow.berat)} kg</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Kondisi Sanitasi</p>
                <p className="mt-1 font-semibold text-slate-700">{detailRow.sanitasi}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Sumber Air</p>
                <p className="mt-1 font-semibold text-slate-700">{detailRow.air}</p>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setDetailRow(null)}
                className="rounded-xl bg-teal-800 px-4 py-2 font-semibold text-white hover:bg-teal-900"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
