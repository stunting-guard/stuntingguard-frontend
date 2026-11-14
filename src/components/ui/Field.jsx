export const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-700/20 sm:py-2.5";

/** Grup label + kontrol form + pesan error, dipakai di modal/form admin. */
export default function Field({ id, label, error, children, className = "" }) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="text-[11px] font-bold uppercase tracking-wide text-slate-500"
      >
        {label}
      </label>
      <div className="mt-1 sm:mt-1.5">{children}</div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-[11px] font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
