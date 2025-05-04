import type { Task, Column } from "@/lib/types";
import { addDays, formatISO } from 'date-fns';

const today = new Date();

// Keep IDs and colors, titles will be handled by user input or translation layer
export const initialColumns: Column[] = [
  { id: "todo", title: "To Do", color: "#E5E7EB" }, // User can rename this
  { id: "inprogress", title: "In Progress", color: "#FEF3C7" }, // User can rename this
  { id: "done", title: "Done", color: "#D1FAE5" }, // User can rename this
];

// Titles/Descriptions are kept simple as they likely won't be translated if generated client-side like this.
// If this data came from a DB, it could have localized fields.
export const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Setup Project", // Keep simple title
    // description: "Initialize Next.js app and configure Tailwind.", // Remove description or keep simple
    priority: "High",
    columnId: "done",
    assigneeId: "user-1",
    assigneeName: "Ilhom", // Store original name
    dueDate: formatISO(addDays(today, -2), { representation: 'date' }),
  },
  {
    id: "task-2",
    title: "Create Components", // Keep simple title
    // description: "Build Board, Column, and Task components.",
    priority: "High",
    columnId: "inprogress",
    assigneeId: "user-2",
    assigneeName: "Parvina",
    dueDate: formatISO(addDays(today, 3), { representation: 'date' }),
  },
  {
    id: "task-3",
    title: "Implement Drag/Drop", // Keep simple title
    // description: "Add drag and drop functionality for tasks.",
    priority: "Medium",
    columnId: "todo",
    dueDate: formatISO(addDays(today, 7), { representation: 'date' }),
  },
  {
    id: "task-4",
    title: "Task Management", // Keep simple title
    // description: "Implement adding, editing, and deleting tasks.",
    priority: "Low",
    columnId: "todo",
    assigneeId: "user-1",
    assigneeName: "Ilhom",
  },
   {
    id: "task-5",
    title: "Style Board", // Keep simple title
    // description: "Apply the requested theme and styling.",
    priority: "Medium",
    columnId: "inprogress",
     assigneeId: "user-2",
     assigneeName: "Parvina",
     dueDate: formatISO(addDays(today, 5), { representation: 'date' }),
  },
   {
    id: "task-6",
    title: "Column Management", // Keep simple title
    // description: "Allow users to add and remove columns.",
    priority: "High",
    columnId: "todo",
    assigneeId: "user-3",
    assigneeName: "Madina",
    dueDate: formatISO(addDays(today, 10), { representation: 'date' }),
   }
];
