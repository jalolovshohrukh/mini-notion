
export type Priority = "High" | "Medium" | "Low";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: Priority; // Added priority field
  columnId: string;
}

export interface Column {
  id: string;
  title: string;
  color: string; // Added color property (e.g., HEX string like "#FFFFFF")
}

