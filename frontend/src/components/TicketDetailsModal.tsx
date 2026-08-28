import { Modal } from "./ui/Modal";
import { PriorityBadge, StatusBadge } from "./ui/Badges";
import type { Ticket } from "../types";

export function TicketDetailsModal({
  open,
  ticket,
  saving,
  error,
  onClose,
  onStatusChange,
  onPriorityChange,
}: {
  open: boolean;
  ticket: Ticket | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
}) {
  return (
    <Modal open={open} title={ticket ? `Ticket #${ticket.id}` : "Ticket details"} onClose={onClose}>
      {!ticket ? null : (
        <div className="grid gap-5">
          <div>
            <div className="text-sm text-slate-300">Title</div>
            <div className="mt-1 text-lg font-semibold text-white">{ticket.title}</div>

            <div className="mt-3 text-sm text-slate-300">Description</div>
            <div className="mt-1 text-sm text-slate-100">
              {ticket.description || "No description provided."}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/20 bg-white/10 p-3 shadow-sm">
                <div className="text-xs font-semibold text-indigo-200">Requester</div>
                <div className="mt-1 text-sm font-semibold text-white">
                  {ticket.requester_username ?? "-"}
                </div>
              </div>

              <div className="rounded-xl border border-white/20 bg-white/10 p-3 shadow-sm">
                <div className="text-xs font-semibold text-indigo-200">Assignee</div>
                <div className="mt-1 text-sm font-semibold text-white">
                  {ticket.assignee_username ?? "-"}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label htmlFor="ticket-status" className="text-xs font-semibold text-indigo-200">
                  Status
                </label>
                <select
                  id="ticket-status"
                  value={ticket.status}
                  disabled={saving}
                  onChange={(e) => onStatusChange(e.target.value)}
                  className="dark-select h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-300/30 disabled:opacity-60"
                >
                  <option value="open">open</option>
                  <option value="in_progress">in_progress</option>
                  <option value="resolved">resolved</option>
                  <option value="closed">closed</option>
                </select>
                <div className="mt-1">
                  <StatusBadge status={ticket.status} />
                </div>
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="ticket-priority" className="text-xs font-semibold text-indigo-200">
                  Priority
                </label>
                <select
                  id="ticket-priority"
                  value={ticket.priority}
                  disabled={saving}
                  onChange={(e) => onPriorityChange(e.target.value)}
                  className="dark-select h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-300/30 disabled:opacity-60"
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                  <option value="urgent">urgent</option>
                </select>
                <div className="mt-1">
                  <PriorityBadge priority={ticket.priority} />
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-2 text-xs text-slate-300">
              <div>
                Created:{" "}
                <span className="font-semibold text-slate-100">
                  {new Date(ticket.created_at).toLocaleString()}
                </span>
              </div>
              <div>
                Updated:{" "}
                <span className="font-semibold text-slate-100">
                  {new Date(ticket.updated_at).toLocaleString()}
                </span>
              </div>
            </div>

            {error ? (
              <div className="mt-4 rounded-xl border border-rose-300/35 bg-rose-500/15 p-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="h-10 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-slate-100 hover:bg-white/20 disabled:opacity-60"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
