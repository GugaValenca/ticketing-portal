import type { ReactNode } from "react";

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
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide",
        style,
      )}
    >
      {user.is_superuser ? (
        <span className="mr-1" aria-hidden>
          *
        </span>
      ) : null}
      {label}
    </span>
  );
}

function ActionButton({
  children,
  onClick,
  disabled = false,
  variant = "secondary",
  className,
  title,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  className?: string;
  title?: string;
}) {
  const base =
    "inline-flex h-10 items-center justify-center rounded-xl px-3 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const style =
    variant === "primary"
      ? "bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:bg-slate-950"
      : "border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cx(base, style, className)}
    >
      {children}
    </button>
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
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex min-h-[72px] items-center justify-between gap-3 py-3">
          {/* Brand */}
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-sm ring-1 ring-slate-800/40">
              <span className="text-sm font-black tracking-tight">TP</span>
            </div>

            <div className="min-w-0">
              <div className="truncate text-[15px] font-semibold tracking-tight text-slate-900">
                Ticketing Portal
              </div>
              <div className="truncate text-xs text-slate-500">
                Customer support workspace for Django REST + React
              </div>
            </div>
          </div>

          {/* Right area */}
          <div className="flex items-center gap-2.5">
            <ActionButton
              onClick={onReload}
              className="hidden sm:inline-flex"
              title="Refresh workspace data"
            >
              Refresh
            </ActionButton>

            <ActionButton
              onClick={onNewTicket}
              disabled={!user}
              variant="primary"
              title="Create a new ticket"
            >
              + New ticket
            </ActionButton>

            {user ? (
              <div className="ml-1 flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white/95 px-2.5 py-1.5 shadow-sm ring-1 ring-slate-100">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                  {initials(user.username)}
                </div>

                <div className="hidden min-w-0 sm:block sm:max-w-[220px]">
                  <div className="truncate text-xs font-semibold text-slate-900">
                    {user.username}
                  </div>
                  <div className="truncate text-[11px] text-slate-500">
                    {user.email || "No email"}
                  </div>
                </div>

                <div className="hidden sm:block">
                  <RolePill user={user} />
                </div>

                <ActionButton
                  onClick={onLogout}
                  className="h-9 px-3 text-xs"
                  title="Sign out"
                >
                  Sign out
                </ActionButton>
              </div>
            ) : (
              <span className="inline-flex h-9 items-center rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm">
                Not signed in
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
