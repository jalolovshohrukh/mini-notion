
"use client";

import React, { useState } from "react";
import type { Task, Priority, Column } from "@/lib/types"; // Import Column type
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Import Avatar components
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"; // Import Sheet components
import { TaskDetailSheet } from "./TaskDetailSheet"; // Import the new detail sheet component
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
             <div className="flex justify-between items-center pt-1">
               <Badge variant={getPriorityBadgeVariant(task.priority)} className="text-xs px-1.5 py-0.5">
                 {task.priority || "Medium"}
               </Badge>
                {/* Display Assignee Avatar and Name */}
                {task.assigneeName && (
                  <div className="flex items-center space-x-1.5"> {/* Reduced space */}
                     <Avatar className="h-5 w-5"> {/* Made avatar slightly smaller */}
                         {/* <AvatarImage src="/path/to/avatar.jpg" alt={task.assigneeName} /> */}
                         <AvatarFallback className="text-[10px] bg-muted text-muted-foreground"> {/* Smaller text */}
                             {getInitials(task.assigneeName)}
                         </AvatarFallback>
                     </Avatar>
                      <span className="text-xs text-muted-foreground truncate">{task.assigneeName}</span> {/* Show full name */}
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
