type User = {
  username: string;
  email?: string;
  is_staff?: boolean;
  is_superuser?: boolean;
};

type HeaderProps = {
  user: User | null;
  onReload: () => void;
  onLogout: () => void;
  onNewTicket: () => void;
};

function RoleChip({ user }: { user: User }) {
  const role = user.is_superuser
    ? "Superuser"
    : user.is_staff
      ? "Staff"
      : "User";

  const cls =
    role === "Superuser"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : role === "Staff"
        ? "border-indigo-200 bg-indigo-50 text-indigo-800"
        : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}
    >
      {role === "Superuser" ? <span aria-hidden>⭐</span> : null}
      {role}
    </span>
  );
}

export default function Header({
  user,
  onReload,
  onLogout,
  onNewTicket,
}: HeaderProps) {
  const isAuthed = !!user;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        {/* Brand */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-sm font-bold text-white shadow-sm">
            TP
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-slate-900">
              Ticketing Portal
            </h1>
            <p className="truncate text-xs text-slate-500">
              Startup-ready • React + JWT • Django REST
            </p>
          </div>
        </div>

        {/* Right side */}
        {!isAuthed ? (
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-slate-600 sm:inline">
              Faça login pra continuar
            </span>
            <span className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
              Sign in
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onNewTicket}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              + Novo ticket
            </button>

            <button
              onClick={onReload}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Recarregar
            </button>

            <button
              onClick={onLogout}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Sair
            </button>
          </div>
        )}
      </div>

      {/* User bar (only when authed) */}
      {isAuthed ? (
        <div className="border-t border-slate-100">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-2">
            <div className="min-w-0 text-sm text-slate-700">
              <span className="font-medium">Logado como:</span>{" "}
              <span className="font-semibold">{user.username}</span>
              {user.email ? (
                <span className="text-slate-500"> • {user.email}</span>
              ) : null}
            </div>

            <RoleChip user={user} />
          </div>
        </div>
      ) : null}
    </header>
  );
}
