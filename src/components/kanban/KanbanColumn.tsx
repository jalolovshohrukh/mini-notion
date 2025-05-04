
"use client";

import React, { useState } from "react";
import type { Column, Task, Priority } from "@/lib/types";
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
import { useScopedI18n } from '@/i18n/client'; // Import i18n hook
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip


interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  draggingTaskId: string | null;
  onDrop: (columnId: string, taskId: string) => void;
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
  const t = useScopedI18n('column'); // Scope translations

  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityA = priorityOrder[a.priority || "Medium"];
    const priorityB = priorityOrder[b.priority || "Medium"];
    return priorityA - priorityB;
  });


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
    if (taskId && draggingTaskId === taskId && tasks.find(t => t.id === taskId)) {
        return;
    }
     if (taskId) {
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
      className={cn(
          "flex flex-col w-72 flex-shrink-0 rounded-lg shadow-inner h-full transition-colors duration-200",
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
          {/* Translate column title if it's from initial data or allow user-input */}
          {column.title}
        </h2>
        <div className="flex items-center space-x-1">
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
      <ScrollArea className="flex-1 p-4 pt-0">
        <div className="min-h-[200px] pt-4">
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
           {tasks.length === 0 && !isOver && (
             <div className={cn("text-center p-4 italic", isLightColor(column.color) ? "text-muted-foreground/80" : "text-white/60")}>
               {t('emptyState')}
             </div>
           )}
           {isOver && (
             <div className="h-16 border-2 border-dashed border-primary/50 rounded-md bg-primary/10 flex items-center justify-center text-primary font-medium mt-2">
               {t('dropZone')}
             </div>
           )}
        </div>
      </ScrollArea>
    </div>
  );
}
