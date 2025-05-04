
import type { Task, Column } from "@/lib/types";
import { addDays, formatISO } from 'date-fns'; // Import date-fns for date manipulation

// Get today's date for relative due dates
const today = new Date();

// Using HEX values similar to common UI palettes
export const initialColumns: Column[] = [
  { id: "todo", title: "To Do", color: "#E5E7EB" }, // Tailwind gray-200
  { id: "inprogress", title: "In Progress", color: "#FEF3C7" }, // Tailwind yellow-100
  { id: "done", title: "Done", color: "#D1FAE5" }, // Tailwind green-100
];

export const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Setup Project Structure",
    description: "Initialize Next.js app and configure Tailwind.",
    priority: "High",
    columnId: "done",
    assigneeId: "user-1", // Ilhom
    assigneeName: "Ilhom",
    dueDate: formatISO(addDays(today, -2), { representation: 'date' }), // Example: 2 days ago
  },
  {
    id: "task-2",
    title: "Create Kanban Components",
    description: "Build Board, Column, and Task components.",
    priority: "High",
    columnId: "inprogress",
     assigneeId: "user-2", // Parvina
    assigneeName: "Parvina",
    dueDate: formatISO(addDays(today, 3), { representation: 'date' }), // Example: 3 days from now
  },
  {
    id: "task-3",
    title: "Implement Drag and Drop",
    description: "Add drag and drop functionality for tasks.",
    priority: "Medium",
    columnId: "todo",
    // No assignee
     dueDate: formatISO(addDays(today, 7), { representation: 'date' }), // Example: 1 week from now
  },
  {
    id: "task-4",
    title: "Add Task Management Features",
    description: "Implement adding, editing, and deleting tasks.",
    priority: "Low",
    columnId: "todo",
     assigneeId: "user-1", // Ilhom
     assigneeName: "Ilhom",
     // No due date
  },
   {
    id: "task-5",
    title: "Style the Board",
    description: "Apply the requested theme and styling.",
    priority: "Medium",
    columnId: "inprogress",
     assigneeId: "user-2", // Parvina
     assigneeName: "Parvina",
     dueDate: formatISO(addDays(today, 5), { representation: 'date' }), // Example: 5 days from now
  },
   {
    id: "task-6",
    title: "Implement Add/Delete Columns",
    description: "Allow users to add and remove columns.",
    priority: "High",
    columnId: "todo",
    assigneeId: "user-3", // Madina
    assigneeName: "Madina",
    dueDate: formatISO(addDays(today, 10), { representation: 'date' }), // Example: 10 days from now
   }
];
