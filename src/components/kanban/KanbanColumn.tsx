
"use client";

import React, { useState } from "react";
import type { Column, Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, MoreHorizontal, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AddTaskForm } from "./AddTaskForm";
import { EditColumnForm } from "./EditColumnForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { cn } from "@/lib/utils";


interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  draggingTaskId: string | null;
  onDrop: (columnId: string, taskId: string) => void;
  onAddTask: (columnId: string, newTask: Omit<Task, "id" | "columnId">) => void; // No change needed here
  onEditTask: (taskId: string, updatedTask: Omit<Task, "id" | "columnId">) => void; // No change needed here
  onDeleteTask: (taskId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onEditColumn: (columnId: string, newTitle: string, newColor: string) => void;
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
  onEditColumn,
}: KanbanColumnProps) {
  const [isOver, setIsOver] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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
    if (taskId && taskId !== draggingTaskId) { // Prevent dropping on self in the same column visually, though logic handles it
       onDrop(column.id, taskId);
    }
  };

  const handleAddTaskSubmit = (newTask: Omit<Task, "id" | "columnId">) => {
    onAddTask(column.id, newTask);
  };

  const handleAddDialogClose = () => setIsAddDialogOpen(false);
  const handleEditDialogClose = () => setIsEditDialogOpen(false);

  const confirmDeleteColumn = () => {
     onDeleteColumn(column.id);
     setIsDeleteDialogOpen(false);
  }

  const columnStyle = {
    backgroundColor: column.color,
  };

  const headerStyle = {
    backgroundColor: column.color,
  };

  const isLightColor = (hexColor: string): boolean => {
    try {
      const hex = hexColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.6;
    } catch (e) {
      console.error("Error determining color brightness, defaulting to dark text:", e);
      return true;
    }
  };

  const textColorClass = isLightColor(column.color) ? "text-foreground" : "text-white";
  const iconHoverBgClass = isLightColor(column.color) ? "hover:bg-foreground/10" : "hover:bg-white/10";


  return (
    <div
      className={cn(
          "flex flex-col w-72 flex-shrink-0 rounded-lg shadow-inner h-full transition-colors duration-200",
           // Enhanced drop indication: brighter ring and subtle background change
          isOver ? "ring-2 ring-primary ring-offset-2 bg-primary/5" : ""
        )}
      style={columnStyle}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={cn("p-4 border-b border-border/50 flex justify-between items-center sticky top-0 rounded-t-lg z-10", textColorClass)}
        style={headerStyle}
      >
        <h2 className="text-lg font-semibold truncate pr-2">
          {column.title} ({tasks.length})
        </h2>
        <div className="flex items-center space-x-1">
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

           <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className={cn("h-7 w-7", textColorClass, iconHoverBgClass)}>
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Column Options</span>
                      </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DialogTrigger asChild>
                            <DropdownMenuItem className="cursor-pointer">
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Edit Column</span>
                            </DropdownMenuItem>
                        </DialogTrigger>
                         <DropdownMenuSeparator />
                          <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete Column</span>
                              </DropdownMenuItem>
                          </AlertDialogTrigger>
                      </DropdownMenuContent>
                  </DropdownMenu>
                  <DialogContent className="sm:max-w-[425px]">
                      <EditColumnForm
                          column={column}
                          onEditColumn={onEditColumn}
                          onClose={handleEditDialogClose}
                      />
                  </DialogContent>
               </Dialog>

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
      <ScrollArea className="flex-1 p-4 pt-0"> {/* Removed top padding */}
        {/* Add padding top to this inner div to compensate */}
        <div className="min-h-[200px] pt-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isDragging={draggingTaskId === task.id}
              onEditTask={onEditTask} // Prop signature is correct
              onDeleteTask={onDeleteTask}
            />
          ))}
           {tasks.length === 0 && !isOver && (
             <div className={cn("text-center p-4 italic", isLightColor(column.color) ? "text-muted-foreground/80" : "text-white/60")}>
               Drag tasks here or click '+' to add.
             </div>
           )}
           {/* Visual cue for dropping */}
           {isOver && (
             <div className="h-16 border-2 border-dashed border-primary/50 rounded-md bg-primary/10 flex items-center justify-center text-primary font-medium mt-2">
               Drop here
             </div>
           )}
        </div>
      </ScrollArea>
    </div>
  );
}
