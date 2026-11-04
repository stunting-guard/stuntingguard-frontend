// src/pages/aparatur/PetaWilayah.jsx
import { useMemo, useState } from "react";
import {
  Printer,
  ChevronDown,
  Compass,
  TriangleAlert,
  Info,
  BadgeCheck,
  Users,
  House,
  Droplets,
  CircleCheck,
  Pill,
  ShieldCheck,
  Baby,
  Navigation,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Style per zona (class ditulis penuh agar terdeteksi Tailwind v4)     */
/* ------------------------------------------------------------------ */
const ZONA = {
  merah: {
    label: "Zona Merah",
    badge: "bg-red-100 text-red-700",
    polygon: "fill-red-100 stroke-red-300",
    dot: "fill-red-500",
    ring: "fill-red-500/20",
    card: "border-l-red-600",
    persen: "text-red-700",
    nama: "text-red-700",
    fill: "fill-red-700",
  },
  kuning: {
    label: "Zona Kuning",
    badge: "bg-amber-100 text-amber-800",
    polygon: "fill-amber-100 stroke-amber-300",
    dot: "fill-amber-500",
    ring: "fill-amber-500/20",
    card: "border-l-amber-500",
    persen: "text-amber-800",
    nama: "text-amber-800",
    fill: "fill-amber-800",
  },
  hijau: {
    label: "Zona Hijau",
    badge: "bg-teal-100 text-teal-700",
    polygon: "fill-teal-100 stroke-teal-300",
    dot: "fill-teal-700",
    ring: "fill-teal-700/20",
    card: "border-l-teal-700",
    persen: "text-teal-700",
    nama: "text-teal-700",
    fill: "fill-teal-700",
  },
  aman: {
    label: "Zona Hijau (Aman)",
    badge: "bg-emerald-100 text-emerald-700",
    polygon: "fill-emerald-100 stroke-emerald-300",
    dot: "fill-emerald-500",
    ring: "fill-emerald-500/20",
    card: "border-l-emerald-500",
    persen: "text-emerald-600",
    nama: "text-emerald-600",
    fill: "fill-emerald-600",
  },
};

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */
const MOCK_DUSUN = [
  {
    id: 1,
    nama: "Dusun Melati",
    zona: "merah",
    rw: "RW 01",
    posyandu: "Posyandu Melati Indah",
    kapasitas: 120,
    prevalensi: 20.0,
    prevalensiLabel: "Prevalensi Stunting",
    kasus: 24,
    stat1: { icon: Users, nilai: "24 Balita", label: "Kasus Risiko Tinggi" },
    stat2: { icon: House, nilai: "14 Rumah", label: "Sanitasi Kurang Layak" },
    polygon: "110,105 400,100 410,230 330,300 100,215",
    pusat: { x: 255, y: 175 },
    labelPos: { x: 255, y: 330 },
  },
  {
    id: 2,
    nama: "Dusun Mawar",
    zona: "kuning",
    rw: "RW 02",
    posyandu: "Posyandu Mawar Asri",
    kapasitas: 110,
    prevalensi: 16.4,
    prevalensiLabel: "Prevalensi Stunting",
    kasus: 18,
    stat1: { icon: Users, nilai: "18 Balita", label: "Kasus Risiko Sedang" },
    stat2: { icon: Droplets, nilai: "9 Titik", label: "Kekurangan Air Bersih" },
    polygon: "420,100 735,120 750,235 600,255 480,330 415,240",
    pusat: { x: 575, y: 185 },
    labelPos: { x: 640, y: 275 },
  },
  {
    id: 3,
    nama: "Dusun Kenanga",
    zona: "hijau",
    rw: "RW 03",
    posyandu: "Posyandu Kenanga Harapan",
    kapasitas: 105,
    prevalensi: 7.6,
    prevalensiLabel: "Prevalensi Rendah",
    kasus: 8,
    stat1: { icon: CircleCheck, nilai: "8 Kasus", label: "Risiko Ringan / Terpantau" },
    stat2: { icon: Pill, nilai: "96%", label: "Cakupan Vitamin A" },
    polygon: "130,305 345,320 420,380 405,470 205,480 128,390",
    pusat: { x: 265, y: 395 },
    labelPos: { x: 300, y: 495 },
  },
  {
    id: 4,
    nama: "Dusun Cempaka",
    zona: "aman",
    rw: "RW 04",
    posyandu: "Posyandu Cempaka Putih",
    kapasitas: 95,
    prevalensi: 3.8,
    prevalensiLabel: "Prevalensi Minimal",
    kasus: 4,
    stat1: { icon: ShieldCheck, nilai: "4 Kasus", label: "Status Aman Terkendali" },
    stat2: { icon: Baby, nilai: "98.2%", label: "Kepatuhan MPASI" },
    polygon: "425,400 535,325 745,340 730,450 480,480 395,415",
    pusat: { x: 575, y: 400 },
    labelPos: { x: 650, y: 495 },
  },
];

const LEGEND = [
  { label: "Zona Merah (Tinggi)", cls: "bg-red-50 text-red-700", dot: "bg-red-500" },
  { label: "Zona Kuning (Sedang)", cls: "bg-amber-50 text-amber-800", dot: "bg-amber-500" },
  { label: "Zona Hijau (Rendah/Aman)", cls: "bg-teal-50 text-teal-700", dot: "bg-teal-700" },
];

/* ------------------------------------------------------------------ */
/* Sub-komponen lokal                                                  */
/* ------------------------------------------------------------------ */
function ZoneSummaryCard({
  label,
  labelCls,
  title,
  titleCls,
  titleSize = "text-2xl",
  icon: Icon,
  iconCls,
  children,
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className={`text-[11px] font-bold uppercase tracking-wide ${labelCls}`}>{label}</p>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconCls}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className={`mt-3 font-bold ${titleSize} ${titleCls}`}>{title}</p>
      <div className="mt-1 text-xs text-slate-600">{children}</div>
    </div>
  );
}

