import { useEffect, useMemo, useState } from "react";
import { api, auth } from "./lib/api";

type Me = {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
};

type Ticket = {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  requester_username?: string;
  assignee_username?: string | null;
  created_at: string;
  updated_at: string;
};

type SidebarFilter = "inbox" | "my_tickets" | "unassigned" | "overdue";

const COMPANY_NAME = "NexaLink Telecom";
const COMPANY_TAGLINE =
  "Operations workspace for internet service incident management.";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatUsDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function BrandMark({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label={`${COMPANY_NAME} logo`}
    >
      <defs>
        <linearGradient id="nexa-brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d946ef" />
          <stop offset="55%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#nexa-brand-gradient)" />
      <path d="M19 44V20h4l14 17V20h8v24h-4L27 27v17h-8Z" fill="white" fillOpacity="0.95" />
      <path d="M47 17c3 1 5 3 6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
      <path d="M47 12c5 1 9 4 11 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const label = s.replaceAll("_", " ");
  const style =
    s === "open"
      ? "border-sky-300/45 bg-sky-500/25 text-sky-100"
      : s === "in_progress"
        ? "border-amber-300/45 bg-amber-500/25 text-amber-100"
        : s === "resolved"
          ? "border-emerald-300/45 bg-emerald-500/25 text-emerald-100"
          : s === "closed"
            ? "border-slate-300/45 bg-slate-500/25 text-slate-100"
            : "border-slate-300/45 bg-slate-500/25 text-slate-100";

  return (
    <span
      className={cx(
        "inline-flex rounded-md border px-3 py-1 text-xs font-semibold",
        style,
      )}
    >
      {label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const p = priority.toLowerCase();
  const style =
    p === "urgent"
      ? "border-rose-300/45 bg-rose-500/25 text-rose-100"
      : p === "high"
        ? "border-orange-300/45 bg-orange-500/25 text-orange-100"
        : p === "medium"
          ? "border-yellow-300/45 bg-yellow-500/25 text-yellow-100"
          : "border-slate-300/45 bg-slate-500/25 text-slate-100";

  return (
    <span
      className={cx(
        "inline-flex rounded-md border px-3 py-1 text-xs font-semibold",
        style,
      )}
    >
      {p}
    </span>
  );
}

function IdPill({ id }: { id: number }) {
  return (
    <span className="inline-flex items-center rounded-md border border-violet-300/45 bg-violet-500/30 px-2.5 py-1 text-xs font-semibold text-violet-100">
      #{id}
    </span>
  );
}

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-slate-950/65"
        aria-label="Close modal"
      />
      <div className="relative mx-auto mt-16 w-full max-w-2xl px-4">
        <div className="rounded-2xl border border-white/15 bg-[#1d1236]/95 shadow-2xl shadow-[#100723]/60 backdrop-blur">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h3 className="text-base font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-sm font-semibold text-slate-100 hover:bg-white/20"
            >
              x
            </button>
          </div>
          <div className="px-5 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

type SortKey = "newest" | "oldest" | "priority" | "status";
type PageSize = 10 | 20 | 50;

const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};
const STATUS_ORDER: Record<string, number> = {
  open: 0,
  in_progress: 1,
  resolved: 2,
  closed: 3,
};

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-indigo-100 bg-white px-3 py-2 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-indigo-500">
        {label}
      </div>
      <div className="mt-0.5 text-base font-semibold text-slate-900">
        {value}
      </div>
    </div>
  );
}

