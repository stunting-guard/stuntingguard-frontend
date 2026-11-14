/**
 * Kartu statistik/ringkasan bersama untuk dashboard semua role.
 *
 * Props:
 * - label: judul kecil uppercase
 * - icon: node ikon (opsional)
 * - iconWrapClassName: kelas pembungkus ikon; null = render ikon langsung
 * - value / caption: konten angka + keterangan (bisa dilewati jika memakai children)
 * - children: konten kustom di bawah label (mis. deretan chip)
 * - footer: baris catatan tambahan di bawah kartu
 * - footerBorder: tampilkan garis pemisah sebelum footer
 */
export default function StatCard({
  label,
  icon,
  iconWrapClassName = "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700",
  value,
  valueClassName = "mt-4 text-4xl font-extrabold leading-none tracking-tight text-[#0F2942] sm:text-[40px]",
  caption,
  captionClassName = "mt-1.5 text-sm text-slate-500",
  children,
  footer,
  footerClassName = "pt-5",
  footerBorder = false,
  className = "",
}) {
  return (
    <article
      className={`flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm sm:p-6 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">{label}</p>
        {icon &&
          (iconWrapClassName ? (
            <span className={iconWrapClassName}>{icon}</span>
          ) : (
            icon
          ))}
      </div>

      {children ?? (
        <>
          {value !== undefined && <p className={valueClassName}>{value}</p>}
          {caption && <p className={captionClassName}>{caption}</p>}
        </>
      )}

      {footer !== undefined && footer !== null && (
        <div className={`mt-auto ${footerBorder ? "border-t border-slate-100 pt-3.5" : footerClassName}`}>
          {footer}
        </div>
      )}
    </article>
  );
}
