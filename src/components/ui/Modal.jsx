import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

let lockCount = 0;
let previousOverflow = "";

function lockScroll() {
  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount += 1;
}

function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) document.body.style.overflow = previousOverflow;
}

/**
 * Modal bersama untuk seluruh role.
 * Menangani portal, scroll-lock body, focus trap, Escape, dan restore focus.
 */
export default function Modal({
  open = false,
  labelledBy,
  title,
  description,
  onClose,
  children,
  width = "max-w-lg",
}) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const generatedId = useId();
  const titleId = `${generatedId}-title`;
  const descriptionId = `${generatedId}-description`;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const focusBefore = document.activeElement;
    lockScroll();
    dialogRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = [...dialog.querySelectorAll(FOCUSABLE)].filter(
        (element) => element.getClientRects().length > 0
      );
      if (focusables.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      unlockScroll();
      focusBefore?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(event) => event.target === event.currentTarget && onCloseRef.current?.()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy || (title ? titleId : undefined)}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl outline-none sm:rounded-3xl ${width}`}
      >
        {(title || description) && (
          <div className="border-b border-slate-100 px-6 pb-4 pt-6 sm:px-7">
            {title && (
              <h2 id={titleId} className="text-lg font-bold text-[#0F2942]">
                {title}
              </h2>
            )}
            {description && (
              <p id={descriptionId} className="mt-1.5 text-sm leading-relaxed text-slate-500">
                {description}
              </p>
            )}
          </div>
        )}
        <div className={title || description ? "p-6 sm:p-7" : undefined}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function ModalClose({ onClick, disabled = false, label = "Tutup dialog" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-teal-700 disabled:opacity-50"
    >
      <X className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
