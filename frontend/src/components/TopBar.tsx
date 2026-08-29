export function TopBar({
  onRefresh,
  onNewTicket,
  onSignOut,
  onOpenMobileNav,
}: {
  onRefresh: () => void;
  onNewTicket: () => void;
  onSignOut: () => void;
  onOpenMobileNav: () => void;
}) {
  return (
    <header className="border-b border-white/10 bg-[#1d1236]/85">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-4 text-sm text-indigo-100">
          <button
            type="button"
            onClick={onOpenMobileNav}
            aria-label="Open navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 md:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold">Service Desk</span>
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
