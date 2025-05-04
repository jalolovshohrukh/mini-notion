import type { Task, Column } from "@/lib/types";

export const initialColumns: Column[] = [
  { id: "todo", title: "To Do" },
  { id: "inprogress", title: "In Progress" },
  { id: "done", title: "Done" },
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
];
