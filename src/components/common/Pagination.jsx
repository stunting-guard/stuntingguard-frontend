import { ChevronLeft, ChevronRight } from "lucide-react";

function getPages(page, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

/** variant="text" → tombol "Sebelumnya / Selanjutnya"; variant="icon" → chevron */
export default function Pagination({ page, totalPages, onChange, variant = "text" }) {
  const base =
    "flex h-8 min-w-8 items-center justify-center rounded-lg px-2.5 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-[#1B8A5A] disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1.5">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className={`${base} border border-slate-200 bg-white text-[#0F2942] hover:bg-slate-50`}
        aria-label="Halaman sebelumnya"
      >
        {variant === "icon" ? <ChevronLeft className="h-4 w-4" /> : "Sebelumnya"}
      </button>

      {getPages(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-xs text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${base} ${
              p === page
                ? "bg-[#0F2942] text-white"
                : "border border-slate-200 bg-white text-[#0F2942] hover:bg-slate-50"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className={`${base} border border-slate-200 bg-white text-[#0F2942] hover:bg-slate-50`}
        aria-label="Halaman berikutnya"
      >
        {variant === "icon" ? <ChevronRight className="h-4 w-4" /> : "Selanjutnya"}
      </button>
    </nav>
  );
}
