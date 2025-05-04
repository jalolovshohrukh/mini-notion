
"use client";

import React, { useState } from 'react';
import type { Task, Column, Priority } from "@/lib/types";
import { format, formatISO, parseISO } from 'date-fns'; // Import date-fns
import { Button } from "@/components/ui/button";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Import Avatar
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
} from "@/components/ui/popover"; // Import Popover
import { Calendar } from "@/components/ui/calendar"; // Import Calendar
import { Trash2, Sparkles, Calendar as CalendarIcon, GripVertical, Tag, User as UserIcon } from "lucide-react"; // Added UserIcon, renamed Calendar icon
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


interface TaskDetailSheetProps {
  task: Task;
  column: Column; // Receive column info
  onEditTask: (taskId: string, updatedTask: Omit<Task, "id" | "columnId">) => void;
  onDeleteTask: (taskId: string) => void;
  onClose: () => void;
}

// Priorities array for Select
const priorities: Priority[] = ["High", "Medium", "Low"];

// Updated mock user data
const mockUsers = [
  { id: "user-1", name: "Ilhom" },
  { id: "user-2", name: "Parvina" },
  { id: "user-3", name: "Madina" },
  { id: "user-4", name: "Lobar" },
  { id: "user-5", name: "Somon" },
];

// Use a non-empty string for the "unassigned" value
const UNASSIGNED_VALUE = "none";

// Helper function to get badge variant based on priority (copied from TaskCard)
const getPriorityBadgeVariant = (priority: Priority | undefined): VariantProps<typeof badgeVariants>["variant"] => {
    switch (priority) {
        case "High":
            return "destructive"; // Red for High
        case "Medium":
            return "warning"; // Yellow for Medium
        case "Low":
            return "default"; // Default (primary/teal) for Low
        default:
            return "secondary"; // Fallback (gray) if undefined
    }
};

