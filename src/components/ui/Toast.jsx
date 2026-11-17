import { CircleCheck } from "lucide-react";

/** Notifikasi singkat di atas bottom-nav (mobile) atau kanan bawah (desktop). */
export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 left-1/2 z-[60] flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-full bg-[#0F2942] px-4 py-2.5 text-xs font-semibold text-white shadow-lg md:bottom-8 md:left-auto md:right-8 md:translate-x-0"
    >
      <CircleCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{message}</span>
    </div>
  );
}
