
"use client";

import React, { useState } from "react";
import type { Task } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { EditTaskForm } from "./EditTaskForm";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  // columnId is removed as it's no longer used for styling here
  isDragging: boolean;
  onEditTask: (taskId: string, updatedTask: Omit<Task, "id" | "columnId">) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskCard({ task, isDragging, onEditTask, onDeleteTask }: TaskCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditDialogClose = () => setIsEditDialogOpen(false);

  // Remove the cardBackgroundColor function, cards will use the default theme background

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <Card
        data-task-id={task.id} // Add data attribute for easier identification
        className={cn(
          "mb-3 cursor-grab transition-opacity duration-300 ease-in-out",
          "bg-card text-card-foreground", // Explicitly use card background/foreground from theme
          isDragging ? "opacity-50 shadow-lg scale-105" : "opacity-100 shadow-sm", // Added scale on drag
          "hover:shadow-md relative group"
          // Removed conditional background color class application
        )}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("taskId", task.id);
          e.dataTransfer.effectAllowed = "move"; // Indicate the type of operation allowed
        }}
      >
        <CardHeader className="p-4">
          <CardTitle className="text-base font-medium mb-1 flex justify-between items-center">
            {task.title}
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
                aria-label="Edit Task"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </CardTitle>
          {task.description && (
            <CardDescription className="text-sm text-muted-foreground">
              {task.description}
            </CardDescription>
          )}
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
