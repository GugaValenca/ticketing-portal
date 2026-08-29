import { useEffect, useState } from "react";
import { api, auth, SESSION_EXPIRED_EVENT } from "../lib/api";
import type { Me, Priority, Ticket, UserOption } from "../types";

/**
 * Owns the current session (who's logged in), the ticket list, and the
 * assignee options - the workspace-wide data every screen depends on.
 * Also handles the initial silent session restore and reacting to the
 * axios interceptor's session-expired event.
 */
export function useWorkspace() {
  const [me, setMe] = useState<Me | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [assigneeOptions, setAssigneeOptions] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadMeAndTickets(options: { silent?: boolean } = {}) {
    setLoading(true);
    if (!options.silent) setError(null);
    try {
      const [meRes, ticketsRes] = await Promise.all([
        api.get<Me>("/api/me/"),
        api.get<Ticket[]>("/api/tickets/"),
      ]);
      setMe(meRes.data);
      setTickets(ticketsRes.data);

      try {
        const usersRes = await api.get<UserOption[]>("/api/users/");
        setAssigneeOptions(usersRes.data);
      } catch {
        setAssigneeOptions([]);
      }
    } catch {
      setMe(null);
      setTickets([]);
      setAssigneeOptions([]);
      // A silent restore attempt failing just means there is no active
      // session yet - that's expected for a fresh visitor, not an error.
      if (!options.silent) {
        setError("Failed to load workspace data. Please sign in again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function login(username: string, password: string, rememberMe: boolean) {
    setError(null);
    setLoading(true);
    try {
      await auth.login(username, password, rememberMe);
      await loadMeAndTickets();
    } catch {
      setError("Login failed. Check your username and password.");
      setLoading(false);
    }
  }

  async function logout() {
    await auth.logout();
    setMe(null);
    setTickets([]);
  }

  async function createTicket(payload: {
    title: string;
    description: string;
    priority: Priority;
    assigneeId: string;
  }) {
    const title = payload.title.trim();
    const apiPayload: {
      title: string;
      description: string;
      priority: Priority;
      assignee?: number | null;
    } = {
      title,
      description: payload.description.trim(),
      priority: payload.priority,
    };
    if (payload.assigneeId) apiPayload.assignee = Number(payload.assigneeId);

    await api.post("/api/tickets/", apiPayload);
    await loadMeAndTickets();
  }

  async function updateTicket(id: number, patch: Partial<Pick<Ticket, "status" | "priority">>) {
    const res = await api.patch<Ticket>(`/api/tickets/${id}/`, patch);
    const updated = res.data;
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
    return updated;
  }

  useEffect(() => {
    async function bootstrap() {
      await auth.ensureCsrfCookie();
      await loadMeAndTickets({ silent: true });
      setBootstrapping(false);
    }
    bootstrap();
  }, []);

  // Fired by the axios interceptor when a request 401s and the refresh
  // attempt also fails - reset to the logged-out view without a page reload.
  useEffect(() => {
    function handleSessionExpired() {
      setMe(null);
      setTickets([]);
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, []);

  return {
    me,
    tickets,
    assigneeOptions,
    loading,
    bootstrapping,
    error,
    isLoggedIn: !!me,
    refresh: () => loadMeAndTickets(),
    login,
    logout,
    createTicket,
    updateTicket,
  };
}
