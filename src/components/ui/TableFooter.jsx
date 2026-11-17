import { ChevronLeft, ChevronRight } from "lucide-react";

function buildPages(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1);
  if (current <= 3) return [1, 2, 3, "…", total];
  if (current >= total - 2) return [1, "…", total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

/**
 * Footer tabel: ringkasan jumlah baris + paginasi bergaya admin (teal).
 * `summary` adalah node teks ringkasan, mis. "Menampilkan 1–6 dari 12 akun".
 */
export default function TableFooter({
  summary,
  page,
  totalPages,
  onChange,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col gap-3 px-5 py-4 text-xs text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between ${className}`}
    >
      <div className="min-w-0">{summary}</div>

      <nav aria-label="Paginasi" className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          aria-label="Halaman sebelumnya"
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 font-semibold text-slate-600 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        {buildPages(page, totalPages).map((target, index) =>
          target === "…" ? (
            <span key={`gap-${index}`} className="px-1 text-slate-400">
              …
            </span>
          ) : (
            <button
              key={target}
              type="button"
              onClick={() => onChange(target)}
              aria-current={target === page ? "page" : undefined}
              className={`min-w-8 rounded-md px-2.5 py-1.5 font-bold transition focus-visible:outline-2 focus-visible:outline-teal-700 ${
                target === page
                  ? "bg-teal-800 text-white"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {target}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Halaman berikutnya"
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 font-semibold text-slate-600 transition hover:bg-white focus-visible:outline-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="hidden sm:inline">Berikutnya</span>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
}
