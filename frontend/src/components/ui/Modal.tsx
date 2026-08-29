import { useId, useRef } from "react";
import { useDialogBehavior } from "../../hooks/useDialogBehavior";

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();

  useDialogBehavior(open, onClose, dialogRef);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-slate-950/65"
        aria-label="Close dialog"
      />
      <div className="relative mx-auto mt-16 w-full max-w-2xl px-4">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="rounded-2xl border border-white/15 bg-[#1d1236]/95 shadow-2xl shadow-[#100723]/60 backdrop-blur outline-none"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h3 id={titleId} className="text-base font-semibold text-white">
              {title}
            </h3>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-lg font-semibold text-slate-100 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/60"
            >
              &times;
            </button>
          </div>
          <div className="px-5 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
