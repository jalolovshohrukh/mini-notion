
export type Priority = "High" | "Medium" | "Low";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: Priority; // Added priority field
  columnId: string;
  assigneeId?: string; // Optional: ID of the user assigned to the task
  assigneeName?: string; // Optional: Display name of the assignee
}

export interface Column {
  id: string;
  title: string;
  color: string; // Added color property (e.g., HEX string like "#FFFFFF")
}
