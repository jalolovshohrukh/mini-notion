
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

  return (
    <div
      // Set fixed width for columns, responsive for different screen sizes
      className={`flex flex-col w-72 md:w-80 lg:w-96 flex-shrink-0 bg-secondary rounded-lg shadow-inner h-full transition-colors duration-200 ${
        isOver ? "bg-accent/20" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-4 border-b border-border flex justify-between items-center sticky top-0 bg-secondary rounded-t-lg z-10">
        <h2 className="text-lg font-semibold text-secondary-foreground truncate pr-2">
          {column.title} ({tasks.length})
        </h2>
        <div className="flex items-center space-x-1">
           {/* Add Task Dialog Trigger */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
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
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Column Options</span>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                {/* Alert Dialog Trigger for Delete */}
                <AlertDialogTrigger asChild>
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
              columnId={column.id}
              isDragging={draggingTaskId === task.id}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
           {tasks.length === 0 && !isOver && (
             <div className="text-center text-muted-foreground p-4 italic">
               No tasks yet.
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

