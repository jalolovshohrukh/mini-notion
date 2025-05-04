
"use client";

import React, { useState } from 'react';
import type { Task, Column, Priority } from "@/lib/types";
import { format, formatISO, parseISO } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Trash2, Sparkles, Calendar as CalendarIcon, GripVertical, Tag, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
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
import { useScopedI18n } from '@/i18n/client'; // Import i18n hook


interface TaskDetailSheetProps {
  task: Task;
  column: Column;
  onEditTask: (taskId: string, updatedTask: Omit<Task, "id" | "columnId">) => void;
  onDeleteTask: (taskId: string) => void;
  onClose: () => void;
}

const priorities: Priority[] = ["High", "Medium", "Low"];

// Mock user data - Consider how localization affects this if user data comes from backend
const mockUsers = [
  { id: "user-1", name: "Ilhom" },
  { id: "user-2", name: "Parvina" },
  { id: "user-3", name: "Madina" },
  { id: "user-4", name: "Lobar" },
  { id: "user-5", name: "Somon" },
];

const UNASSIGNED_VALUE = "none";

// Keep badge variant logic
const getPriorityBadgeVariant = (priority: Priority | undefined): VariantProps<typeof badgeVariants>["variant"] => {
     switch (priority) {
        case "High": return "destructive";
        case "Medium": return "warning";
        case "Low": return "default";
        default: return "secondary";
    }
};

// Keep initials logic
const getInitials = (name?: string): string => {
    if (!name) return "?";
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
};


