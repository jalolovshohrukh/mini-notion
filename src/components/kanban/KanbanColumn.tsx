"use client";

import React, { useState } from "react";
import type { Column, Task, Priority } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, MoreHorizontal, Pencil, GripVertical } from "lucide-react"; // Added GripVertical
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
import { useScopedI18n } from '@/i18n/client'; // Import i18n hook
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip


interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  draggingTaskId: string | null;
  draggingColumnId: string | null; // Added to track dragged column
  onTaskDrop: (columnId: string, taskId: string) => void;
  onColumnDrop: (draggedColumnId: string, targetColumnId: string) => void; // Handler for column drop
  onAddTask: (columnId: string, newTask: Omit<Task, "id" | "columnId">) => void;
  onEditTask: (taskId: string, updatedTask: Omit<Task, "id" | "columnId">) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onEditColumn: (columnId: string, newTitle: string, newColor: string) => void;
}

const priorityOrder: Record<Priority, number> = {
  High: 1,
  Medium: 2,
  Low: 3,
};

export function KanbanColumn({
  column,
  tasks,
  draggingTaskId,
  draggingColumnId, // Received prop
  onTaskDrop,
  onColumnDrop, // Received prop
  onAddTask,
  onEditTask,
  onDeleteTask,
  onDeleteColumn,
  onEditColumn,
}: KanbanColumnProps) {
  const [isOverTaskZone, setIsOverTaskZone] = useState(false); // For task drop zone
  const [isOverColumnZone, setIsOverColumnZone] = useState(false); // For column drop zone
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const t = useScopedI18n('column'); // Scope translations

  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityA = priorityOrder[a.priority || "Medium"];
    const priorityB = priorityOrder[b.priority || "Medium"];
    return priorityA - priorityB;
  });


  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggingTaskId) {
      setIsOverTaskZone(true);
      setIsOverColumnZone(false); // Don't show column drop zone when dragging task
    } else if (draggingColumnId && draggingColumnId !== column.id) {
      setIsOverColumnZone(true);
      setIsOverTaskZone(false); // Don't show task drop zone when dragging column
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only reset if leaving the main column div, not its children
    if (e.currentTarget === e.target) {
        setIsOverTaskZone(false);
        setIsOverColumnZone(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOverTaskZone(false);
    setIsOverColumnZone(false);

    const taskId = e.dataTransfer.getData("taskId");
    const draggedColId = e.dataTransfer.getData("columnId");

    if (taskId && draggingTaskId === taskId) { // Handle task drop
       // Prevent dropping task back into the same column if it's already there
        if (!tasks.find(t => t.id === taskId)) {
            onTaskDrop(column.id, taskId);
        }
    } else if (draggedColId && draggingColumnId === draggedColId && draggedColId !== column.id) { // Handle column drop
        onColumnDrop(draggedColId, column.id);
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
    // Add transition for smooth movement
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    // Add subtle lift effect when dragging the column itself
    transform: draggingColumnId === column.id ? 'scale(1.03)' : 'scale(1)',
    boxShadow: draggingColumnId === column.id ? '0 10px 20px rgba(0,0,0,0.2)' : 'none',
  };


  const headerStyle = {
    backgroundColor: column.color, // Use column color for header too
    cursor: draggingColumnId === column.id ? 'grabbing' : 'grab', // Indicate draggable header
  };

  const isLightColor = (hexColor: string): boolean => {
    try {
      const hex = hexColor.replace('#', '');
      const fullHex = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex;
      if (fullHex.length !== 6) return true;

      const r = parseInt(fullHex.substring(0, 2), 16);
      const g = parseInt(fullHex.substring(2, 4), 16);
      const b = parseInt(fullHex.substring(4, 6), 16);
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
      data-column-id={column.id} // Add data attribute for identification
      draggable={true} // Make the whole column draggable (conditionally handled by drag handle)
      className={cn(
          "flex flex-col w-72 flex-shrink-0 rounded-lg shadow-inner h-full relative", // Added relative for drop zone positioning
           // Visual feedback for being a potential column drop target
           isOverColumnZone ? "ring-2 ring-offset-2 ring-blue-500" : "",
           // Add opacity if another column is being dragged over this one
           draggingColumnId && draggingColumnId !== column.id && isOverColumnZone ? "opacity-50" : "opacity-100",
           // Make transparent if this is the column being dragged
           draggingColumnId === column.id ? 'opacity-75' : 'opacity-100'
        )}
      style={columnStyle}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
         {/* Column Drop Zone Indicator (shows when another column is dragged over) */}
         {isOverColumnZone && (
             <div className="absolute inset-0 border-4 border-dashed border-blue-500 rounded-lg pointer-events-none z-20 flex items-center justify-center bg-blue-100/50">
                <span className="text-blue-600 font-semibold">Move Here</span>
             </div>
         )}

        {/* Header with Drag Handle */}
        <div
            className={cn("p-4 border-b border-border/50 flex justify-between items-center sticky top-0 rounded-t-lg z-10", textColorClass)}
            style={headerStyle}
        >
             {/* Drag Handle */}
             <div className={cn("column-drag-handle cursor-grab mr-2", textColorClass, iconHoverBgClass, "p-1 rounded")} title="Drag to reorder column">
                <GripVertical className="h-5 w-5" />
             </div>

            <h2 className="text-lg font-semibold truncate pr-1 flex-grow">
              {column.title}
            </h2>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1 ml-1">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className={cn("h-7 w-7", textColorClass, iconHoverBgClass)}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                <AddTaskForm columnId={column.id} onAddTask={handleAddTaskSubmit} onClose={handleAddDialogClose} />
                                </DialogContent>
                            </Dialog>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{t('addTaskTooltip')}</p>
                        </TooltipContent>
                    </Tooltip>
                    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className={cn("h-7 w-7", textColorClass, iconHoverBgClass)}>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DialogTrigger asChild>
                                            <DropdownMenuItem className="cursor-pointer">
                                                <Pencil className="mr-2 h-4 w-4" />
                                                <span>{t('editOption')}</span>
                                            </DropdownMenuItem>
                                        </DialogTrigger>
                                        <DropdownMenuSeparator />
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>{t('deleteOption')}</span>
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('optionsTooltip')}</p>
                            </TooltipContent>
                        </Tooltip>

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
                                <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t('deleteConfirmDescription', { columnTitle: column.title })}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{t('deleteConfirmCancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmDeleteColumn} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    {t('deleteConfirmAction')}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                </AlertDialog>
                </TooltipProvider>
            </div>
        </div>

      {/* Task Area */}
      <ScrollArea className="flex-1 p-4 pt-0">
        <div
            className={cn(
                "min-h-[200px] pt-4 transition-colors duration-200",
                 // Visual feedback for being a potential task drop target
                isOverTaskZone && draggingTaskId ? "bg-primary/10 rounded-b-lg" : ""
            )}
        >
          {sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              column={column}
              isDragging={draggingTaskId === task.id}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
           {tasks.length === 0 && !isOverTaskZone && !isOverColumnZone && (
             <div className={cn("text-center p-4 italic", isLightColor(column.color) ? "text-muted-foreground/80" : "text-white/60")}>
               {t('emptyState')}
             </div>
           )}
            {/* Task Drop Zone Indicator */}
           {isOverTaskZone && draggingTaskId && (
             <div className="h-16 border-2 border-dashed border-primary/50 rounded-md bg-primary/10 flex items-center justify-center text-primary font-medium mt-2">
               {t('dropZone')}
             </div>
           )}
        </div>
      </ScrollArea>
    </div>
  );
}
