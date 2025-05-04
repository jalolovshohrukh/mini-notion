
"use client";

import React, { useState } from "react";
import type { Task, Priority } from "@/lib/types"; // Import Priority
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, badgeVariants } from "@/components/ui/badge"; // Import Badge and variants type
import { Edit } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { EditTaskForm } from "./EditTaskForm";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority"; // Import VariantProps

interface TaskCardProps {
  task: Task;
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


export function TaskCard({ task, isDragging, onEditTask, onDeleteTask }: TaskCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditDialogClose = () => setIsEditDialogOpen(false);

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <Card
        data-task-id={task.id} // Add data attribute for easier identification
        className={cn(
          "mb-3 cursor-grab transition-opacity duration-300 ease-in-out",
          "bg-card text-card-foreground", // Explicitly use card background/foreground from theme
          isDragging ? "opacity-50 shadow-lg scale-105" : "opacity-100 shadow-sm", // Added scale on drag
          "hover:shadow-md relative group"
        )}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("taskId", task.id);
          e.dataTransfer.effectAllowed = "move"; // Indicate the type of operation allowed
        }}
      >
        <CardHeader className="p-3 space-y-1"> {/* Reduced padding and space */}
          <div className="flex justify-between items-start gap-2">
              <CardTitle className="text-sm font-medium line-clamp-2"> {/* Adjusted size and line clamp */}
                {task.title}
              </CardTitle>
              {/* Edit button appears on hover */}
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" // Added shrink-0
                  aria-label="Edit Task"
                >
                  <Edit className="h-3 w-3" /> {/* Slightly smaller icon */}
                </Button>
              </DialogTrigger>
          </div>
          {/* Description */}
          {task.description && (
            <CardDescription className="text-xs text-muted-foreground line-clamp-3"> {/* Adjusted size and line clamp */}
              {task.description}
            </CardDescription>
          )}
           {/* Priority Badge */}
           <div className="flex justify-start pt-1">
             <Badge variant={getPriorityBadgeVariant(task.priority)} className="text-xs px-1.5 py-0.5"> {/* Smaller badge */}
               {task.priority || "Medium"}
             </Badge>
           </div>
        </CardHeader>
      </Card>
      <DialogContent className="sm:max-w-[425px]">
         <EditTaskForm
            task={task}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onClose={handleEditDialogClose}
          />
      </DialogContent>
    </Dialog>
  );
}
