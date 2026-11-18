// src/pages/aparatur/PetaWilayah.jsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Printer,
  ChevronDown,
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
  Loader2,
} from "lucide-react";
import { api } from "../../services/api";

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
/* Fallback data                                                      */
/* ------------------------------------------------------------------ */
const DEFAULT_DUSUN = [
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

function resolveMapStatIcon(stat, isStat1 = true, zona = "hijau") {
  const lbl = String(stat?.label || "").toLowerCase();
  if (isStat1) {
    if (zona === "merah" || zona === "kuning") return Users;
    if (zona === "aman") return ShieldCheck;
    return CircleCheck;
  }
  if (lbl.includes("sanitasi") || lbl.includes("rumah")) return House;
  if (lbl.includes("air") || lbl.includes("sumur")) return Droplets;
  if (lbl.includes("vitamin")) return Pill;
  if (lbl.includes("mpasi") || lbl.includes("balita")) return Baby;
  return Info;
}

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
    <div className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
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
  const zKey = dusun.zona === "aman" ? "aman" : String(dusun.zona).toLowerCase();
  const z = ZONA[zKey] || ZONA.hijau;
  const Stat1 = dusun.stat1?.icon || Users;
  const Stat2 = dusun.stat2?.icon || House;

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
          <p className={`text-xl font-bold ${z.persen}`}>{Number(dusun.prevalensi || 0).toFixed(1)}%</p>
          <p className="text-[11px] text-slate-500">{dusun.prevalensiLabel || "Prevalensi"}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 px-4 py-3 sm:grid-cols-2">
        {[
          { s: dusun.stat1, Icon: Stat1 },
          { s: dusun.stat2, Icon: Stat2 },
        ].map(({ s, Icon }, idx) => (
          <div key={s?.label || idx} className="flex items-center gap-3">
            <Icon className={`h-5 w-5 shrink-0 ${z.persen}`} />
            <div>
              <p className="text-sm font-bold text-slate-900">{s?.nilai || "-"}</p>
              <p className="text-[11px] text-slate-500">{s?.label || "-"}</p>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function ZonaMap({ dusunList, activeId, onHover, onSelect }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-100/80 p-3">
      {/* Kompas & skala */}
      <div className="absolute left-4 top-4 z-10 flex flex-col items-center rounded-xl bg-white/95 px-3 py-2 shadow-sm">
        <Navigation className="h-5 w-5 text-teal-700" />
        <span className="text-[10px] font-bold text-teal-700">U</span>
        <span className="mt-1 text-[9px] text-slate-500">Skala 1:15.000</span>
      </div>

      {/* Hint */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        Sorot dusun untuk detail interaktif
      </div>

      <svg
        viewBox="0 0 860 540"
        className="h-auto w-full max-h-[560px]"
        role="img"
        aria-label="Peta zonasi risiko stunting Desa Sukamaju"
      >
        {/* Jalan & sungai */}
        <path
          d="M30 270 H830"
          className="stroke-slate-300"
          strokeWidth="4"
          strokeDasharray="10 8"
        />
        <path
          d="M410 30 V510"
          className="stroke-slate-300"
          strokeWidth="4"
          strokeDasharray="10 8"
        />
        <path
          d="M60 490 Q 250 350 430 270 T 800 60"
          className="stroke-sky-300 fill-none"
          strokeWidth="6"
        />

        {/* Poligon wilayah dusun */}
        {dusunList.map((d) => {
          const zKey = d.zona === "aman" ? "aman" : String(d.zona).toLowerCase();
          const z = ZONA[zKey] || ZONA.hijau;
          const isActive = activeId === d.id;

          return (
            <g
              key={d.id}
              className="cursor-pointer transition"
              onMouseEnter={() => onHover(d.id)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onSelect(d.id)}
            >
              <polygon
                points={d.polygon}
                className={`${z.polygon} transition-all duration-200 ${
                  isActive ? "stroke-slate-900 stroke-[3px] opacity-100" : "stroke-2 opacity-90 hover:opacity-100"
                }`}
              />

              {/* Titik pusat posyandu */}
              {d.pusat && (
                <>
                  <circle
                    cx={d.pusat.x}
                    cy={d.pusat.y}
                    r={isActive ? 18 : 12}
                    className={`${z.ring} transition-all`}
                  />
                  <circle
                    cx={d.pusat.x}
                    cy={d.pusat.y}
                    r={isActive ? 8 : 5}
                    className={z.dot}
                  />
                </>
              )}

              {/* Label nama dusun */}
              {d.labelPos && (
                <text
                  x={d.labelPos.x}
                  y={d.labelPos.y}
                  textAnchor="middle"
                  className={`text-xs font-bold ${z.fill}`}
                >
                  {d.nama} ({Number(d.prevalensi || 0).toFixed(1)}%)
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Halaman                                                             */
/* ------------------------------------------------------------------ */
export default function PetaWilayah() {
  const [searchParams] = useSearchParams();
  const initialDusunId = searchParams.get("dusunId");

  const [dusunList, setDusunList] = useState(DEFAULT_DUSUN);
  const [activeId, setActiveId] = useState(initialDusunId ? Number(initialDusunId) : 1);
  const [filterZona, setFilterZona] = useState("Semua");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadPeta() {
      setIsLoading(true);
      try {
        const params = {
          zona: filterZona !== "Semua" ? filterZona.toLowerCase() : undefined,
        };

        const res = await api.get("/aparatur/peta-wilayah", params);
        if (!isMounted) return;

        if (res?.success && res?.data?.dusun && Array.isArray(res.data.dusun) && res.data.dusun.length > 0) {
          const mapped = res.data.dusun.map((d) => {
            const zKey = d.zona === "aman" ? "aman" : String(d.zona).toLowerCase();
            return {
              ...d,
              stat1: {
                ...d.stat1,
                icon: resolveMapStatIcon(d.stat1, true, zKey),
              },
              stat2: {
                ...d.stat2,
                icon: resolveMapStatIcon(d.stat2, false, zKey),
              },
            };
          });
          setDusunList(mapped);
          if (initialDusunId && mapped.some((d) => d.id === Number(initialDusunId))) {
            setActiveId(Number(initialDusunId));
          } else if (mapped.length > 0) {
            setActiveId((prev) =>
              mapped.some((d) => d.id === prev) ? prev : mapped[0].id
            );
          }
        }
      } catch {
        // Fallback default
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadPeta();

    return () => {
      isMounted = false;
    };
  }, [filterZona, initialDusunId]);

  const activeDusun = useMemo(
    () => dusunList.find((d) => d.id === activeId) || dusunList[0] || DEFAULT_DUSUN[0],
    [dusunList, activeId]
  );

  const dusunMerah = useMemo(() => dusunList.find((d) => d.zona === "merah") || dusunList[0], [dusunList]);
  const dusunKuning = useMemo(() => dusunList.find((d) => d.zona === "kuning") || dusunList[1], [dusunList]);
  const dusunAman = useMemo(
    () => dusunList.filter((d) => d.zona === "hijau" || d.zona === "aman"),
    [dusunList]
  );

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      {/* Header halaman */}
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
              Peta Sebaran Risiko Geografis
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Visualisasi zonasi spasial stunting dan lokasi posyandu berbasis wilayah dusun.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Zona */}
            <div className="relative">
              <select
                aria-label="Filter Zona"
                value={filterZona}
                onChange={(e) => setFilterZona(e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-3.5 pr-8 text-xs font-semibold text-slate-700 outline-none transition focus:border-teal-600 focus:bg-white"
              >
                <option value="Semua">Semua Zona</option>
                <option value="Merah">Zona Merah</option>
                <option value="Kuning">Zona Kuning</option>
                <option value="Hijau">Zona Hijau</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
            >
              <Printer className="h-4 w-4" />
              Cetak Peta
            </button>
          </div>
        </div>
      </section>

      {/* Kartu ringkasan zona */}
      <section className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
        <ZoneSummaryCard
          label="Zona Merah (Tinggi)"
          labelCls="text-red-700"
          title={dusunMerah ? `${dusunMerah.nama} (${dusunMerah.prevalensi.toFixed(1)}%)` : "-"}
          titleCls="text-red-700"
          titleSize="text-xl"
          icon={TriangleAlert}
          iconCls="bg-red-50 text-red-600"
        >
          <p>
            {dusunMerah?.kasus || 0} Kasus Risiko Tinggi • Prioritas intervensi bantuan PMT & perbaikan sanitasi
          </p>
        </ZoneSummaryCard>

        <ZoneSummaryCard
          label="Zona Kuning (Sedang)"
          labelCls="text-amber-800"
          title={dusunKuning ? `${dusunKuning.nama} (${dusunKuning.prevalensi.toFixed(1)}%)` : "-"}
          titleCls="text-amber-800"
          titleSize="text-xl"
          icon={Info}
          iconCls="bg-amber-50 text-amber-600"
        >
          <p>
            {dusunKuning?.kasus || 0} Kasus Risiko Sedang • Kebutuhan sanitasi & pemantauan air bersih
          </p>
        </ZoneSummaryCard>

        <ZoneSummaryCard
          label="Zona Hijau (Aman)"
          labelCls="text-teal-700"
          title={`${dusunAman.map((d) => d.nama).join(" & ") || "Dusun Terkendali"}`}
          titleCls="text-teal-700"
          titleSize="text-lg"
          icon={BadgeCheck}
          iconCls="bg-teal-50 text-teal-700"
        >
          <p>
            Prevalensi di bawah 8% • Pola asuh & cakupan imunisasi baik, pertahankan edukasi
          </p>
        </ZoneSummaryCard>
      </section>

      {/* Konten utama: Peta + Kartu Dusun */}
      <section className="grid items-stretch gap-5 md:gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* Kolom Peta */}
        <div className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Peta Spasial Desa</h2>
              <p className="mt-1 text-xs text-slate-500">
                Peta interaktif zonasi risiko stunting berbasis batas poligon geografis dusun
              </p>
            </div>

            <ul className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-1.5 text-xs font-semibold">
              {LEGEND.map((item) => (
                <li
                  key={item.label}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 ${item.cls}`}
                >
                  <span className={`h-2 w-2 rounded-full ${item.dot}`} />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 flex flex-1 items-center justify-center">
            {isLoading ? (
              <div className="flex min-h-[360px] w-full flex-col items-center justify-center gap-2 rounded-2xl bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-teal-700" />
                <p className="text-xs text-slate-400">Memuat peta spasial wilayah...</p>
              </div>
            ) : (
              <ZonaMap
                dusunList={dusunList}
                activeId={activeId}
                onHover={setActiveId}
                onSelect={setActiveId}
              />
            )}
          </div>
        </div>

        {/* Kolom Kartu Dusun */}
        <div className="flex h-full flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6 xl:border-0 xl:bg-transparent xl:p-0 xl:shadow-none">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">Rincian Wilayah Dusun</h2>
            <span className="shrink-0 text-xs text-slate-500">
              {dusunList.length} Dusun Terdata
            </span>
          </div>

          <div className="flex-1 space-y-3 xl:max-h-[620px] xl:overflow-y-auto xl:pr-1">
            {dusunList.map((dusun) => (
              <DusunCard
                key={dusun.id}
                dusun={dusun}
                active={activeDusun.id === dusun.id}
                onSelect={setActiveId}
                onHover={setActiveId}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
