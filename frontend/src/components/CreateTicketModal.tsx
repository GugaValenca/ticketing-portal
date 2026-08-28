import { Modal } from "./ui/Modal";
import type { Priority, UserOption } from "../types";

export function CreateTicketModal({
  open,
  title,
  description,
  priority,
  assigneeId,
  assigneeOptions,
  error,
  creating,
  onTitleChange,
  onDescriptionChange,
  onPriorityChange,
  onAssigneeIdChange,
  onClose,
  onCreate,
}: {
  open: boolean;
  title: string;
  description: string;
  priority: Priority;
  assigneeId: string;
  assigneeOptions: UserOption[];
  error: string | null;
  creating: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriorityChange: (value: Priority) => void;
  onAssigneeIdChange: (value: string) => void;
  onClose: () => void;
  onCreate: () => void;
}) {
  return (
    <Modal open={open} title="Create new ticket" onClose={() => !creating && onClose()}>
      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <label htmlFor="new-ticket-title" className="text-sm font-semibold text-slate-200">
            Title
          </label>
          <input
            id="new-ticket-title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Example: Fiber outage in Downtown region"
            className="h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm text-white outline-none transition placeholder:text-slate-300 focus:border-violet-300 focus:ring-2 focus:ring-violet-300/30"
          />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="new-ticket-description" className="text-sm font-semibold text-slate-200">
            Description (optional)
          </label>
          <textarea
            id="new-ticket-description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Describe the issue..."
            className="min-h-[96px] rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-300 focus:border-violet-300 focus:ring-2 focus:ring-violet-300/30"
          />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="new-ticket-priority" className="text-sm font-semibold text-slate-200">
            Priority
          </label>
          <select
            id="new-ticket-priority"
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value as Priority)}
            className="dark-select h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-300/30"
          >
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="urgent">urgent</option>
          </select>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="new-ticket-assignee" className="text-sm font-semibold text-slate-200">
            Assignee (optional)
          </label>
          <select
            id="new-ticket-assignee"
            value={assigneeId}
            onChange={(e) => onAssigneeIdChange(e.target.value)}
            className="dark-select h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-300/30"
          >
            <option value="">Unassigned</option>
            {assigneeOptions.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <div className="rounded-xl border border-rose-300/35 bg-rose-500/15 p-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={creating}
            className="h-10 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-slate-100 hover:bg-white/20 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            onClick={onCreate}
            disabled={creating}
            className="h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-4 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-400 disabled:opacity-60"
          >
            {creating ? "Creating..." : "Create ticket"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
