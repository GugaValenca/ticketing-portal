import { cx } from "../../lib/cx";

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const label = s.replaceAll("_", " ");
  const style =
    s === "open"
      ? "border-sky-900/80 bg-sky-600 text-white shadow-sm shadow-sky-900/30"
      : s === "in_progress"
        ? "border-amber-900/80 bg-amber-500 text-slate-950 shadow-sm shadow-amber-900/25"
        : s === "resolved"
          ? "border-emerald-900/80 bg-emerald-600 text-white shadow-sm shadow-emerald-900/30"
          : s === "closed"
            ? "border-slate-900/80 bg-slate-600 text-white shadow-sm shadow-slate-900/30"
            : "border-slate-900/80 bg-slate-600 text-white shadow-sm shadow-slate-900/30";

  return (
    <span
      className={cx(
        "inline-flex min-w-[96px] items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.04em] leading-none ring-1 ring-black/10 transition-all duration-150",
        style,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const p = priority.toLowerCase();
  const style =
    p === "urgent"
      ? "border-rose-900/80 bg-rose-600 text-white shadow-sm shadow-rose-900/30"
      : p === "high"
        ? "border-orange-900/80 bg-orange-500 text-slate-950 shadow-sm shadow-orange-900/25"
        : p === "medium"
          ? "border-yellow-900/80 bg-yellow-400 text-slate-950 shadow-sm shadow-yellow-900/25"
          : "border-indigo-900/80 bg-indigo-600 text-white shadow-sm shadow-indigo-900/30";

  return (
    <span
      className={cx(
        "inline-flex min-w-[96px] items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.04em] leading-none ring-1 ring-black/10 transition-all duration-150",
        style,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
      <span>{p}</span>
    </span>
  );
}

export function IdPill({ id }: { id: number }) {
  return (
    <span className="inline-flex min-w-[56px] items-center justify-center rounded-lg border border-violet-900/80 bg-violet-600 px-2.5 py-1.5 text-[11px] font-bold tracking-[0.04em] text-white shadow-sm shadow-violet-900/30 ring-1 ring-black/10">
      #{id}
    </span>
  );
}

export function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-indigo-100 bg-white px-3 py-2 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-indigo-500">
        {label}
      </div>
      <div className="mt-0.5 text-base font-semibold text-slate-900">{value}</div>
    </div>
  );
}
