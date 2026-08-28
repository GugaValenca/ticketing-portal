import { StatTile } from "./ui/Badges";
import { COMPANY_NAME, COMPANY_TAGLINE } from "../branding";

export function DashboardSummary({
  inbox,
  unassigned,
  overdue,
  myTickets,
  dueToday,
}: {
  inbox: number;
  unassigned: number;
  overdue: number;
  myTickets: number;
  dueToday: number;
}) {
  return (
    <section className="rounded-xl border border-indigo-100 bg-white/95 p-4 shadow-sm">
      <h1 className="text-lg font-semibold text-slate-900">{COMPANY_NAME} Dashboard</h1>
      <p className="mt-1 text-sm text-slate-600">{COMPANY_TAGLINE}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatTile label="Inbox" value={inbox} />
        <StatTile label="Unassigned" value={unassigned} />
        <StatTile label="Overdue" value={overdue} />
        <StatTile label="My tickets" value={myTickets} />
        <StatTile label="Due today" value={dueToday} />
      </div>
    </section>
  );
}
