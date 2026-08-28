import { useEffect, useMemo, useState } from "react";
import { usDateToBoundary } from "../lib/dates";
import type { Me, PageSize, ReportDateField, SidebarFilter, SortKey, Ticket } from "../types";

type StatusFilter = "all" | "open" | "in_progress" | "resolved" | "closed";
type PriorityFilter = "all" | "low" | "medium" | "high" | "urgent";

const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
const STATUS_ORDER: Record<string, number> = { open: 0, in_progress: 1, resolved: 2, closed: 3 };

/**
 * Owns every filter/sort/pagination control on the tickets list, and
 * derives the filtered+sorted+paginated ticket set and dashboard counts
 * from them. Pure derived state - `tickets` and `me` are the only inputs
 * that come from outside.
 */
export function useTicketFilters(tickets: Ticket[], me: Me | null) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [hideResolved, setHideResolved] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [page, setPage] = useState(1);
  const [sidebarFilter, setSidebarFilter] = useState<SidebarFilter>("inbox");

  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [reportDateField, setReportDateField] = useState<ReportDateField>("created_at");
  const [appliedReportStartDate, setAppliedReportStartDate] = useState("");
  const [appliedReportEndDate, setAppliedReportEndDate] = useState("");
  const [appliedReportDateField, setAppliedReportDateField] =
    useState<ReportDateField>("created_at");
  const [reportError, setReportError] = useState<string | null>(null);

  // Debounce (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Reset to page 1 whenever a filter/sort/page-size changes. This has to
  // stay keyed off debouncedQuery (not query) so paging doesn't reset on
  // every keystroke, only once the search actually takes effect.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [debouncedQuery, statusFilter, priorityFilter, hideResolved, sortKey, pageSize]);

  function clearFilters() {
    setQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setHideResolved(false);
    setSortKey("newest");
    setSidebarFilter("inbox");
    setReportDateField("created_at");
    setReportStartDate("");
    setReportEndDate("");
    setAppliedReportDateField("created_at");
    setAppliedReportStartDate("");
    setAppliedReportEndDate("");
    setReportError(null);
    setPage(1);
  }

  function applyReportFilters() {
    setReportError(null);

    const startDate = reportStartDate ? usDateToBoundary(reportStartDate, "start") : null;
    const endDate = reportEndDate ? usDateToBoundary(reportEndDate, "end") : null;

    if (reportStartDate && !startDate) {
      setReportError("Invalid start date. Use MM/DD/YYYY.");
      return;
    }
    if (reportEndDate && !endDate) {
      setReportError("Invalid end date. Use MM/DD/YYYY.");
      return;
    }
    if (startDate && endDate && startDate > endDate) {
      setReportError("Start date cannot be after end date.");
      return;
    }

    setAppliedReportDateField(reportDateField);
    setAppliedReportStartDate(reportStartDate);
    setAppliedReportEndDate(reportEndDate);
    setPage(1);
  }

  function applySidebarFilter(filter: SidebarFilter) {
    setSidebarFilter(filter);
    setPage(1);
  }

  const filteredSortedTickets = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();

    const filtered = tickets.filter((t) => {
      const matchesQuery =
        !q || t.title.toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" ? true : t.status === statusFilter;
      const matchesPriority = priorityFilter === "all" ? true : t.priority === priorityFilter;
      const matchesResolvedVisibility = hideResolved ? t.status !== "resolved" : true;

      const ticketReportDate = new Date(t[appliedReportDateField]);
      const reportStart = appliedReportStartDate
        ? usDateToBoundary(appliedReportStartDate, "start")
        : null;
      const reportEnd = appliedReportEndDate ? usDateToBoundary(appliedReportEndDate, "end") : null;
      const matchesReportRange =
        !reportStart && !reportEnd
          ? true
          : Number.isNaN(ticketReportDate.getTime())
            ? false
            : (!reportStart || ticketReportDate >= reportStart) &&
              (!reportEnd || ticketReportDate <= reportEnd);

      const matchesSidebar =
        sidebarFilter === "inbox"
          ? true
          : sidebarFilter === "my_tickets"
            ? !!me &&
              (t.requester_username === me.username || t.assignee_username === me.username)
            : sidebarFilter === "unassigned"
              ? !t.assignee_username
              : t.priority === "urgent" && t.status !== "resolved" && t.status !== "closed";

      return (
        matchesQuery &&
        matchesStatus &&
        matchesPriority &&
        matchesResolvedVisibility &&
        matchesReportRange &&
        matchesSidebar
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortKey === "newest")
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortKey === "oldest")
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

      if (sortKey === "priority") {
        const ap = PRIORITY_ORDER[a.priority] ?? 99;
        const bp = PRIORITY_ORDER[b.priority] ?? 99;
        if (ap !== bp) return ap - bp;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }

      const as = STATUS_ORDER[a.status] ?? 99;
      const bs = STATUS_ORDER[b.status] ?? 99;
      if (as !== bs) return as - bs;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [
    tickets,
    debouncedQuery,
    statusFilter,
    priorityFilter,
    hideResolved,
    sortKey,
    sidebarFilter,
    me,
    appliedReportDateField,
    appliedReportStartDate,
    appliedReportEndDate,
  ]);

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
      my_tickets: me
        ? tickets.filter(
            (t) => t.requester_username === me.username || t.assignee_username === me.username,
          ).length
        : 0,
      dueToday: tickets.filter((t) => new Date(t.updated_at).toDateString() === today).length,
    };
  }, [tickets, me]);

  return {
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    hideResolved,
    setHideResolved: () => setHideResolved((prev) => !prev),
    sortKey,
    setSortKey,
    pageSize,
    setPageSize,
    sidebarFilter,
    applySidebarFilter,
    reportStartDate,
    setReportStartDate,
    reportEndDate,
    setReportEndDate,
    reportDateField,
    setReportDateField,
    reportError,
    applyReportFilters,
    clearFilters,
    pageItems,
    total,
    totalPages,
    safePage,
    startIndex,
    endIndex,
    dashboardStats,
    prevPage: () => setPage((p) => Math.max(1, p - 1)),
    nextPage: () => setPage((p) => Math.min(totalPages, p + 1)),
  };
}
