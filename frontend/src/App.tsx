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

function RoleBadge({ me }: { me: Me }) {
  const role = me.is_superuser ? "Superuser" : me.is_staff ? "Staff" : "User";
  const showStar = me.is_superuser;

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        me.is_superuser
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : me.is_staff
            ? "border-indigo-200 bg-indigo-50 text-indigo-800"
            : "border-slate-200 bg-slate-50 text-slate-700",
      )}
      title="Role"
    >
      {showStar ? <span aria-hidden>⭐</span> : null}
      {role}
    </span>
  );
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
      <div className="relative mx-auto mt-16 w-full max-w-lg px-4">
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

export default function App() {
  const [me, setMe] = useState<Me | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState("GugaTampa");
  const [password, setPassword] = useState("Guga@12345");
  const [error, setError] = useState<string | null>(null);

  // Create ticket modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<
    "low" | "medium" | "high" | "urgent"
  >("medium");
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Filters/search
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "open" | "in_progress" | "resolved" | "closed"
  >("all");
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "low" | "medium" | "high" | "urgent"
  >("all");

  const isLoggedIn = useMemo(() => !!me, [me]);

  async function loadMeAndTickets() {
    setLoading(true);
    setError(null);
    try {
      const meRes = await api.get<Me>("/api/me/");
      setMe(meRes.data);

      const ticketsRes = await api.get<Ticket[]>("/api/tickets/");
      setTickets(ticketsRes.data);
    } catch {
      setError("Falhou ao carregar dados. Verifica login/token.");
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
      setError("Login failed. Check username/password.");
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
      setCreateError("O título precisa ter pelo menos 3 caracteres.");
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
      setCreateError("Não consegui criar o ticket. Verifica se tu tá logado.");
    } finally {
      setCreating(false);
    }
  }

  function clearFilters() {
    setQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
  }

  const filteredTickets = useMemo(() => {
    const q = query.trim().toLowerCase();

    return tickets.filter((t) => {
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
  }, [tickets, query, statusFilter, priorityFilter]);

  useEffect(() => {
    if (auth.getTokens()?.access) loadMeAndTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 text-slate-900">
      <Header
        user={me}
        onReload={loadMeAndTickets}
        onLogout={handleLogout}
        onNewTicket={openCreateModal}
      />

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            {!isLoggedIn ? (
              <>
                <h2 className="text-lg font-semibold">Entrar</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Use um usuário do seed (ex: GugaTampa / LaisLany / admin).
                </p>

                <form
                  onSubmit={handleLogin}
                  className="mt-5 grid gap-4 sm:max-w-xl sm:grid-cols-2"
                >
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Username
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

                  <div className="sm:col-span-2 flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
                    >
                      {loading ? "Entrando..." : "Entrar"}
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm text-slate-600">Logado como</div>
                    <div className="truncate text-lg font-semibold">
                      {me!.username}
                    </div>
                    <RoleBadge me={me!} />
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    {me!.email || "—"}
                  </div>
                </div>
                <div className="text-sm text-slate-500">
                  {loading ? "Sincronizando..." : "Tudo certo ✅"}
                </div>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Tickets
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Busque e filtre rapidamente como num app de verdade.
                  </p>
                </div>

                <div className="text-sm text-slate-500">
                  {loading
                    ? "Carregando..."
                    : `${filteredTickets.length} de ${tickets.length}`}
                </div>
              </div>

              {/* Filters */}
              <div className="mt-4 grid gap-3 md:grid-cols-12">
                <div className="md:col-span-6">
                  <label className="text-xs font-semibold text-slate-600">
                    Buscar
                  </label>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar por título ou descrição…"
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div className="md:col-span-3">
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

                <div className="md:col-span-3">
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

                <div className="md:col-span-12 flex items-center justify-between gap-2">
                  <div className="text-xs text-slate-500">
                    Dica: use os filtros pra simular um painel real de startup.
                  </div>

                  <button
                    onClick={clearFilters}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    Limpar filtros
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="mt-4">
                {!isLoggedIn ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    Faça login para visualizar seus tickets.
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
                    Nada encontrado com esses filtros.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {filteredTickets.map((t) => (
                      <article
                        key={t.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-[1px] hover:shadow-md"
                      >
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
                                (sem descrição)
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

        <div className="mt-6 text-center text-xs text-slate-500">
          Próximo: paginação e ordenação (ex: newest, priority, status).
        </div>
      </main>

      {/* Create Ticket Modal */}
      <Modal
        open={isCreateOpen}
        title="Novo ticket"
        onClose={() => {
          if (!creating) setIsCreateOpen(false);
        }}
      >
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Título
            </label>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ex: Erro ao acessar dashboard"
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Descrição (opcional)
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Descreva o problema…"
              className="min-h-[96px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Prioridade
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
              Cancelar
            </button>

            <button
              onClick={createTicket}
              disabled={creating}
              className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {creating ? "Criando..." : "Criar ticket"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
