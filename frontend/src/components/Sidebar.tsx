import { cx } from "../lib/cx";
import { BrandMark } from "./BrandMark";
import { COMPANY_NAME } from "../branding";
import type { SidebarFilter } from "../types";

const NAV_ITEMS: Array<{ key: SidebarFilter; label: string }> = [
  { key: "inbox", label: "Inbox" },
  { key: "my_tickets", label: "My tickets" },
  { key: "unassigned", label: "Unassigned" },
  { key: "overdue", label: "Overdue" },
];

export function Sidebar({
  username,
  active,
  counts,
  onSelect,
}: {
  username?: string;
  active: SidebarFilter;
  counts: Record<SidebarFilter, number>;
  onSelect: (filter: SidebarFilter) => void;
}) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#160c2d]/90 md:flex md:flex-col">
      <div className="border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <BrandMark className="h-7 w-7" />
          <div>
            <div className="text-sm font-semibold text-indigo-100">{COMPANY_NAME}</div>
            <div className="mt-0.5 text-[11px] text-slate-300">Service Desk</div>
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-300">{username}</div>
      </div>

      <div className="px-3 py-4">
        <p className="px-2 text-[11px] font-semibold uppercase tracking-wide text-indigo-200/80">
          Tickets
        </p>
        <nav className="mt-2 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={cx(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition",
                active === item.key
                  ? "bg-white/10 text-white"
                  : "text-slate-200 hover:bg-white/10",
              )}
            >
              <span>{item.label}</span>
              <span
                className={
                  item.key === "inbox"
                    ? "rounded-md bg-indigo-500/30 px-1.5 py-0.5 text-xs font-semibold"
                    : "text-xs text-indigo-200"
                }
              >
                {counts[item.key]}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
