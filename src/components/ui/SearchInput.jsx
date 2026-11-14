import { Search } from "lucide-react";

/** Input pencarian dengan ikon, dipakai di toolbar filter tabel. */
export default function SearchInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  inputClassName = "text-sm text-slate-700",
  className = "",
}) {
  return (
    <div className={`relative min-w-0 flex-1 ${className}`}>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={`w-full rounded-xl bg-slate-100 py-2.5 pl-10 pr-4 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-teal-700/30 ${inputClassName}`}
      />
    </div>
  );
}
