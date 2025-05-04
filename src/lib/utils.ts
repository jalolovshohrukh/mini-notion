import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to generate unique IDs (client-side)
export const generateTaskId = () => `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
export const generateColumnId = () => `col-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;