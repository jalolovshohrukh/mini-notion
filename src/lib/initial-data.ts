import type { Task, Column } from "@/lib/types";

// Using HSL values similar to theme for consistency
export const initialColumns: Column[] = [
  { id: "todo", title: "To Do", color: "240 5.9% 90%" }, // Muted Grayish Blue
  { id: "inprogress", title: "In Progress", color: "48 96.1% 88.8%" }, // Light Yellow
  { id: "done", title: "Done", color: "142.1 76.2% 81%" }, // Light Green
];

export const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Setup Project Structure",
    description: "Initialize Next.js app and configure Tailwind.",
    columnId: "done",
  },
  {
    id: "task-2",
    title: "Create Kanban Components",
    description: "Build Board, Column, and Task components.",
    columnId: "inprogress",
  },
  {
    id: "task-3",
    title: "Implement Drag and Drop",
    description: "Add drag and drop functionality for tasks.",
    columnId: "todo",
  },
  {
    id: "task-4",
    title: "Add Task Management Features",
    description: "Implement adding, editing, and deleting tasks.",
    columnId: "todo",
  },
   {
    id: "task-5",
    title: "Style the Board",
    description: "Apply the requested theme and styling.",
    columnId: "inprogress",
  },
   {
    id: "task-6",
    title: "Implement Add/Delete Columns",
    description: "Allow users to add and remove columns.",
    columnId: "todo",
   }
];