function DusunCard({ dusun, active, onSelect, onHover }) {
  const z = ZONA[dusun.zona];
  const Stat1 = dusun.stat1.icon;
  const Stat2 = dusun.stat2.icon;

  return (
    <article
      onMouseEnter={() => onHover(dusun.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(dusun.id)}
      className={`cursor-pointer rounded-2xl border border-l-4 bg-white p-5 shadow-sm transition ${z.card} ${
        active ? "border-slate-300 ring-2 ring-teal-700/20" : "border-slate-100"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">{dusun.nama}</h3>
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${z.badge}`}>
              {dusun.zona === "aman" ? "Zona Hijau (Aman)" : z.label}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {dusun.rw} • {dusun.posyandu} (Kapasitas: {dusun.kapasitas} Balita)
          </p>
        </div>
        <div className="text-right">
          <p className={`text-xl font-bold ${z.persen}`}>{dusun.prevalensi.toFixed(1)}%</p>
          <p className="text-[11px] text-slate-500">{dusun.prevalensiLabel}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 px-4 py-3 sm:grid-cols-2">
        {[
          { s: dusun.stat1, Icon: Stat1 },
          { s: dusun.stat2, Icon: Stat2 },
        ].map(({ s, Icon }) => (
          <div key={s.label} className="flex items-center gap-3">
            <Icon className={`h-5 w-5 shrink-0 ${z.persen}`} />
            <div>
              <p className="text-sm font-bold text-slate-900">{s.nilai}</p>
              <p className="text-[11px] text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function ZonaMap({ dusunList, activeId, onHover, onSelect }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-100/80 p-3">
      {/* Kompas & skala */}
      <div className="absolute left-4 top-4 z-10 flex flex-col items-center rounded-xl bg-white px-3 py-2 shadow-sm">
        <Navigation className="h-5 w-5 text-teal-700" />
        <span className="text-[10px] font-bold text-teal-700">U</span>
        <span className="mt-1 text-[9px] text-slate-500">Skala 1:15.000</span>
      </div>

      {/* Hint */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        Sorot dusun untuk detail interaktif
      </div>

      <svg
        viewBox="0 0 860 540"
        className="h-auto w-full"
        role="img"
        aria-label="Peta zonasi risiko stunting Desa Sukamaju"
      >
        {/* Jalan & sungai */}
        <path
          d="M30 270 H830"
          className="stroke-slate-300"
          strokeWidth="4"
          strokeDasharray="10 8"
          fill="none"
        />
        <path
          d="M405 60 C 395 160, 420 220, 405 300 S 395 440, 410 520"
          className="stroke-sky-300"
          strokeWidth="6"
          strokeDasharray="6 6"
          fill="none"
        />

        {dusunList.map((d) => {
          const z = ZONA[d.zona];
          const dim = activeId !== null && activeId !== d.id;
          return (
            <g
              key={d.id}
              tabIndex={0}
              role="button"
              aria-label={`${d.nama}, ${d.kasus} kasus`}
              onMouseEnter={() => onHover(d.id)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(d.id)}
              onBlur={() => onHover(null)}
              onClick={() => onSelect(d.id)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect(d.id)}
              className={`cursor-pointer outline-none transition-opacity ${dim ? "opacity-40" : "opacity-100"}`}
            >
              <polygon
                points={d.polygon}
                strokeWidth={activeId === d.id ? 3 : 1.5}
                strokeLinejoin="round"
                className={z.polygon}
              />
              <circle cx={d.pusat.x} cy={d.pusat.y - 20} r="30" className={z.ring} />
              <circle cx={d.pusat.x} cy={d.pusat.y - 20} r="18" className={z.dot} />
              <rect
                x={d.pusat.x - 45}
                y={d.pusat.y + 8}
                width="90"
                height="26"
                rx="13"
                className="fill-white"
              />
              <text
                x={d.pusat.x}
                y={d.pusat.y + 25}
                textAnchor="middle"
                className="fill-slate-800 text-[12px] font-bold"
              >
                {d.kasus} Balita
              </text>
              <text
                x={d.labelPos.x}
                y={d.labelPos.y}
                textAnchor="middle"
                className={`text-[13px] font-bold ${z.fill}`}
              >
                {d.nama}
              </text>
            </g>
          );
        })}

        {/* Titik pusat desa */}
        <rect x="392" y="257" width="26" height="26" rx="6" className="fill-teal-800" />
        <circle cx="405" cy="270" r="4" className="fill-white" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Halaman                                                             */
/* ------------------------------------------------------------------ */
export default function PetaWilayah() {
  const [dusunList] = useState(MOCK_DUSUN);
  const [filter, setFilter] = useState("semua"); // "semua" | id dusun (string)
  const [hoverId, setHoverId] = useState(null);

  const selectedId = filter === "semua" ? null : Number(filter);
  const activeId = hoverId ?? selectedId;

  const visibleDusun = useMemo(
    () => (selectedId === null ? dusunList : dusunList.filter((d) => d.id === selectedId)),
    [dusunList, selectedId]
  );

  const merah = dusunList.find((d) => d.zona === "merah");
  const kuning = dusunList.find((d) => d.zona === "kuning");
  const hijau = dusunList.filter((d) => d.zona === "hijau" || d.zona === "aman");

  const handleSelect = (id) => setFilter((prev) => (prev === String(id) ? "semua" : String(id)));

  return (
    <div className="space-y-6">
      {/* Header halaman */}
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide"
            >
              <span className="text-teal-700">Aparatur Desa</span>
              <span className="text-slate-400">&gt;</span>
              <span className="text-red-600">Peta Wilayah</span>
            </nav>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              Peta Risiko Stunting Wilayah Desa
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                aria-label="Pilih dusun"
                className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-10 text-sm font-semibold text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
              >
                <option value="semua">Pilih Dusun: Semua Wilayah</option>
                {dusunList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
            >
              <Printer className="h-4 w-4" />
              Cetak Peta Wilayah
            </button>
          </div>
        </div>
      </section>

      {/* Ringkasan zona */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ZoneSummaryCard
          label="Cakupan Wilayah"
          labelCls="text-slate-600"
          title={`${dusunList.length} Dusun`}
          titleCls="text-slate-900"
          icon={Compass}
          iconCls="bg-slate-100 text-slate-600"
        >
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-700" />
            100% Terpetakan Secara Spasial
          </span>
        </ZoneSummaryCard>

        <ZoneSummaryCard
          label="Zona Merah (Prioritas 1)"
          labelCls="text-red-700"
          title={merah.nama}
          titleCls="text-red-700"
          icon={TriangleAlert}
          iconCls="bg-red-50 text-red-600"
        >
          <b className="text-red-700">{merah.kasus} Balita</b> Terkonfirmasi Risiko Tinggi
        </ZoneSummaryCard>

        <ZoneSummaryCard
          label="Zona Kuning (Prioritas 2)"
          labelCls="text-amber-800"
          title={kuning.nama}
          titleCls="text-amber-800"
          icon={Info}
          iconCls="bg-amber-50 text-amber-600"
        >
          <b className="text-amber-800">{kuning.kasus} Balita</b> Tergolong Risiko Sedang
        </ZoneSummaryCard>

        <ZoneSummaryCard
          label="Zona Hijau (Aman)"
          labelCls="text-teal-700"
          title={`Dusun ${hijau.map((d) => d.nama.replace("Dusun ", "")).join(" & ")}`}
          titleCls="text-slate-900"
          titleSize="text-xl"
          icon={BadgeCheck}
          iconCls="bg-teal-50 text-teal-700"
        >
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-700" />
            Status Terkendali • Prevalensi Rendah
          </span>
        </ZoneSummaryCard>
      </section>

      {/* Peta + daftar dusun */}
      <section className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <div className="self-start rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Peta Zonasi Dusun Desa Sukamaju</h2>
              <p className="mt-1 text-xs text-slate-500">
                Luas Total Wilayah: 4.82 km² • Posyandu Utama {dusunList.length} Unit
              </p>
            </div>
            <ul className="flex flex-wrap gap-2">
              {LEGEND.map((l) => (
                <li
                  key={l.label}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${l.cls}`}
                >
                  <span className={`h-2 w-2 rounded-full ${l.dot}`} />
                  {l.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <ZonaMap
              dusunList={dusunList}
              activeId={activeId}
              onHover={setHoverId}
              onSelect={handleSelect}
            />
          </div>
        </div>

        <div className="space-y-4">
          {visibleDusun.map((d) => (
            <DusunCard
              key={d.id}
              dusun={d}
              active={activeId === d.id}
              onSelect={handleSelect}
              onHover={setHoverId}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
