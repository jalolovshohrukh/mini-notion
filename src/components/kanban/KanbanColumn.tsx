
"use client";

import React, { useState } from "react";
import type { Column, Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, MoreHorizontal, Pencil } from "lucide-react"; // Added Pencil icon
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AddTaskForm } from "./AddTaskForm";
import { EditColumnForm } from "./EditColumnForm"; // Import the new form
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator, // Added Separator
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
  onDeleteColumn: (columnId: string) => void;
  onEditColumn: (columnId: string, newTitle: string, newColor: string) => void; // New prop
}

export function KanbanColumn({
  column,
  tasks,
  draggingTaskId,
  onDrop,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onDeleteColumn,
  onEditColumn, // Destructure new prop
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // State for edit dialog
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
  const handleEditDialogClose = () => setIsEditDialogOpen(false); // Close handler for edit dialog

  const confirmDeleteColumn = () => {
     onDeleteColumn(column.id);
     setIsDeleteDialogOpen(false); // Close confirmation dialog
  }

  // Use inline style to set the background color dynamically using the HEX value
  const columnStyle = {
    backgroundColor: column.color, // Directly use the HEX color string
  };

   // Style for the header to ensure it uses the same background
  const headerStyle = {
    backgroundColor: column.color, // Directly use the HEX color string
  };

  // Function to determine if the background color is light or dark
  // Basic implementation: assumes HEX format #RRGGBB
  const isLightColor = (hexColor: string): boolean => {
    try {
      const hex = hexColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      // Simple luminance calculation (adjust threshold as needed)
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.6; // Consider colors with luminance > 0.6 as light
    } catch (e) {
      console.error("Error determining color brightness, defaulting to dark text:", e);
      return true; // Default to assuming light background (use dark text) on error
    }
  };

  // Determine text color based on background brightness
  const textColorClass = isLightColor(column.color) ? "text-foreground" : "text-white"; // Use white text on dark backgrounds
  const iconHoverBgClass = isLightColor(column.color) ? "hover:bg-foreground/10" : "hover:bg-white/10";


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
        className={cn("p-4 border-b border-border/50 flex justify-between items-center sticky top-0 rounded-t-lg z-10", textColorClass)} // Apply calculated text color
        style={headerStyle} // Apply header background color
      >
        <h2 className="text-lg font-semibold truncate pr-2">
          {column.title} ({tasks.length})
        </h2>
        <div className="flex items-center space-x-1">
           {/* Add Task Dialog Trigger */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className={cn("h-7 w-7", textColorClass, iconHoverBgClass)}>
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add Task</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <AddTaskForm columnId={column.id} onAddTask={handleAddTaskSubmit} onClose={handleAddDialogClose} />
            </DialogContent>
          </Dialog>

           {/* Column Options Dropdown */}
           <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}> {/* Edit Dialog Wrapper */}
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className={cn("h-7 w-7", textColorClass, iconHoverBgClass)}>
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Column Options</span>
                      </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* Edit Column Trigger */}
                        <DialogTrigger asChild>
                            <DropdownMenuItem className="cursor-pointer">
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Edit Column</span>
                            </DropdownMenuItem>
                        </DialogTrigger>
                         <DropdownMenuSeparator /> {/* Separator */}
                          {/* Delete Column Trigger (within Alert Dialog) */}
                          <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete Column</span>
                              </DropdownMenuItem>
                          </AlertDialogTrigger>
                      </DropdownMenuContent>
                  </DropdownMenu>
                   {/* Edit Column Dialog Content */}
                  <DialogContent className="sm:max-w-[425px]">
                      <EditColumnForm
                          column={column}
                          onEditColumn={onEditColumn}
                          onClose={handleEditDialogClose}
                      />
                  </DialogContent>
               </Dialog> {/* End Edit Dialog Wrapper */}

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
              isDragging={draggingTaskId === task.id}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
           {tasks.length === 0 && !isOver && (
             // Adjust muted text based on background
             <div className={cn("text-center p-4 italic", isLightColor(column.color) ? "text-muted-foreground/80" : "text-white/60")}>
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
