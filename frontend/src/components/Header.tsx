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

const COMPANY_NAME = "NexaLink Telecom";
const COMPANY_TAGLINE =
  "Operations workspace for internet service incident management.";

function RolePill({ user }: { user: Me }) {
  const label = user.is_superuser
    ? "Superuser"
    : user.is_staff
      ? "Staff"
      : "User";

  const style = user.is_superuser
    ? "border-amber-300/50 bg-amber-200/20 text-amber-100"
    : user.is_staff
      ? "border-indigo-300/50 bg-indigo-300/20 text-indigo-100"
      : "border-white/30 bg-white/10 text-slate-100";

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
    "inline-flex h-10 items-center justify-center rounded-xl px-3 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-50";
  const style =
    variant === "primary"
      ? "bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-lg shadow-indigo-900/35 hover:from-violet-500 hover:to-indigo-400 active:from-violet-700 active:to-indigo-600"
      : "border border-white/30 bg-white/10 text-slate-100 shadow-sm hover:border-white/50 hover:bg-white/15";

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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#170d2f]/75 shadow-lg shadow-[#11052a]/30 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex min-h-[72px] items-center justify-between gap-3 py-3">
          {/* Brand */}
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-600 via-violet-600 to-indigo-500 text-white shadow-lg shadow-indigo-900/40 ring-1 ring-white/20">
              <span className="text-sm font-black tracking-tight">NL</span>
            </div>

            <div className="min-w-0">
              <div className="truncate text-[15px] font-semibold tracking-tight text-white">
                {COMPANY_NAME}
              </div>
              <div className="truncate text-xs text-slate-300">
                {COMPANY_TAGLINE}
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
              <div className="ml-1 flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-2.5 py-1.5 shadow-sm ring-1 ring-white/10">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-xs font-bold text-white ring-1 ring-white/20">
                  {initials(user.username)}
                </div>

                <div className="hidden min-w-0 sm:block sm:max-w-[220px]">
                  <div className="truncate text-xs font-semibold text-white">
                    {user.username}
                  </div>
                  <div className="truncate text-[11px] text-slate-300">
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
              <span className="inline-flex h-9 items-center rounded-full border border-white/25 bg-white/10 px-3 text-xs font-semibold text-slate-200 shadow-sm">
                Not signed in
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