export default function App() {
  const [me, setMe] = useState<Me | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("GugaTampa");
  const [password, setPassword] = useState("@Tampa5000");
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  // Create ticket modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<
    "low" | "medium" | "high" | "urgent"
  >("medium");
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Ticket details modal
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [detailsSaving, setDetailsSaving] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Filters/search
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "open" | "in_progress" | "resolved" | "closed"
  >("all");
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "low" | "medium" | "high" | "urgent"
  >("all");

  // Sorting + pagination
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [page, setPage] = useState(1);
  const [sidebarFilter, setSidebarFilter] = useState<SidebarFilter>("inbox");
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");

  const isLoggedIn = useMemo(() => !!me, [me]);

  // Debounce (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  async function loadMeAndTickets() {
    setLoading(true);
    setError(null);
    try {
      const meRes = await api.get<Me>("/api/me/");
      setMe(meRes.data);

      const ticketsRes = await api.get<Ticket[]>("/api/tickets/");
      setTickets(ticketsRes.data);
    } catch {
      setError("Failed to load workspace data. Please sign in again.");
      setMe(null);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await auth.login(username, password);
      await loadMeAndTickets();
    } catch {
      setError("Login failed. Check your username and password.");
      setLoading(false);
    }
  }

  function handleLogout() {
    auth.logout();
    setMe(null);
    setTickets([]);
  }

  function openCreateModal() {
    if (!isLoggedIn) return;
    setCreateError(null);
    setNewTitle("");
    setNewDescription("");
    setNewPriority("medium");
    setIsCreateOpen(true);
  }

  async function createTicket() {
    setCreateError(null);
    const title = newTitle.trim();
    if (title.length < 3) {
      setCreateError("Title must be at least 3 characters.");
      return;
    }

    setCreating(true);
    try {
      await api.post("/api/tickets/", {
        title,
        description: newDescription.trim(),
        priority: newPriority,
      });
      setIsCreateOpen(false);
      await loadMeAndTickets();
    } catch {
      setCreateError("Could not create ticket. Confirm you are signed in.");
    } finally {
      setCreating(false);
    }
  }

  function clearFilters() {
    setQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setSortKey("newest");
    setSidebarFilter("inbox");
    setPage(1);
  }

  function applySidebarFilter(filter: SidebarFilter) {
    setSidebarFilter(filter);
    setPage(1);
  }

  // reset page on filter/sort/pageSize changes
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, statusFilter, priorityFilter, sortKey, pageSize]);

  const filteredSortedTickets = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();

    const filtered = tickets.filter((t) => {
      const matchesQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ? true : t.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" ? true : t.priority === priorityFilter;
      const matchesSidebar =
        sidebarFilter === "inbox"
          ? true
          : sidebarFilter === "my_tickets"
            ? !!me &&
              (t.requester_username === me.username ||
                t.assignee_username === me.username)
            : sidebarFilter === "unassigned"
              ? !t.assignee_username
              : t.priority === "urgent" &&
                t.status !== "resolved" &&
                t.status !== "closed";

      return matchesQuery && matchesStatus && matchesPriority && matchesSidebar;
    });

    return [...filtered].sort((a, b) => {
      if (sortKey === "newest")
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      if (sortKey === "oldest")
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

      if (sortKey === "priority") {
        const ap = PRIORITY_ORDER[a.priority] ?? 99;
        const bp = PRIORITY_ORDER[b.priority] ?? 99;
        if (ap !== bp) return ap - bp;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      const as = STATUS_ORDER[a.status] ?? 99;
      const bs = STATUS_ORDER[b.status] ?? 99;
      if (as !== bs) return as - bs;
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  }, [tickets, debouncedQuery, statusFilter, priorityFilter, sortKey, sidebarFilter, me]);

  const total = filteredSortedTickets.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const pageItems = filteredSortedTickets.slice(startIndex, endIndex);
  const dashboardStats = useMemo(() => {
    const today = new Date().toDateString();

    return {
      inbox: tickets.length,
      unassigned: tickets.filter((t) => !t.assignee_username).length,
      overdue: tickets.filter(
        (t) => t.priority === "urgent" && t.status !== "resolved" && t.status !== "closed",
      ).length,
      myTickets: me
        ? tickets.filter(
            (t) =>
              t.requester_username === me.username ||
              t.assignee_username === me.username,
          ).length
        : 0,
      dueToday: tickets.filter(
        (t) => new Date(t.updated_at).toDateString() === today,
      ).length,
    };
  }, [tickets, me]);

  function openDetails(ticket: Ticket) {
    setDetailsError(null);
    setSelected(ticket);
    setIsDetailsOpen(true);
  }

  function closeDetails() {
    if (detailsSaving) return;
    setIsDetailsOpen(false);
    setSelected(null);
    setDetailsError(null);
  }

  async function saveDetails(
    patch: Partial<Pick<Ticket, "status" | "priority">>,
  ) {
    if (!selected) return;
    setDetailsSaving(true);
    setDetailsError(null);

    try {
      const res = await api.patch<Ticket>(
        `/api/tickets/${selected.id}/`,
        patch,
      );
      const updated = res.data;

      // update list locally (fast UI)
      setTickets((prev) =>
        prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)),
      );
      setSelected((prev) => (prev ? { ...prev, ...updated } : prev));
    } catch {
      setDetailsError("Could not update this ticket. Please try again.");
    } finally {
      setDetailsSaving(false);
    }
  }

  useEffect(() => {
    if (auth.getTokens()?.access) loadMeAndTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#120825] text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-[-120px] h-[420px] w-[420px] rounded-full bg-fuchsia-700/30 blur-[120px]" />
          <div className="absolute right-[-120px] top-[80px] h-[460px] w-[460px] rounded-full bg-indigo-700/35 blur-[130px]" />
          <div className="absolute bottom-[-180px] left-[15%] h-[520px] w-[520px] rounded-full bg-rose-700/30 blur-[140px]" />
          <div className="absolute bottom-[-220px] right-[8%] h-[560px] w-[560px] rounded-full bg-blue-400/35 blur-[150px]" />
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md rounded-[38px] border border-white/20 bg-white/10 px-6 py-8 shadow-[0_35px_80px_rgba(17,6,42,0.65)] backdrop-blur-xl sm:px-8 sm:py-9">
            <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
              <BrandMark className="h-24 w-24" />
            </div>
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                {COMPANY_NAME}
              </h1>
              <p className="mt-1 text-sm text-indigo-200/85">
                ISP service desk portal
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-7">
              <div className="space-y-1.5">
                <label
                  htmlFor="username"
                  className="flex items-center gap-3 text-xl text-white/85"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 text-white/80"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M20 4H4a2 2 0 0 0-2 2v.4l10 5.6 10-5.6V6a2 2 0 0 0-2-2Zm2 4.2-9.5 5.3a1 1 0 0 1-1 0L2 8.2V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.2Z" />
                  </svg>
                  Username or Email
                </label>
                <input
                  id="username"
                  className="h-11 w-full border-0 border-b border-white/60 bg-transparent px-1 text-base text-white outline-none placeholder:text-white/55 focus:border-white"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="you@company.com"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="flex items-center gap-3 text-xl text-white/85"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 text-white/80"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M17 8h-1V6a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Zm-6 8.7V18a1 1 0 1 0 2 0v-1.3a2 2 0 1 0-2 0ZM10 8V6a2 2 0 1 1 4 0v2h-4Z" />
                  </svg>
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="h-11 w-full border-0 border-b border-white/60 bg-transparent px-1 text-base text-white outline-none placeholder:text-white/55 focus:border-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Password"
                />
              </div>

              <div className="flex items-center justify-between gap-4 text-white/80">
                <label className="inline-flex items-center gap-2 text-base">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 accent-slate-900"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  className="text-base italic text-white/70 transition hover:text-white"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-14 w-full rounded-2xl bg-gradient-to-r from-fuchsia-800/90 via-indigo-700/90 to-blue-400/90 text-3xl font-semibold tracking-[0.25em] text-white shadow-lg transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-65"
              >
                {loading ? "SIGNING IN..." : "LOGIN"}
              </button>

              {error ? (
                <div className="rounded-lg border border-rose-300/35 bg-rose-500/20 px-3 py-2 text-sm font-medium text-rose-100">
                  {error}
                </div>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#120826] text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-120px] h-[380px] w-[380px] rounded-full bg-fuchsia-700/25 blur-[120px]" />
        <div className="absolute right-[-80px] top-[120px] h-[420px] w-[420px] rounded-full bg-indigo-700/30 blur-[130px]" />
        <div className="absolute bottom-[-120px] left-[22%] h-[420px] w-[420px] rounded-full bg-sky-500/20 blur-[120px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-[#160c2d]/90 md:flex md:flex-col">
          <div className="border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <BrandMark className="h-7 w-7" />
              <div>
                <div className="text-sm font-semibold text-indigo-100">{COMPANY_NAME}</div>
                <div className="mt-0.5 text-[11px] text-slate-300">Service Desk</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-300">{me?.username}</div>
          </div>

          <div className="px-3 py-4">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-wide text-indigo-200/80">
              Tickets
            </p>
            <nav className="mt-2 space-y-1">
              <button
                type="button"
                onClick={() => applySidebarFilter("inbox")}
                className={cx(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition",
                  sidebarFilter === "inbox"
                    ? "bg-white/10 text-white"
                    : "text-slate-200 hover:bg-white/10",
                )}
              >
                <span>Inbox</span>
                <span className="rounded-md bg-indigo-500/30 px-1.5 py-0.5 text-xs font-semibold">
                  {dashboardStats.inbox}
                </span>
              </button>
              <button
                type="button"
                onClick={() => applySidebarFilter("my_tickets")}
                className={cx(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition",
                  sidebarFilter === "my_tickets"
                    ? "bg-white/10 text-white"
                    : "text-slate-200 hover:bg-white/10",
                )}
              >
                <span>My tickets</span>
                <span className="text-xs text-indigo-200">{dashboardStats.myTickets}</span>
              </button>
              <button
                type="button"
                onClick={() => applySidebarFilter("unassigned")}
                className={cx(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition",
                  sidebarFilter === "unassigned"
                    ? "bg-white/10 text-white"
                    : "text-slate-200 hover:bg-white/10",
                )}
              >
                <span>Unassigned</span>
                <span className="text-xs text-indigo-200">{dashboardStats.unassigned}</span>
              </button>
              <button
                type="button"
                onClick={() => applySidebarFilter("overdue")}
                className={cx(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition",
                  sidebarFilter === "overdue"
                    ? "bg-white/10 text-white"
                    : "text-slate-200 hover:bg-white/10",
                )}
              >
                <span>Overdue</span>
                <span className="text-xs text-indigo-200">{dashboardStats.overdue}</span>
              </button>
            </nav>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
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
                  onClick={loadMeAndTickets}
                  className="h-9 rounded-lg border border-white/20 bg-white/10 px-3 text-xs font-semibold text-slate-100 hover:bg-white/20"
                >
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="h-9 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-500 px-3 text-xs font-semibold text-white hover:from-violet-500 hover:to-indigo-400"
                >
                  New ticket
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="h-9 rounded-lg border border-white/20 bg-white/10 px-3 text-xs font-semibold text-slate-100 hover:bg-white/20"
                >
                  Sign out
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6">
            <div className="space-y-4">
              <section className="rounded-xl border border-indigo-100 bg-white/95 p-4 shadow-sm">
                <h1 className="text-lg font-semibold text-slate-900">{COMPANY_NAME} Dashboard</h1>
                <p className="mt-1 text-sm text-slate-600">{COMPANY_TAGLINE}</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <StatTile label="Inbox" value={dashboardStats.inbox} />
                  <StatTile label="Unassigned" value={dashboardStats.unassigned} />
                  <StatTile label="Overdue" value={dashboardStats.overdue} />
                  <StatTile label="My tickets" value={dashboardStats.myTickets} />
                  <StatTile label="Due today" value={dashboardStats.dueToday} />
                </div>
              </section>

              <section className="rounded-xl border border-indigo-100 bg-white/95 p-4 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                  Report
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  Choose a start and end date to review ticket activity in a specific period.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-[160px_160px_auto]">
                  <div className="grid gap-1">
                    <label className="text-xs font-semibold text-slate-600">
                      Start date (MM/DD/YYYY)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="MM/DD/YYYY"
                      maxLength={10}
                      value={reportStartDate}
                      onChange={(e) =>
                        setReportStartDate(formatUsDateInput(e.target.value))
                      }
                      className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                    />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-xs font-semibold text-slate-600">
                      End date (MM/DD/YYYY)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="MM/DD/YYYY"
                      maxLength={10}
                      value={reportEndDate}
                      onChange={(e) =>
                        setReportEndDate(formatUsDateInput(e.target.value))
                      }
                      className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                    />
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="h-10 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-500"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-indigo-100 bg-white/95 p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Tickets</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Search, filter, sort, and update tickets in one place.
                    </p>
                  </div>

                  <div className="text-sm text-slate-500">
                    {loading
                      ? "Loading tickets..."
                      : total === 0
                        ? "No matching results"
                        : `Showing ${startIndex + 1}-${endIndex} of ${total}`}
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 sm:p-4">
                  <div className="grid gap-3 md:grid-cols-12">
                    <div className="md:col-span-5">
                      <label className="text-xs font-semibold text-indigo-700">
                        Search tickets
                      </label>
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by title or description..."
                        className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                      />
                      <div className="mt-1 text-[11px] text-slate-500">
                        Results update after 300ms to keep interactions smooth.
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-indigo-700">
                        Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                      >
                        <option value="all">All</option>
                        <option value="open">open</option>
                        <option value="in_progress">in_progress</option>
                        <option value="resolved">resolved</option>
                        <option value="closed">closed</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-indigo-700">
                        Priority
                      </label>
                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value as any)}
                        className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                      >
                        <option value="all">All</option>
                        <option value="low">low</option>
                        <option value="medium">medium</option>
                        <option value="high">high</option>
                        <option value="urgent">urgent</option>
                      </select>
                    </div>

                    <div className="md:col-span-3">
                      <label className="text-xs font-semibold text-indigo-700">
                        Sort by
                      </label>
                      <select
                        value={sortKey}
                        onChange={(e) => setSortKey(e.target.value as any)}
                        className="mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                      >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="priority">Priority</option>
                        <option value="status">Status</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-12 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-indigo-700">
                          Page size
                        </span>
                        <select
                          value={pageSize}
                          onChange={(e) =>
                            setPageSize(Number(e.target.value) as any)
                          }
                          className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-200"
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>

                        <button
                          onClick={clearFilters}
                          className="h-10 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Reset filters
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          disabled={safePage <= 1}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          Prev
                        </button>
                        <span className="text-sm text-slate-600">
                          Page <b>{safePage}</b> of <b>{totalPages}</b>
                        </span>
                        <button
                          disabled={safePage >= totalPages}
                          onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                          }
                          className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  {pageItems.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-700">
                      No tickets match the current filters.
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {pageItems.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => openDetails(t)}
                          className="text-left"
                          type="button"
                        >
                          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-[1px] hover:border-violet-300 hover:shadow-md">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <IdPill id={t.id} />
                                  <h3 className="text-base font-semibold text-slate-900">
                                    {t.title}
                                  </h3>
                                </div>

                                {t.description ? (
                                  <p className="mt-2 text-sm text-slate-700">
                                    {t.description}
                                  </p>
                                ) : (
                                  <p className="mt-2 text-sm text-slate-500">
                                    No description provided.
                                  </p>
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
                  )}

                  {error ? (
                    <div className="mt-4 rounded-xl border border-rose-300/35 bg-rose-500/15 p-3 text-sm text-rose-100">
                      {error}
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>

      {/* Create Ticket Modal */}
      <Modal
        open={isCreateOpen}
        title="Create new ticket"
        onClose={() => {
          if (!creating) setIsCreateOpen(false);
        }}
      >
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <label className="text-sm font-semibold text-slate-200">
              Title
            </label>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Example: Fiber outage in Downtown region"
              className="h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm text-white outline-none transition placeholder:text-slate-300 focus:border-violet-300 focus:ring-2 focus:ring-violet-300/30"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-semibold text-slate-200">
              Description (optional)
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Describe the issue..."
              className="min-h-[96px] rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-300 focus:border-violet-300 focus:ring-2 focus:ring-violet-300/30"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-semibold text-slate-200">
              Priority
            </label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="dark-select h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-300/30"
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
              <option value="urgent">urgent</option>
            </select>
          </div>

          {createError ? (
            <div className="rounded-xl border border-rose-300/35 bg-rose-500/15 p-3 text-sm text-rose-100">
              {createError}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setIsCreateOpen(false)}
              disabled={creating}
              className="h-10 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-slate-100 hover:bg-white/20 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              onClick={createTicket}
              disabled={creating}
              className="h-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-4 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-400 disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create ticket"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Ticket Details Modal */}
      <Modal
        open={isDetailsOpen}
        title={selected ? `Ticket #${selected.id}` : "Ticket details"}
        onClose={closeDetails}
      >
        {!selected ? null : (
          <div className="grid gap-5">
            <div>
              <div className="text-sm text-slate-300">Title</div>
              <div className="mt-1 text-lg font-semibold text-white">
                {selected.title}
              </div>

              <div className="mt-3 text-sm text-slate-300">Description</div>
              <div className="mt-1 text-sm text-slate-100">
                {selected.description || "No description provided."}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/20 bg-white/10 p-3 shadow-sm">
                  <div className="text-xs font-semibold text-indigo-200">
                    Requester
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    {selected.requester_username ?? "-"}
                  </div>
                </div>

                <div className="rounded-xl border border-white/20 bg-white/10 p-3 shadow-sm">
                  <div className="text-xs font-semibold text-indigo-200">
                    Assignee
                  </div>
                  <div className="mt-1 text-sm font-semibold text-white">
                    {selected.assignee_username ?? "-"}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-indigo-200">
                    Status
                  </label>
                  <select
                    value={selected.status}
                    disabled={detailsSaving}
                    onChange={(e) => saveDetails({ status: e.target.value })}
                    className="dark-select h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-300/30 disabled:opacity-60"
                  >
                    <option value="open">open</option>
                    <option value="in_progress">in_progress</option>
                    <option value="resolved">resolved</option>
                    <option value="closed">closed</option>
                  </select>
                  <div className="mt-1">
                    <StatusBadge status={selected.status} />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-indigo-200">
                    Priority
                  </label>
                  <select
                    value={selected.priority}
                    disabled={detailsSaving}
                    onChange={(e) => saveDetails({ priority: e.target.value })}
                    className="dark-select h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm font-semibold text-white outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-300/30 disabled:opacity-60"
                  >
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                    <option value="urgent">urgent</option>
                  </select>
                  <div className="mt-1">
                    <PriorityBadge priority={selected.priority} />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-xs text-slate-300">
                <div>
                  Created:{" "}
                  <span className="font-semibold text-slate-100">
                    {new Date(selected.created_at).toLocaleString()}
                  </span>
                </div>
                <div>
                  Updated:{" "}
                  <span className="font-semibold text-slate-100">
                    {new Date(selected.updated_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {detailsError ? (
                <div className="mt-4 rounded-xl border border-rose-300/35 bg-rose-500/15 p-3 text-sm text-rose-100">
                  {detailsError}
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={closeDetails}
                disabled={detailsSaving}
                className="h-10 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-semibold text-slate-100 hover:bg-white/20 disabled:opacity-60"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


