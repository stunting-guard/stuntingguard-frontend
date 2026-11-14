export default function BrandLogo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 44 44"
        className="h-10 w-10 shrink-0 sm:h-11 sm:w-11"
        role="img"
        aria-label="Logo StuntingGuard"
      >
        <path
          d="M22 3.2 41 18.1V39a2.4 2.4 0 0 1-2.4 2.4H5.4A2.4 2.4 0 0 1 3 39V18.1Z"
          fill="#0F8A73"
        />
        <circle cx="16.5" cy="23.6" r="4.2" fill="#FFFFFF" />
        <path d="M9.6 35.9c0-3.8 3.1-6.9 6.9-6.9s6.9 3.1 6.9 6.9Z" fill="#FFFFFF" />
        <circle cx="29.4" cy="27.2" r="3.1" fill="#FFFFFF" />
        <path d="M23.6 35.9c0-3.2 2.6-5.8 5.8-5.8s5.8 2.6 5.8 5.8Z" fill="#FFFFFF" />
      </svg>
      <div className="leading-tight">
        <p className="text-lg font-bold tracking-tight text-[#0F2942] sm:text-xl">
          StuntingGuard<span className="text-[#0F8A73]">.</span>
        </p>
        <p className="hidden text-[7px] font-semibold uppercase tracking-[0.09em] text-[#0F8A73]/80 sm:block">
          Semangat Membangun Keluarga Berkualitas
        </p>
      </div>
    </div>
  );
}
