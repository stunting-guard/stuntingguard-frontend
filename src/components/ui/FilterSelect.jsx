import { ChevronDown } from "lucide-react";

/**
 * Select filter dengan chevron. `inline` menampilkan label di samping select,
 * sedangkan mode default menyembunyikan label secara visual (sr-only).
 */
export default function FilterSelect({
  label,
  value,
  onChange,
  options,
  inline = false,
  className = "",
  selectClassName = "",
}) {
  const select = (
    <span className={inline ? "relative" : "relative block"}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`appearance-none rounded-xl bg-slate-100 py-2.5 pl-3.5 pr-9 text-xs font-bold text-slate-800 outline-none transition focus:ring-2 focus:ring-teal-700/30 ${
          inline ? "" : "w-full"
        } ${selectClassName}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
    </span>
  );

  if (inline) {
    return (
      <label className={`flex items-center gap-2 text-xs font-semibold text-slate-600 ${className}`}>
        <span>{label}</span>
        {select}
      </label>
    );
  }

  return (
    <label className={`relative block ${className}`}>
      <span className="sr-only">{label}</span>
      {select}
    </label>
  );
}
