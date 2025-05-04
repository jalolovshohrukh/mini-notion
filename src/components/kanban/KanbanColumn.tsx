
"use client";

import React, { useState } from "react";
import type { Column, Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AddTaskForm } from "./AddTaskForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils"; // Import cn utility


interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  draggingTaskId: string | null;
  onDrop: (columnId: string, taskId: string) => void;
  onAddTask: (columnId: string, newTask: Omit<Task, "id" | "columnId">) => void;
  onEditTask: (taskId: string, updatedTask: Omit<Task, "id" | "columnId">) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteColumn: (columnId: string) => void; // New prop
}

export function KanbanColumn({
  column,
  tasks,
  draggingTaskId,
  onDrop,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onDeleteColumn, // Destructure new prop
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      onDrop(column.id, taskId);
    }
  };

  const handleAddTaskSubmit = (newTask: Omit<Task, "id" | "columnId">) => {
    onAddTask(column.id, newTask);
  };

  const handleAddDialogClose = () => setIsAddDialogOpen(false);

  const confirmDeleteColumn = () => {
     onDeleteColumn(column.id);
     setIsDeleteDialogOpen(false); // Close confirmation dialog
  }

  // Use inline style to set the background color dynamically
  const columnStyle = {
    backgroundColor: `hsl(${column.color})`,
  };

   // Style for the header to ensure it uses the same background
  const headerStyle = {
    backgroundColor: `hsl(${column.color})`,
  };

  return (
    <div
      // Set fixed width for columns, ensure they don't shrink
      className={cn(
          "flex flex-col w-72 flex-shrink-0 rounded-lg shadow-inner h-full transition-colors duration-200",
          isOver ? "ring-2 ring-primary ring-offset-2" : "" // Indicate drop target with ring
        )}
      style={columnStyle} // Apply dynamic background color
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Apply dynamic background color to header as well, ensure sufficient contrast for text */}
      <div
        className="p-4 border-b border-border/50 flex justify-between items-center sticky top-0 rounded-t-lg z-10"
        style={headerStyle} // Apply header background color
      >
         {/* Use foreground color for better contrast, consider adding dark/light text logic based on column.color lightness */}
        <h2 className="text-lg font-semibold text-foreground truncate pr-2">
          {column.title} ({tasks.length})
        </h2>
        <div className="flex items-center space-x-1">
           {/* Add Task Dialog Trigger - use foreground for icon */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-foreground hover:bg-foreground/10">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add Task</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <AddTaskForm columnId={column.id} onAddTask={handleAddTaskSubmit} onClose={handleAddDialogClose} />
            </DialogContent>
          </Dialog>

           {/* Column Options Dropdown - use foreground for icon */}
           <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-foreground hover:bg-foreground/10">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Column Options</span>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                {/* Alert Dialog Trigger for Delete */}
                <AlertDialogTrigger asChild>
                     {/* Destructive text color should work against most backgrounds */}
                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete Column</span>
                    </DropdownMenuItem>
                </AlertDialogTrigger>
                {/* Add other options like 'Rename Column' here if needed */}
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete Confirmation Dialog Content */}
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the
                    <span className="font-semibold"> {column.title}</span> column and all tasks within it.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDeleteColumn} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
           </AlertDialog>
        </div>

      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="min-h-[200px]"> {/* Ensure droppable area even when empty */}
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              // columnId prop is no longer needed for styling TaskCard background
              isDragging={draggingTaskId === task.id}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
           {tasks.length === 0 && !isOver && (
             // Use muted foreground for better contrast on potentially colored backgrounds
             <div className="text-center text-muted-foreground/80 p-4 italic">
               Drag tasks here or click '+' to add.
             </div>
           )}
           {isOver && (
             <div className="h-16 border-2 border-dashed border-primary/50 rounded-md bg-primary/10 flex items-center justify-center text-primary font-medium">
               Drop here
             </div>
           )}
        </div>
      </ScrollArea>
    </div>
  );
}