// Helper function to get initials from name (copied from TaskCard)
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
    // Initialize with UNASSIGNED_VALUE if assigneeId is undefined/empty
    const [editedAssigneeId, setEditedAssigneeId] = useState<string>(task.assigneeId || UNASSIGNED_VALUE);
    // Parse dueDate string into Date object for the calendar, handle undefined
    const [editedDueDate, setEditedDueDate] = useState<Date | undefined>(
        task.dueDate ? parseISO(task.dueDate) : undefined
    );
    const [isDueDatePopoverOpen, setIsDueDatePopoverOpen] = useState(false); // State for due date popover
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);


    const handleSave = () => {
        const isAssigned = editedAssigneeId && editedAssigneeId !== UNASSIGNED_VALUE;
        const selectedUser = isAssigned ? mockUsers.find(user => user.id === editedAssigneeId) : undefined;
        onEditTask(task.id, {
            title: editedTitle,
            description: editedDescription || undefined,
            priority: editedPriority,
            assigneeId: isAssigned ? editedAssigneeId : undefined,
            assigneeName: selectedUser?.name || undefined,
            // Format editedDueDate back to ISO string if it exists
            dueDate: editedDueDate ? formatISO(editedDueDate, { representation: 'date' }) : undefined,
        });
        setIsEditing(false);
        // Optionally close the sheet after saving, or keep it open
        // onClose();
    };

    const handleCancelEdit = () => {
        // Reset fields to original task values
        setEditedTitle(task.title);
        setEditedDescription(task.description || "");
        setEditedPriority(task.priority || "Medium");
        setEditedAssigneeId(task.assigneeId || UNASSIGNED_VALUE); // Reset assignee
        // Reset due date by parsing the original string again
        setEditedDueDate(task.dueDate ? parseISO(task.dueDate) : undefined);
        setIsEditing(false);
    };

    const confirmDelete = () => {
        onDeleteTask(task.id);
        setIsDeleteDialogOpen(false); // Close delete dialog
        onClose(); // Close the sheet
    }

  return (
    <>
      <SheetHeader className="mb-6 pr-6"> {/* Add padding-right to avoid overlap with close button */}
          {isEditing ? (
             <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-2xl font-semibold border-0 shadow-none focus-visible:ring-0 px-0"
                aria-label="Task Title"
             />
          ) : (
            <SheetTitle className="text-2xl font-semibold">{task.title}</SheetTitle>
          )}
          {/* <SheetDescription>
             Detailed view of the task. Edit or delete as needed.
          </SheetDescription> */}
      </SheetHeader>

       <div className="space-y-6 px-1 pr-6"> {/* Add padding-right */}

          {/* Status Section */}
          <div className="flex items-center space-x-4">
            <Sparkles className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <Label htmlFor="status" className="w-24 text-sm font-medium text-muted-foreground flex-shrink-0">Status</Label>
            {/* Display column title as status */}
            <Badge variant="secondary" className="text-sm">{column.title}</Badge>
          </div>

          {/* Priority Section */}
          <div className="flex items-center space-x-4">
            <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <Label htmlFor="priority" className="w-24 text-sm font-medium text-muted-foreground flex-shrink-0">Priority</Label>
            {isEditing ? (
                 <Select onValueChange={(value: Priority) => setEditedPriority(value)} defaultValue={editedPriority}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                        {priorities.map((p) => (
                        <SelectItem key={p} value={p}>
                            {/* Display badge inside the select item for visual consistency */}
                             <Badge variant={getPriorityBadgeVariant(p)} className="mr-2 px-1 py-0.5 text-xs">{p}</Badge>

                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ) : (
                 <Badge variant={getPriorityBadgeVariant(task.priority)} className="text-sm">{task.priority || "Medium"}</Badge>
            )}
          </div>

          {/* Assignee Section */}
          <div className="flex items-center space-x-4">
              <UserIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <Label htmlFor="assignee" className="w-24 text-sm font-medium text-muted-foreground flex-shrink-0">Assignee</Label>
              {isEditing ? (
                  <Select onValueChange={(value: string) => setEditedAssigneeId(value)} defaultValue={editedAssigneeId}>
                      <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                          {/* Use a non-empty value for the unassigned option */}
                          <SelectItem value={UNASSIGNED_VALUE}>Unassigned</SelectItem>
                          {mockUsers.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                  {user.name}
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              ) : (
                  task.assigneeName ? (
                      <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                              {/* <AvatarImage src="/path/to/avatar.jpg" alt={task.assigneeName} /> */}
                              <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                                  {getInitials(task.assigneeName)}
                              </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{task.assigneeName}</span>
                      </div>
                  ) : (
                      <span className="text-sm text-muted-foreground">Unassigned</span>
                  )
              )}
          </div>

           {/* Due Date Section */}
            <div className="flex items-center space-x-4">
                <CalendarIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <Label htmlFor="dueDate" className="w-24 text-sm font-medium text-muted-foreground flex-shrink-0">Due Date</Label>
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
                                {editedDueDate ? format(editedDueDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={editedDueDate}
                                onSelect={(date) => {
                                    setEditedDueDate(date);
                                    setIsDueDatePopoverOpen(false); // Close popover on date select
                                }}
                                initialFocus
                            />
                              {/* Optional: Button to clear the date */}
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
                                Clear Date
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                ) : (
                    task.dueDate ? (
                        <span className="text-sm">{format(parseISO(task.dueDate), "PPP")}</span>
                    ) : (
                        <span className="text-sm text-muted-foreground">No due date</span>
                    )
                )}
            </div>


           <div className="flex items-center space-x-4 opacity-50">
                <Tag className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <Label className="w-24 text-sm font-medium text-muted-foreground flex-shrink-0">Tags</Label>
                 <span className="text-sm text-muted-foreground">Empty</span>
           </div>


          {/* Description Section */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-lg font-semibold">Description</Label>
             {isEditing ? (
                <Textarea
                    id="description"
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    placeholder="Add a description..."
                    className="min-h-[100px]"
                />
            ) : (
                <div className="text-sm text-foreground min-h-[50px] rounded-md border border-input bg-background p-3 whitespace-pre-wrap">
                     {task.description || <span className="text-muted-foreground italic">No description provided.</span>}
                </div>
            )}
          </div>
       </div>


      <SheetFooter className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pr-6"> {/* Add padding-right */}
           {/* Delete Button on the left */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                     <Button variant="destructive" size="sm" className="mr-auto">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Task
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the task
                        <span className="font-semibold"> "{task.title}"</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                        Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


            {/* Edit/Save/Cancel Buttons on the right */}
            <div className="flex gap-2">
                {isEditing ? (
                    <>
                         <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                         <Button onClick={handleSave}>Save Changes</Button>
                    </>
                ) : (
                     <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Task</Button>
                )}
                <SheetClose asChild>
                    <Button type="button" variant="secondary" onClick={onClose}>Close</Button>
                </SheetClose>
            </div>
      </SheetFooter>
    </>
  );
}
