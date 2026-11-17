/** Baris `<tr>` kosong untuk tabel saat filter tidak menghasilkan data. */
export default function EmptyTableRow({ colSpan, icon: Icon, title, description }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center sm:py-14">
        {Icon && <Icon className="mx-auto h-8 w-8 text-slate-300" aria-hidden="true" />}
        <p className="mt-3 text-sm font-semibold text-slate-700">{title}</p>
        {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      </td>
    </tr>
  );
}
