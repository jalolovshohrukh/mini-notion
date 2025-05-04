
"use client";

import React, { useState } from "react";
import type { Task, Priority, Column } from "@/lib/types"; // Import Column type
import { format, parseISO, isPast } from 'date-fns'; // Import date-fns
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Import Avatar components
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"; // Import Sheet components
import { TaskDetailSheet } from "./TaskDetailSheet"; // Import the new detail sheet component
import { CalendarIcon } from "lucide-react"; // Import Calendar icon
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

interface TaskCardProps {
  task: Task;
  column: Column; // Add column prop
  isDragging: boolean;
  onEditTask: (taskId: string, updatedTask: Omit<Task, "id" | "columnId">) => void;
  onDeleteTask: (taskId: string) => void;
}

// Helper function to get badge variant based on priority
const getPriorityBadgeVariant = (priority: Priority | undefined): VariantProps<typeof badgeVariants>["variant"] => {
    switch (priority) {
        case "High":
            return "destructive"; // Red for High
        case "Medium":
            return "warning"; // Yellow for Medium
        case "Low":
            return "default"; // Default (primary/teal) for Low
        default:
            return "secondary"; // Fallback (gray) if undefined
    }
};

// Helper function to get initials from name
const getInitials = (name?: string): string => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
};


export function TaskCard({ task, column, isDragging, onEditTask, onDeleteTask }: TaskCardProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false); // State to control the sheet
  const dueDate = task.dueDate ? parseISO(task.dueDate) : null;
  const isDueDatePast = dueDate && isPast(dueDate) && !isDateToday(dueDate); // Check if due date is past (and not today)


  // Helper function to check if a date is today
   function isDateToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Card
          data-task-id={task.id}
          className={cn(
            "mb-3 cursor-pointer transition-opacity duration-300 ease-in-out", // Changed cursor to pointer
            "bg-card text-card-foreground",
            isDragging ? "opacity-50 shadow-lg scale-105" : "opacity-100 shadow-sm",
            "hover:shadow-md relative group"
          )}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("taskId", task.id);
            e.dataTransfer.effectAllowed = "move";
          }}
          // onClick={() => setIsSheetOpen(true)} // Open sheet on click - handled by SheetTrigger
        >
          <CardHeader className="p-3 space-y-2"> {/* Adjusted spacing */}
            <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-sm font-medium line-clamp-2">
                  {task.title}
                </CardTitle>
                {/* Removed Edit button - details shown in sheet */}
            </div>
            {task.description && (
              <CardDescription className="text-xs text-muted-foreground line-clamp-3">
                {task.description}
              </CardDescription>
            )}
             <div className="flex justify-between items-end pt-1"> {/* Use items-end */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1"> {/* Wrap badges */}
                    <Badge variant={getPriorityBadgeVariant(task.priority)} className="text-xs px-1.5 py-0.5">
                        {task.priority || "Medium"}
                    </Badge>
                    {/* Display Due Date */}
                    {dueDate && (
                       <Badge
                           variant={isDueDatePast ? "destructive" : "outline"}
                           className={cn(
                               "text-xs px-1.5 py-0.5 font-normal", // lighter font
                               isDueDatePast ? "text-destructive-foreground" : "text-muted-foreground" // Dim color for outline
                           )}
                       >
                           <CalendarIcon className="mr-1 h-3 w-3" /> {/* Smaller icon */}
                           {format(dueDate, "MMM d")}
                        </Badge>
                    )}
                </div>

                {/* Display Assignee Avatar and Name */}
                {task.assigneeName && (
                  <div className="flex items-center space-x-1 flex-shrink-0 ml-2"> {/* Allow shrinking, add margin */}
                     <Avatar className="h-5 w-5"> {/* Made avatar slightly smaller */}
                         {/* <AvatarImage src="/path/to/avatar.jpg" alt={task.assigneeName} /> */}
                         <AvatarFallback className="text-[10px] bg-muted text-muted-foreground"> {/* Smaller text */}
                             {getInitials(task.assigneeName)}
                         </AvatarFallback>
                     </Avatar>
                      {/* Hide name on small screens or if too long? Consider tooltip */}
                      {/* <span className="text-xs text-muted-foreground truncate">{task.assigneeName}</span> */}
                  </div>
                )}
             </div>
          </CardHeader>
        </Card>
      </SheetTrigger>
       <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto">
          <TaskDetailSheet
            task={task}
            column={column} // Pass column to the sheet
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onClose={() => setIsSheetOpen(false)}
          />
       </SheetContent>
    </Sheet>
  );
}
     