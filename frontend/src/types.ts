export type Me = {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
};

export type Priority = "low" | "medium" | "high" | "urgent";
export type Status = "open" | "in_progress" | "resolved" | "closed";

export type Ticket = {
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

export type SidebarFilter = "inbox" | "my_tickets" | "unassigned" | "overdue";
export type ReportDateField = "created_at" | "updated_at";
export type SortKey = "newest" | "oldest" | "priority" | "status";
export type PageSize = 10 | 20 | 50;

export type UserOption = {
  id: number;
  username: string;
};
