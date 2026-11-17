import { useCallback, useEffect, useRef, useState } from "react";

/**
 * State toast + timer yang otomatis dibersihkan saat komponen di-unmount.
 * Toast baru akan mereset durasi toast sebelumnya.
 */
export default function useToast(duration = 3200) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const clearToast = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    setToast(null);
  }, []);

  const showToast = useCallback(
    (message) => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      setToast(message);
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        setToast(null);
      }, duration);
    },
    [duration]
  );

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    []
  );

  return { toast, showToast, clearToast };
}
