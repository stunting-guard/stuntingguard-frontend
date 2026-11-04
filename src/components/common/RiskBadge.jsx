const STYLE = {
  Tinggi: { wrap: "bg-red-50 text-red-600", dot: "bg-red-500" },
  Sedang: { wrap: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  Rendah: { wrap: "bg-emerald-50 text-emerald-700", dot: "bg-[#1B8A5A]" },
};

export default function RiskBadge({ level }) {
  const s = STYLE[level] ?? STYLE.Rendah;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.wrap}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {level}
    </span>
  );
}
