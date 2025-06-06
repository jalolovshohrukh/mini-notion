
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
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move"; // Indicate it's a move operation

    if (draggingTaskId) {
      setIsOverTaskZone(true);
      setIsOverColumnZone(false); // Don't show column drop zone when dragging task
    } else if (draggingColumnId && draggingColumnId !== column.id) {
      setIsOverColumnZone(true);
      setIsOverTaskZone(false); // Don't show task drop zone when dragging column
    } else {
      // If dragging something not recognized (or the column itself over itself)
      setIsOverTaskZone(false);
      setIsOverColumnZone(false);
      e.dataTransfer.dropEffect = "none"; // Indicate dropping is not allowed here
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Basic leave clears indicators
    setIsOverTaskZone(false);
    setIsOverColumnZone(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const draggedColId = e.dataTransfer.getData("columnId");

    // console.log("Drop Event:", { taskId, draggedColId, currentColumnId: column.id, draggingTaskId, draggingColumnId });

    // Check for task drop first
    if (taskId && draggingTaskId === taskId) {
        // console.log(`Dropping Task ${taskId} onto Column ${column.id}`);
        onTaskDrop(column.id, taskId);
    }
    // Then check for column drop
    else if (draggedColId && draggingColumnId === draggedColId && draggedColId !== column.id) {
        // console.log(`Dropping Column ${draggedColId} onto Column ${column.id}`);
        onColumnDrop(draggedColId, column.id);
    } else {
        // console.log("Drop ignored - Mismatched data or self-drop");
    }

    // Clear visual indicators regardless of drop success
    setIsOverTaskZone(false);
    setIsOverColumnZone(false);
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
    // Add transition for smooth movement and opacity
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, opacity 0.2s ease-in-out',
    // Add subtle lift effect when dragging the column itself
    transform: draggingColumnId === column.id ? 'scale(1.03)' : 'scale(1)',
    boxShadow: draggingColumnId === column.id ? '0 10px 20px rgba(0,0,0,0.2)' : '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', // Use default shadow otherwise
    opacity: draggingColumnId === column.id ? 0.85 : 1, // Make dragged column slightly transparent
    backgroundColor: 'hsl(var(--card))', // Use card background for the column itself
  };


  const headerStyle = {
    backgroundColor: column.color, // Use column color for header
    cursor: 'default', // Default cursor, handle provides grab cursor
  };

  const isLightColor = (hexColor: string): boolean => {
    try {
      const hex = hexColor.replace('#', '');
      const fullHex = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex;
      if (fullHex.length !== 6) return true; // Default to dark text if format is wrong

      const r = parseInt(fullHex.substring(0, 2), 16);
      const g = parseInt(fullHex.substring(2, 4), 16);
      const b = parseInt(fullHex.substring(4, 6), 16);
      // Luminance calculation (standard formula)
      const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      return luminance > 0.5; // Threshold might need adjustment
    } catch (e) {
      console.error("Error determining color brightness, defaulting to dark text:", e);
      return true; // Default to dark text on error
    }
  };


  const textColorClass = isLightColor(column.color) ? "text-foreground" : "text-white";
  const iconHoverBgClass = isLightColor(column.color) ? "hover:bg-black/10" : "hover:bg-white/20";


  return (
    <div
      data-column-id={column.id} // Add data attribute for identification
      draggable={true} // Make the whole column draggable, drag start logic is handled in KanbanBoard listener
      onDragStart={(e) => {
        // This is primarily handled in KanbanBoard's listener now.
        // We only need to ensure the drag doesn't start if NOT on the handle.
        const handle = (e.target as HTMLElement).closest('.column-drag-handle');
        if (!handle) {
            // Check if the target is a task card itself, allow drag if it is
            if (!(e.target as HTMLElement).closest('[data-task-id]')) {
                e.preventDefault(); // Prevent drag if not started on handle or task card
                return;
            }
        }
        // Data setting is done in the board's listener.
      }}
      className={cn(
          "flex flex-col w-72 flex-shrink-0 rounded-lg shadow h-full relative border border-border/50", // Added base shadow and border
           // Visual feedback for being a potential column drop target
           isOverColumnZone && draggingColumnId ? "ring-2 ring-offset-2 ring-primary" : "",
           // Add opacity if another column is being dragged over this one
           draggingColumnId && draggingColumnId !== column.id && isOverColumnZone ? "opacity-50" : "opacity-100"
        )}
      style={columnStyle}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
         {/* Column Drop Zone Indicator (shows when another column is dragged over) */}
         {isOverColumnZone && draggingColumnId && (
             <div className="absolute inset-0 border-4 border-dashed border-primary rounded-lg pointer-events-none z-20 flex items-center justify-center bg-primary/10">
                <span className="text-primary font-semibold">{t('dropZone')}</span>
             </div>
         )}

        {/* Header with Drag Handle */}
        <div
            className={cn("p-3 border-b border-border/50 flex justify-between items-center sticky top-0 rounded-t-lg z-10", textColorClass)}
            style={headerStyle}
        >
             {/* Drag Handle */}
             <TooltipProvider>
               <Tooltip>
                 <TooltipTrigger asChild>
                    {/* The div ITSELF is the handle */}
                    <div draggable={true} className={cn("column-drag-handle cursor-grab mr-2 rounded p-1", iconHoverBgClass)} title={t('dragHandleTooltip')}>
                        <GripVertical className="h-5 w-5 pointer-events-none" /> {/* Make icon non-interactive */}
                    </div>
                 </TooltipTrigger>
                 <TooltipContent>
                   <p>{t('dragHandleTooltip')}</p>
                 </TooltipContent>
               </Tooltip>
             </TooltipProvider>


            <h2 className="text-base font-semibold truncate pr-1 flex-grow">
              {column.title}
            </h2>

            {/* Action Buttons */}
            <div className="flex items-center space-x-0.5 ml-1">
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
      <ScrollArea className="flex-1 p-4 pt-0 bg-inherit rounded-b-lg"> {/* Use inherited background */}
        <div
            className={cn(
                "min-h-[200px] pt-4 transition-colors duration-200",
                 // Visual feedback for being a potential task drop target
                isOverTaskZone && draggingTaskId ? "bg-primary/10 rounded-lg" : "" // Apply to inner div
            )}
            // Removed drag handlers from here as they are on the parent column div
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
             <div className={cn("text-center p-4 italic text-muted-foreground/80")}>
               {t('emptyState')}
             </div>
           )}
            {/* Task Drop Zone Indicator */}
           {isOverTaskZone && draggingTaskId && (
             <div className="h-16 border-2 border-dashed border-primary/50 rounded-md bg-primary/10 flex items-center justify-center text-primary font-medium mt-2 pointer-events-none">
               {t('dropZone')}
             </div>
           )}
        </div>
      </ScrollArea>
    </div>
  );
}
