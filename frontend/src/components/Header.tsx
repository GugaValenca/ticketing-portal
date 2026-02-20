type HeaderUser = {
  username: string;
  email?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
} | null;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getInitials(name: string) {
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getRole(user: NonNullable<HeaderUser>) {
  if (user.is_superuser) {
    return {
      label: "Superuser",
      style: "border-violet-200 bg-violet-50 text-violet-700",
    };
  }

  if (user.is_staff) {
    return {
      label: "Staff",
      style: "border-sky-200 bg-sky-50 text-sky-700",
    };
  }

  return {
    label: "User",
    style: "border-slate-200 bg-slate-50 text-slate-700",
  };
}

export default function Header({
  user,
  onReload,
  onLogout,
  onNewTicket,
}: {
  user: HeaderUser;
  onReload: () => void;
  onLogout: () => void;
  onNewTicket: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
            Ticketing Portal
          </h1>
          <p className="hidden text-xs text-slate-500 sm:block">
            Internal support workspace
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {getInitials(user.username)}
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">
                  {user.username}
                </div>
                {user.email ? (
                  <div className="max-w-[180px] truncate text-xs text-slate-500">
                    {user.email}
                  </div>
                ) : null}
              </div>

              <span
                className={cx(
                  "inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                  getRole(user).style,
                )}
              >
                {getRole(user).label}
              </span>
            </div>
          ) : null}

          {user ? (
            <>
              <button
                type="button"
                onClick={onReload}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Refresh
              </button>

              <button
                type="button"
                onClick={onNewTicket}
                className="h-9 rounded-lg bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                New Ticket
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Sign out
              </button>
            </>
          ) : (
            <div className="hidden text-xs font-medium text-slate-500 sm:block">
              Sign in to start managing tickets
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
