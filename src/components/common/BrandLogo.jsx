import { HeartHandshake } from "lucide-react";

export default function BrandLogo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Ganti dengan <img src={logo} /> jika aset logo asli sudah ada */}
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1B8A5A] text-white sm:h-11 sm:w-11">
        <HeartHandshake className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
      </span>
      <div className="leading-tight">
        <p className="text-lg font-bold text-[#1B8A5A] sm:text-xl">StuntingGuard.</p>
        <p className="hidden text-[7px] font-medium tracking-wide text-[#0F2942]/70 sm:block">
          SEMANGAT MEMBANGUN KELUARGA BERKUALITAS
        </p>
      </div>
    </div>
  );
}
