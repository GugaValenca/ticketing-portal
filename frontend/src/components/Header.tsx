type Me = {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function initials(username: string) {
  const s = (username || "").trim();
  if (!s) return "U";
  const parts = s.split(/[\s._-]+/).filter(Boolean);
  const a = parts[0]?.[0] ?? s[0];
  const b = parts.length > 1 ? parts[parts.length - 1][0] : (s[1] ?? "");
  return (a + b).toUpperCase();
}

function RolePill({ user }: { user: Me }) {
  const label = user.is_superuser
    ? "Superuser"
    : user.is_staff
      ? "Staff"
      : "User";
  const style = user.is_superuser
    ? "border-amber-200 bg-amber-50 text-amber-800"
    : user.is_staff
      ? "border-indigo-200 bg-indigo-50 text-indigo-800"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        style,
      )}
    >
      {user.is_superuser ? (
        <span aria-hidden className="mr-1">
          ⭐
        </span>
      ) : null}
      {label}
    </span>
  );
}

export default function Header({
  user,
  onReload,
  onLogout,
  onNewTicket,
}: {
  user: Me | null;
  onReload: () => void;
  onLogout: () => void;
  onNewTicket: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <span className="text-sm font-black">TP</span>
            </div>

            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">
                Ticketing Portal
              </div>
              <div className="truncate text-xs text-slate-500">
                Startup-ready • Django REST + React
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onReload}
              className="hidden h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 sm:inline-flex"
              title="Refresh"
            >
              Refresh
            </button>

            <button
              onClick={onNewTicket}
              disabled={!user}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
              title="New ticket"
            >
              + New ticket
            </button>

            {/* User */}
            {user ? (
              <div className="ml-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 py-1">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
                  {initials(user.username)}
                </div>

                <div className="hidden min-w-0 sm:block">
                  <div className="max-w-[160px] truncate text-xs font-semibold text-slate-900">
                    {user.username}
                  </div>
                  <div className="max-w-[160px] truncate text-[11px] text-slate-500">
                    {user.email || "—"}
                  </div>
                </div>

                <div className="hidden sm:block">
                  <RolePill user={user} />
                </div>

                <button
                  onClick={onLogout}
                  className="ml-1 h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                  title="Sign out"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <span className="text-sm text-slate-600">Not signed in</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