export function TaskDetailSheet({ task, column, onEditTask, onDeleteTask, onClose }: TaskDetailSheetProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(task.title);
    const [editedDescription, setEditedDescription] = useState(task.description || "");
    const [editedPriority, setEditedPriority] = useState<Priority>(task.priority || "Medium");
    const [editedAssigneeId, setEditedAssigneeId] = useState<string>(task.assigneeId || UNASSIGNED_VALUE);
    const [editedDueDate, setEditedDueDate] = useState<Date | undefined>(
        task.dueDate ? parseISO(task.dueDate) : undefined
    );
    const [isDueDatePopoverOpen, setIsDueDatePopoverOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const t = useScopedI18n('taskDetail'); // Scope translations
    const tPriority = useScopedI18n('priority'); // Scope for priority translations
    const tAssignee = useScopedI18n('assignee'); // Scope for assignee translations
    const tAddTask = useScopedI18n('addTaskForm'); // Scope for shared add task form translations


    // Get translated assignee name
    const getTranslatedAssigneeName = (idOrOriginalName?: string) => {
      if (!idOrOriginalName || idOrOriginalName === UNASSIGNED_VALUE) return t('unassigned');
      // Find user by ID first
      const userById = mockUsers.find(u => u.id === idOrOriginalName);
      if (userById) {
        try {
           return tAssignee(userById.name as keyof typeof tAssignee.messages);
        } catch { return userById.name; /* Fallback to original if translation fails */ }
      }
      // If not found by ID, assume it's the original name and try to translate
      try {
          return tAssignee(idOrOriginalName as keyof typeof tAssignee.messages);
      } catch {
          return idOrOriginalName; // Fallback to the provided string
      }
    }


    const handleSave = () => {
        const isAssigned = editedAssigneeId && editedAssigneeId !== UNASSIGNED_VALUE;
        const originalAssigneeName = isAssigned ? mockUsers.find(user => user.id === editedAssigneeId)?.name : undefined;
        onEditTask(task.id, {
            title: editedTitle,
            description: editedDescription || undefined,
            priority: editedPriority,
            assigneeId: isAssigned ? editedAssigneeId : undefined,
            assigneeName: originalAssigneeName, // Save original name
            dueDate: editedDueDate ? formatISO(editedDueDate, { representation: 'date' }) : undefined,
        });
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditedTitle(task.title);
        setEditedDescription(task.description || "");
        setEditedPriority(task.priority || "Medium");
        setEditedAssigneeId(task.assigneeId || UNASSIGNED_VALUE);
        setEditedDueDate(task.dueDate ? parseISO(task.dueDate) : undefined);
        setIsEditing(false);
    };

    const confirmDelete = () => {
        onDeleteTask(task.id);
        setIsDeleteDialogOpen(false);
        onClose();
    }

  return (
    <>
      <SheetHeader className="mb-6 pr-6">
          {isEditing ? (
             <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-2xl font-semibold border-0 shadow-none focus-visible:ring-0 px-0"
                aria-label={t('editTitleLabel')}
             />
          ) : (
             // Translate task title if needed
            <SheetTitle className="text-2xl font-semibold">{task.title}</SheetTitle>
          )}
      </SheetHeader>

       <div className="space-y-6 px-1 pr-6">

          {/* Status Section */}
          <div className="flex items-center space-x-4">
            <Sparkles className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <Label htmlFor="status" className="w-24 text-sm font-medium text-muted-foreground flex-shrink-0">{t('statusLabel')}</Label>
             {/* Translate column title if needed */}
            <Badge variant="secondary" className="text-sm">{column.title}</Badge>
          </div>

          {/* Priority Section */}
          <div className="flex items-center space-x-4">
            <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <Label htmlFor="priority" className="w-24 text-sm font-medium text-muted-foreground flex-shrink-0">{t('priorityLabel')}</Label>
            {isEditing ? (
                 <Select onValueChange={(value: Priority) => setEditedPriority(value)} defaultValue={editedPriority}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={tAddTask('priorityPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                        {priorities.map((p) => (
                        <SelectItem key={p} value={p}>
                             <Badge variant={getPriorityBadgeVariant(p)} className="mr-2 px-1 py-0.5 text-xs">
                                {/* Translate priority in select */}
                                {tPriority(p as keyof typeof tPriority.messages)}
                             </Badge>
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ) : (
                 <Badge variant={getPriorityBadgeVariant(task.priority)} className="text-sm">
                      {/* Translate priority display */}
                      {tPriority((task.priority || "Medium") as keyof typeof tPriority.messages)}
                 </Badge>
            )}
          </div>

          {/* Assignee Section */}
          <div className="flex items-center space-x-4">
              <UserIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <Label htmlFor="assignee" className="w-24 text-sm font-medium text-muted-foreground flex-shrink-0">{t('assigneeLabel')}</Label>
              {isEditing ? (
                  <Select onValueChange={(value: string) => setEditedAssigneeId(value)} defaultValue={editedAssigneeId}>
                      <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder={tAddTask('assigneePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value={UNASSIGNED_VALUE}>{t('unassigned')}</SelectItem>
                          {mockUsers.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                 {/* Translate assignee name in select */}
                                 {getTranslatedAssigneeName(user.id)}
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              ) : (
                  task.assigneeName ? (
                      <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                                  {getInitials(task.assigneeName)}
                              </AvatarFallback>
                          </Avatar>
                          {/* Display translated assignee name */}
                          <span className="text-sm">{getTranslatedAssigneeName(task.assigneeName)}</span>
                      </div>
                  ) : (
                      <span className="text-sm text-muted-foreground">{t('unassigned')}</span>
                  )
              )}
          </div>

           {/* Due Date Section */}
            <div className="flex items-center space-x-4">
                <CalendarIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <Label htmlFor="dueDate" className="w-24 text-sm font-medium text-muted-foreground flex-shrink-0">{t('dueDateLabel')}</Label>
                {isEditing ? (
                     <Popover open={isDueDatePopoverOpen} onOpenChange={setIsDueDatePopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                "w-[180px] justify-start text-left font-normal",
                                !editedDueDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {editedDueDate ? format(editedDueDate, "PPP") : <span>{t('pickDate')}</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={editedDueDate}
                                onSelect={(date) => {
                                    setEditedDueDate(date);
                                    setIsDueDatePopoverOpen(false);
                                }}
                                initialFocus
                            />
                             <div className="p-2 border-t border-border">
                                <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-center"
                                onClick={() => {
                                    setEditedDueDate(undefined);
                                    setIsDueDatePopoverOpen(false);
                                }}
                                >
                                {t('clearDate')}
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                ) : (
                    task.dueDate ? (
                        <span className="text-sm">{format(parseISO(task.dueDate), "PPP")}</span>
                    ) : (
                        <span className="text-sm text-muted-foreground">{t('noDueDate')}</span>
                    )
                )}
            </div>


           <div className="flex items-center space-x-4 opacity-50">
                <Tag className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <Label className="w-24 text-sm font-medium text-muted-foreground flex-shrink-0">{t('tagsLabel')}</Label>
                 <span className="text-sm text-muted-foreground">{t('tagsPlaceholder')}</span>
           </div>


          {/* Description Section */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-lg font-semibold">{t('descriptionLabel')}</Label>
             {isEditing ? (
                <Textarea
                    id="description"
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    placeholder={t('descriptionPlaceholder')}
                    className="min-h-[100px]"
                />
            ) : (
                <div className="text-sm text-foreground min-h-[50px] rounded-md border border-input bg-background p-3 whitespace-pre-wrap">
                     {/* Translate description if needed */}
                     {task.description || <span className="text-muted-foreground italic">{t('noDescription')}</span>}
                </div>
            )}
          </div>
       </div>


      <SheetFooter className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pr-6">
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                     <Button variant="destructive" size="sm" className="mr-auto">
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('deleteButton')}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('deleteConfirmDescription', { taskTitle: task.title })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('deleteConfirmCancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                          {t('deleteConfirmAction')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


            <div className="flex gap-2">
                {isEditing ? (
                    <>
                         <Button variant="outline" onClick={handleCancelEdit}>{t('cancelButton')}</Button>
                         <Button onClick={handleSave}>{t('saveButton')}</Button>
                    </>
                ) : (
                     <Button variant="outline" onClick={() => setIsEditing(true)}>{t('editButton')}</Button>
                )}
                <SheetClose asChild>
                    <Button type="button" variant="secondary" onClick={onClose}>{t('closeButton')}</Button>
                </SheetClose>
            </div>
      </SheetFooter>
    </>
  );
}
