import { Fragment } from "react";
import { ChevronRight } from "lucide-react";

/**
 * Header halaman admin/role: breadcrumb opsional, judul, deskripsi, dan aksi.
 */
export default function PageHeader({ breadcrumb, title, description, actions }) {
  return (
    <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {breadcrumb?.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em]"
          >
            {breadcrumb.map((item, index) => (
              <Fragment key={item.label}>
                {index > 0 && (
                  <ChevronRight className="h-3 w-3 text-slate-300" aria-hidden="true" />
                )}
                <span className={index === breadcrumb.length - 1 ? "text-slate-500" : "text-slate-400"}>
                  {item.label}
                </span>
              </Fragment>
            ))}
          </nav>
        )}
        <h1
          className={`text-2xl font-extrabold tracking-tight text-[#0F2942] sm:text-[28px] ${
            breadcrumb?.length > 0 ? "mt-2" : ""
          }`}
        >
          {title}
        </h1>
        {description && <p className="mt-1 max-w-3xl text-sm text-slate-500">{description}</p>}
      </div>

      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </section>
  );
}
