import { useCallback, useEffect, useRef } from "react";

/**
 * setTimeout yang aman: semua timer dibatalkan saat komponen di-unmount.
 * Dipakai untuk simulasi proses async (simpan, hapus, unggah, latih model).
 */
export default function useSafeTimeout() {
  const timersRef = useRef(new Set());

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
    },
    []
  );

  return useCallback((callback, delay) => {
    const timer = window.setTimeout(() => {
      timersRef.current.delete(timer);
      callback();
    }, delay);
    timersRef.current.add(timer);
    return timer;
  }, []);
}
