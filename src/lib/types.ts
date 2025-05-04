export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string;
}

export interface Column {
  id: string;
  title: string;
  color: string; // Added color property (e.g., HSL string like "210 40% 96.1%")
}
