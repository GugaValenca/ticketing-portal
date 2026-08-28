import { IdPill, PriorityBadge, StatusBadge } from "./ui/Badges";
import type { Ticket } from "../types";

export function TicketList({
  tickets,
  onSelect,
}: {
  tickets: Ticket[];
  onSelect: (ticket: Ticket) => void;
}) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-700">
        No tickets match the current filters.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {tickets.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t)}
          className="group block w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/55 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-50"
          type="button"
        >
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 group-hover:-translate-y-[1px] group-hover:border-violet-300 group-hover:shadow-md group-focus-visible:-translate-y-[1px] group-focus-visible:border-violet-300 group-focus-visible:shadow-md">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <IdPill id={t.id} />
                  <h3 className="text-base font-semibold text-slate-900">{t.title}</h3>
                </div>

                {t.description ? (
                  <p className="mt-2 text-sm text-slate-700">{t.description}</p>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">No description provided.</p>
                )}

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span>
                    requester:{" "}
                    <span className="font-semibold text-slate-700">
                      {t.requester_username ?? "-"}
                    </span>
                  </span>
                  <span>|</span>
                  <span>
                    assignee:{" "}
                    <span className="font-semibold text-slate-700">
                      {t.assignee_username ?? "-"}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                <StatusBadge status={t.status} />
                <PriorityBadge priority={t.priority} />
              </div>
            </div>
          </article>
        </button>
      ))}
    </div>
  );
}
