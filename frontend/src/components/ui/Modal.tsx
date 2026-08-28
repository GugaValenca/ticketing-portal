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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-slate-950/65"
        aria-label="Close modal"
      />
      <div className="relative mx-auto mt-16 w-full max-w-2xl px-4">
        <div className="rounded-2xl border border-white/15 bg-[#1d1236]/95 shadow-2xl shadow-[#100723]/60 backdrop-blur">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h3 className="text-base font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-sm font-semibold text-slate-100 hover:bg-white/20"
            >
              x
            </button>
          </div>
          <div className="px-5 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
