export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string;
}

export interface Column {
  id: string;
  title: string;
}
