import { useState } from "react";
import { useWorkspace } from "./hooks/useWorkspace";
import { useTicketFilters } from "./hooks/useTicketFilters";
import { LoginScreen } from "./components/LoginScreen";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { DashboardSummary } from "./components/DashboardSummary";
import { ReportFilters } from "./components/ReportFilters";
import { TicketToolbar } from "./components/TicketToolbar";
import { TicketList } from "./components/TicketList";
import { CreateTicketModal } from "./components/CreateTicketModal";
import { TicketDetailsModal } from "./components/TicketDetailsModal";
import type { Priority, Ticket } from "./types";

export default function App() {
  const workspace = useWorkspace();
  const filters = useTicketFilters(workspace.tickets, workspace.me);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Create ticket modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");
  const [newAssigneeId, setNewAssigneeId] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Ticket details modal
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [detailsSaving, setDetailsSaving] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    await workspace.login(username, password);
  }

  function openCreateModal() {
    if (!workspace.isLoggedIn) return;
    setCreateError(null);
    setNewTitle("");
    setNewDescription("");
    setNewPriority("medium");
    setNewAssigneeId("");
    setIsCreateOpen(true);
  }

  async function handleCreateTicket() {
    setCreateError(null);
    if (newTitle.trim().length < 3) {
      setCreateError("Title must be at least 3 characters.");
      return;
    }

    setCreating(true);
    try {
      await workspace.createTicket({
        title: newTitle,
        description: newDescription,
        priority: newPriority,
        assigneeId: newAssigneeId,
      });
      setIsCreateOpen(false);
    } catch {
      setCreateError("Could not create ticket. Confirm you are signed in.");
    } finally {
      setCreating(false);
    }
  }

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

  async function saveDetails(patch: Partial<Pick<Ticket, "status" | "priority">>) {
    if (!selected) return;
    setDetailsSaving(true);
    setDetailsError(null);
    try {
      const updated = await workspace.updateTicket(selected.id, patch);
      setSelected((prev) => (prev ? { ...prev, ...updated } : prev));
    } catch {
      setDetailsError("Could not update this ticket. Please try again.");
    } finally {
      setDetailsSaving(false);
    }
  }

  if (workspace.bootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#120825] text-sm text-indigo-200">
        Loading...
      </div>
    );
  }

  if (!workspace.isLoggedIn) {
    return (
      <LoginScreen
        username={username}
        password={password}
        rememberMe={rememberMe}
        loading={workspace.loading}
        error={workspace.error}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
        onRememberMeChange={setRememberMe}
        onSubmit={handleLogin}
      />
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
        <Sidebar
          username={workspace.me?.username}
          active={filters.sidebarFilter}
          counts={{
            inbox: filters.dashboardStats.inbox,
            my_tickets: filters.dashboardStats.my_tickets,
            unassigned: filters.dashboardStats.unassigned,
            overdue: filters.dashboardStats.overdue,
          }}
          onSelect={filters.applySidebarFilter}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar
            onRefresh={workspace.refresh}
            onNewTicket={openCreateModal}
            onSignOut={workspace.logout}
          />

          <main className="flex-1 p-4 sm:p-6">
            <div className="space-y-4">
              <DashboardSummary
                inbox={filters.dashboardStats.inbox}
                unassigned={filters.dashboardStats.unassigned}
                overdue={filters.dashboardStats.overdue}
                myTickets={filters.dashboardStats.my_tickets}
                dueToday={filters.dashboardStats.dueToday}
              />

              <ReportFilters
                dateField={filters.reportDateField}
                startDate={filters.reportStartDate}
                endDate={filters.reportEndDate}
                error={filters.reportError}
                onDateFieldChange={filters.setReportDateField}
                onStartDateChange={filters.setReportStartDate}
                onEndDateChange={filters.setReportEndDate}
                onApply={filters.applyReportFilters}
              />

              <section className="rounded-xl border border-indigo-100 bg-white/95 p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Tickets</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Search, filter, sort, and update tickets in one place.
                    </p>
                  </div>

                  <div className="text-sm text-slate-500">
                    {workspace.loading
                      ? "Loading tickets..."
                      : filters.total === 0
                        ? "No matching results"
                        : `Showing ${filters.startIndex + 1}-${filters.endIndex} of ${filters.total}`}
                  </div>
                </div>

                <TicketToolbar
                  query={filters.query}
                  statusFilter={filters.statusFilter}
                  priorityFilter={filters.priorityFilter}
                  sortKey={filters.sortKey}
                  pageSize={filters.pageSize}
                  hideResolved={filters.hideResolved}
                  page={filters.safePage}
                  totalPages={filters.totalPages}
                  onQueryChange={filters.setQuery}
                  onStatusFilterChange={filters.setStatusFilter}
                  onPriorityFilterChange={filters.setPriorityFilter}
                  onSortKeyChange={filters.setSortKey}
                  onPageSizeChange={filters.setPageSize}
                  onToggleHideResolved={filters.setHideResolved}
                  onResetFilters={filters.clearFilters}
                  onPrevPage={filters.prevPage}
                  onNextPage={filters.nextPage}
                />

                <div className="mt-4">
                  <TicketList tickets={filters.pageItems} onSelect={openDetails} />

                  {workspace.error ? (
                    <div className="mt-4 rounded-xl border border-rose-300/35 bg-rose-500/15 p-3 text-sm text-rose-100">
                      {workspace.error}
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>

      <CreateTicketModal
        open={isCreateOpen}
        title={newTitle}
        description={newDescription}
        priority={newPriority}
        assigneeId={newAssigneeId}
        assigneeOptions={workspace.assigneeOptions}
        error={createError}
        creating={creating}
        onTitleChange={setNewTitle}
        onDescriptionChange={setNewDescription}
        onPriorityChange={setNewPriority}
        onAssigneeIdChange={setNewAssigneeId}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateTicket}
      />

      <TicketDetailsModal
        open={isDetailsOpen}
        ticket={selected}
        saving={detailsSaving}
        error={detailsError}
        canEditPriority={!!workspace.me?.is_staff || !!workspace.me?.is_superuser}
        onClose={closeDetails}
        onStatusChange={(status) => saveDetails({ status })}
        onPriorityChange={(priority) => saveDetails({ priority })}
      />
    </div>
  );
}
