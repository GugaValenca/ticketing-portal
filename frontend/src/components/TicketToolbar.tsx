import { cx } from "../lib/cx";
import type { PageSize, SortKey } from "../types";

type StatusFilter = "all" | "open" | "in_progress" | "resolved" | "closed";
type PriorityFilter = "all" | "low" | "medium" | "high" | "urgent";

export function TicketToolbar({
  query,
  statusFilter,
  priorityFilter,
  sortKey,
  pageSize,
  hideResolved,
  page,
  totalPages,
  onQueryChange,
  onStatusFilterChange,
  onPriorityFilterChange,
  onSortKeyChange,
  onPageSizeChange,
  onToggleHideResolved,
  onResetFilters,
  onPrevPage,
  onNextPage,
}: {
  query: string;
  statusFilter: StatusFilter;
  priorityFilter: PriorityFilter;
  sortKey: SortKey;
  pageSize: PageSize;
  hideResolved: boolean;
  page: number;
  totalPages: number;
  onQueryChange: (value: string) => void;
  onStatusFilterChange: (value: StatusFilter) => void;
  onPriorityFilterChange: (value: PriorityFilter) => void;
  onSortKeyChange: (value: SortKey) => void;
  onPageSizeChange: (value: PageSize) => void;
  onToggleHideResolved: () => void;
  onResetFilters: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}) {
  return (
    <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 sm:p-4">
      <div className="grid gap-3 md:grid-cols-12">
        <div className="md:col-span-5">
          <label htmlFor="ticket-search" className="text-xs font-semibold text-indigo-700">
            Search tickets
          </label>
          <input
            id="ticket-search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by title or description..."
            className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
          />
          <div className="mt-1 text-[11px] text-slate-500">
            Results update after 300ms to keep interactions smooth.
          </div>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="ticket-status-filter" className="text-xs font-semibold text-indigo-700">
            Status
          </label>
          <select
            id="ticket-status-filter"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
            className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
          >
            <option value="all">All</option>
            <option value="open">open</option>
            <option value="in_progress">in_progress</option>
            <option value="resolved">resolved</option>
            <option value="closed">closed</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="ticket-priority-filter" className="text-xs font-semibold text-indigo-700">
            Priority
          </label>
          <select
            id="ticket-priority-filter"
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value as PriorityFilter)}
            className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
          >
            <option value="all">All</option>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="urgent">urgent</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <label htmlFor="ticket-sort" className="text-xs font-semibold text-indigo-700">
            Sort by
          </label>
          <select
            id="ticket-sort"
            value={sortKey}
            onChange={(e) => onSortKeyChange(e.target.value as SortKey)}
            className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 md:col-span-12 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <label htmlFor="ticket-page-size" className="text-xs font-semibold text-indigo-700">
              Page size
            </label>
            <select
              id="ticket-page-size"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value) as PageSize)}
              className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>

            <button
              onClick={onResetFilters}
              className="h-10 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reset filters
            </button>

            <button
              onClick={onToggleHideResolved}
              className={cx(
                "group inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/60",
                hideResolved
                  ? "border-violet-400 bg-violet-600 text-white shadow-sm shadow-violet-900/20"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
              )}
              aria-pressed={hideResolved}
              aria-label="Toggle hide resolved tickets"
            >
              <span
                className={cx(
                  "relative h-5 w-9 rounded-full transition",
                  hideResolved ? "bg-white/25" : "bg-slate-300",
                )}
                aria-hidden="true"
              >
                <span
                  className={cx(
                    "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition",
                    hideResolved ? "left-4" : "left-0.5",
                  )}
                />
              </span>
              <span>{hideResolved ? "Resolved hidden" : "Hide resolved"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={onPrevPage}
              className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm text-slate-600">
              Page <b>{page}</b> of <b>{totalPages}</b>
            </span>
            <button
              disabled={page >= totalPages}
              onClick={onNextPage}
              className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
