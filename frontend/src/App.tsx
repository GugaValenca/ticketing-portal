import { useEffect, useMemo, useState } from "react";
import { api, auth } from "./lib/api";
import Header from "./components/Header";

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

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const label = s.replaceAll("_", " ");
  const style =
    s === "open"
      ? "border-sky-200 bg-sky-50 text-sky-800"
      : s === "in_progress"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : s === "resolved"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : s === "closed"
            ? "border-slate-200 bg-slate-100 text-slate-700"
            : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <span
      className={cx(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
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
      ? "border-rose-200 bg-rose-50 text-rose-800"
      : p === "high"
        ? "border-orange-200 bg-orange-50 text-orange-800"
        : p === "medium"
          ? "border-yellow-200 bg-yellow-50 text-yellow-800"
          : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <span
      className={cx(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
        style,
      )}
    >
      {p}
    </span>
  );
}

function IdPill({ id }: { id: number }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
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
        className="absolute inset-0 h-full w-full bg-black/40"
        aria-label="Close modal"
      />
      <div className="relative mx-auto mt-16 w-full max-w-2xl px-4">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              ✕
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
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
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

      return matchesQuery && matchesStatus && matchesPriority;
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
  }, [tickets, debouncedQuery, statusFilter, priorityFilter, sortKey]);

  const total = filteredSortedTickets.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const pageItems = filteredSortedTickets.slice(startIndex, endIndex);

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
            <div className="mx-auto mb-7 flex h-40 w-40 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
              <svg
                viewBox="0 0 24 24"
                className="h-24 w-24 text-white/65"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 12c2.76 0 5-2.69 5-6s-2.24-6-5-6-5 2.69-5 6 2.24 6 5 6Zm0 2c-4.41 0-8 2.69-8 6v2h16v-2c0-3.31-3.59-6-8-6Z" />
              </svg>
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
                  placeholder="Email ID"
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 text-slate-900">
      <Header
        user={me}
        onReload={loadMeAndTickets}
        onLogout={handleLogout}
        onNewTicket={openCreateModal}
      />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Auth block */}
          <div className="border-b border-slate-200 p-5 sm:p-6">
            {!isLoggedIn ? (
              <>
                <h2 className="text-lg font-semibold text-slate-900">
                  Sign in
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Use a seeded user account (for example: GugaTampa, LaisLany,
                  or admin).
                </p>

                <form
                  onSubmit={handleLogin}
                  className="mt-5 grid gap-4 sm:max-w-xl sm:grid-cols-2"
                >
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Username or Email
                    </label>
                    <input
                      className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <input
                      type="password"
                      className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="flex items-center gap-3 sm:col-span-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
                    >
                      {loading ? "Signing in..." : "Sign in"}
                    </button>

                    {error ? (
                      <span className="text-sm font-medium text-rose-700">
                        {error}
                      </span>
                    ) : null}
                  </div>
                </form>
              </>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatTile
                  label="Workspace status"
                  value={loading ? "Syncing..." : "Workspace ready"}
                />
                <StatTile label="Total tickets" value={tickets.length} />
                <StatTile label="Filtered results" value={total} />
                <StatTile
                  label="Current page"
                  value={`${safePage} / ${totalPages}`}
                />
              </div>
            )}
          </div>

          {/* Tickets */}
          <div className="p-5 sm:p-6">
            <section className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Tickets
                  </h2>
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

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:p-4">
                <div className="grid gap-3 md:grid-cols-12">
                  <div className="md:col-span-5">
                    <label className="text-xs font-semibold text-slate-600">
                      Search tickets
                    </label>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by title or description..."
                      className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    />
                    <div className="mt-1 text-[11px] text-slate-500">
                      Results update after 300ms to keep interactions smooth.
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-600">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="all">All</option>
                      <option value="open">open</option>
                      <option value="in_progress">in_progress</option>
                      <option value="resolved">resolved</option>
                      <option value="closed">closed</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-600">
                      Priority
                    </label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value as any)}
                      className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="all">All</option>
                      <option value="low">low</option>
                      <option value="medium">medium</option>
                      <option value="high">high</option>
                      <option value="urgent">urgent</option>
                    </select>
                  </div>

                  <div className="md:col-span-3">
                    <label className="text-xs font-semibold text-slate-600">
                      Sort by
                    </label>
                    <select
                      value={sortKey}
                      onChange={(e) => setSortKey(e.target.value as any)}
                      className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="priority">Priority</option>
                      <option value="status">Status</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 md:col-span-12 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600">
                        Page size
                      </span>
                      <select
                        value={pageSize}
                        onChange={(e) =>
                          setPageSize(Number(e.target.value) as any)
                        }
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>

                      <button
                        onClick={clearFilters}
                        className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                      >
                        Reset filters
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        disabled={safePage <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50"
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
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                {!isLoggedIn ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    Sign in to view and manage tickets.
                  </div>
                ) : pageItems.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
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
                        <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-md">
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

                              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                                <span>
                                  requester:{" "}
                                  <span className="font-semibold text-slate-800">
                                    {t.requester_username ?? "-"}
                                  </span>
                                </span>
                                <span>•</span>
                                <span>
                                  assignee:{" "}
                                  <span className="font-semibold text-slate-800">
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
                  <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                    {error}
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </main>

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
            <label className="text-sm font-semibold text-slate-700">
              Title
            </label>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Example: Dashboard access issue"
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Description (optional)
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Describe the issue..."
              className="min-h-[96px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Priority
            </label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
              <option value="urgent">urgent</option>
            </select>
          </div>

          {createError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              {createError}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setIsCreateOpen(false)}
              disabled={creating}
              className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              onClick={createTicket}
              disabled={creating}
              className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
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
              <div className="text-sm text-slate-500">Title</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">
                {selected.title}
              </div>

              <div className="mt-3 text-sm text-slate-500">Description</div>
              <div className="mt-1 text-sm text-slate-700">
                {selected.description || "No description provided."}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="text-xs font-semibold text-slate-600">
                    Requester
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {selected.requester_username ?? "-"}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="text-xs font-semibold text-slate-600">
                    Assignee
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {selected.assignee_username ?? "-"}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-slate-600">
                    Status
                  </label>
                  <select
                    value={selected.status}
                    disabled={detailsSaving}
                    onChange={(e) => saveDetails({ status: e.target.value })}
                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:opacity-60"
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
                  <label className="text-xs font-semibold text-slate-600">
                    Priority
                  </label>
                  <select
                    value={selected.priority}
                    disabled={detailsSaving}
                    onChange={(e) => saveDetails({ priority: e.target.value })}
                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:opacity-60"
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

              <div className="mt-4 grid gap-2 text-xs text-slate-500">
                <div>
                  Created:{" "}
                  <span className="font-semibold text-slate-700">
                    {new Date(selected.created_at).toLocaleString()}
                  </span>
                </div>
                <div>
                  Updated:{" "}
                  <span className="font-semibold text-slate-700">
                    {new Date(selected.updated_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {detailsError ? (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                  {detailsError}
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={closeDetails}
                disabled={detailsSaving}
                className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-60"
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
