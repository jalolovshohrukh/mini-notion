
"use client";

import React, { useState } from "react";
import type { Task, Priority, Column } from "@/lib/types";
import { format, parseISO, isPast } from 'date-fns';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { TaskDetailSheet } from "./TaskDetailSheet";
import { CalendarIcon, User } from "lucide-react"; // Added User icon
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { useScopedI18n } from '@/i18n/client'; // Import i18n hook
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip


interface TaskCardProps {
  task: Task;
  column: Column;
  isDragging: boolean;
  onEditTask: (taskId: string, updatedTask: Omit<Task, "id" | "columnId">) => void;
  onDeleteTask: (taskId: string) => void;
}

// Keep badge variant logic as is
const getPriorityBadgeVariant = (priority: Priority | undefined): VariantProps<typeof badgeVariants>["variant"] => {
    switch (priority) {
        case "High": return "destructive";
        case "Medium": return "warning";
        case "Low": return "default";
        default: return "secondary";
    }
};

// Keep initials logic as is
const getInitials = (name?: string): string => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
};


export function TaskCard({ task, column, isDragging, onEditTask, onDeleteTask }: TaskCardProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const tPriority = useScopedI18n('taskCard.priority'); // Scope for priority translations
  const tAssignee = useScopedI18n('assignee'); // Scope for assignee name translations

  const dueDate = task.dueDate ? parseISO(task.dueDate) : null;
  const isDueDatePast = dueDate && isPast(dueDate) && !isDateToday(dueDate);


  function isDateToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

    // Get translated assignee name
   const getTranslatedAssigneeName = (originalName?: string) => {
    if (!originalName) return undefined;
    // Assuming assignee names are stored as 'Ilhom', 'Parvina', etc. and keys are 'assignee.Ilhom'
    try {
        // Try to translate using the original name as the key suffix
        return tAssignee(originalName as keyof typeof tAssignee.messages);
    } catch (e) {
        // If translation fails (e.g., name not in locales), return original name
        console.warn(`Assignee name "${originalName}" not found in translations.`);
        return originalName;
    }
  }


  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Card
          data-task-id={task.id} // Keep this for identifying the task during drag
          draggable={true} // Explicitly make the card draggable
          onDragStart={(e) => {
              // This event MUST set the data for the drag to be identified correctly
              e.dataTransfer.setData("taskId", task.id);
              e.dataTransfer.effectAllowed = "move";
              // console.log(`TaskCard Drag Start: ${task.id}`);
          }}
          className={cn(
            "mb-3 cursor-pointer transition-opacity duration-300 ease-in-out",
            "bg-card text-card-foreground",
            isDragging ? "opacity-50 shadow-lg scale-105" : "opacity-100 shadow-sm",
            "hover:shadow-md relative group"
          )}

        >
          <CardHeader className="p-3 space-y-2">
            <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-sm font-medium line-clamp-2">
                  {/* Translate task title if needed */}
                  {task.title}
                </CardTitle>
            </div>
            {task.description && (
              <CardDescription className="text-xs text-muted-foreground line-clamp-3">
                 {/* Translate task description if needed */}
                {task.description}
              </CardDescription>
            )}
             <div className="flex justify-between items-end pt-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Badge variant={getPriorityBadgeVariant(task.priority)} className="text-xs px-1.5 py-0.5">
                         {/* Translate priority */}
                        {tPriority((task.priority || "Medium") as keyof typeof tPriority.messages)}
                    </Badge>
                    {dueDate && (
                       <Badge
                           variant={isDueDatePast ? "destructive" : "outline"}
                           className={cn(
                               "text-xs px-1.5 py-0.5 font-normal",
                               isDueDatePast ? "text-destructive-foreground" : "text-muted-foreground"
                           )}
                       >
                           <CalendarIcon className="mr-1 h-3 w-3" />
                           {format(dueDate, "MMM d")}
                        </Badge>
                    )}
                </div>

                 {/* Assignee Display */}
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <div className={cn(
                                "flex items-center space-x-1 flex-shrink-0 ml-2",
                                task.assigneeName ? "opacity-100" : "opacity-50" // Dim if unassigned
                             )}>
                                <Avatar className="h-5 w-5">
                                     {task.assigneeName ? (
                                        <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                                            {getInitials(task.assigneeName)}
                                        </AvatarFallback>
                                    ) : (
                                        <AvatarFallback className="text-[10px] bg-muted text-muted-foreground border border-dashed">
                                            <User className="h-3 w-3" />
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                {/* Optional: Show name next to avatar if space allows */}
                                {/* <span className="text-xs text-muted-foreground truncate hidden sm:inline">{getTranslatedAssigneeName(task.assigneeName) || 'Unassigned'}</span> */}
                             </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{task.assigneeName ? getTranslatedAssigneeName(task.assigneeName) : tAssignee('unassigned' as keyof typeof tAssignee.messages, {defaultValue: 'Unassigned'})}</p>
                        </TooltipContent>
                    </Tooltip>
                 </TooltipProvider>
             </div>
          </CardHeader>
        </Card>
      </SheetTrigger>
       <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto">
          <TaskDetailSheet
            task={task}
            column={column}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onClose={() => setIsSheetOpen(false)}
          />
       </SheetContent>
    </Sheet>
  );
}
