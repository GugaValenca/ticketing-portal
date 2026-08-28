export function TopBar({
  onRefresh,
  onNewTicket,
  onSignOut,
}: {
  onRefresh: () => void;
  onNewTicket: () => void;
  onSignOut: () => void;
}) {
  return (
    <header className="border-b border-white/10 bg-[#1d1236]/85">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-4 text-sm text-indigo-100">
          <span className="font-semibold">Service Desk</span>
          <span className="hidden text-slate-300 md:inline">Users</span>
          <span className="hidden text-slate-300 md:inline">Tickets</span>
          <span className="hidden text-slate-300 md:inline">Tools</span>
          <span className="hidden text-slate-300 md:inline">Report</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="h-9 rounded-lg border border-white/20 bg-white/10 px-3 text-xs font-semibold text-slate-100 hover:bg-white/20"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={onNewTicket}
            className="h-9 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-500 px-3 text-xs font-semibold text-white hover:from-violet-500 hover:to-indigo-400"
          >
            New ticket
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="h-9 rounded-lg border border-white/20 bg-white/10 px-3 text-xs font-semibold text-slate-100 hover:bg-white/20"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
