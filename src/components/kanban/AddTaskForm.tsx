
"use client";

import React, { useState } from "react"; // Import useState
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, formatISO } from "date-fns"; // Import date-fns functions
import { Calendar as CalendarIcon } from "lucide-react"; // Import Calendar icon

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { Task, Priority } from "@/lib/types";
import { cn } from "@/lib/utils"; // Import cn utility

const priorities: Priority[] = ["High", "Medium", "Low"];

// Updated mock user data
const mockUsers = [
  { id: "user-1", name: "Ilhom" },
  { id: "user-2", name: "Parvina" },
  { id: "user-3", name: "Madina" },
  { id: "user-4", name: "Lobar" },
  { id: "user-5", name: "Somon" },
];

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }).max(50),
  description: z.string().max(200).optional(),
  priority: z.enum(priorities).default("Medium"),
  assigneeId: z.string().optional(), // Add assigneeId field (optional)
  dueDate: z.date().optional(), // Add dueDate field (optional, using JS Date for picker)
});

type AddTaskFormProps = {
  columnId: string;
  onAddTask: (newTask: Omit<Task, "id" | "columnId">) => void;
  onClose: () => void;
};

// Use a non-empty string for the "unassigned" value
const UNASSIGNED_VALUE = "none";

export function AddTaskForm({ columnId, onAddTask, onClose }: AddTaskFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "Medium",
      assigneeId: UNASSIGNED_VALUE, // Default assignee to unassigned value
      dueDate: undefined, // Default due date to undefined
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const isAssigned = values.assigneeId && values.assigneeId !== UNASSIGNED_VALUE;
    const selectedUser = isAssigned ? mockUsers.find(user => user.id === values.assigneeId) : undefined;
    onAddTask({
      title: values.title,
      description: values.description || undefined,
      priority: values.priority,
      assigneeId: isAssigned ? values.assigneeId : undefined, // Pass assigneeId only if assigned
      assigneeName: selectedUser?.name || undefined, // Pass assigneeName only if assigned
      // Format dueDate to ISO string if it exists, otherwise pass undefined
      dueDate: values.dueDate ? formatISO(values.dueDate, { representation: 'date' }) : undefined,
    });
    form.reset();
    onClose(); // Close dialog on successful submit
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogDescription>
          Enter the details for your new task.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Task title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Task description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {/* Grid for Priority and Due Date */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Due Date Picker */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-2"> {/* Adjust alignment */}
                    <FormLabel className="mb-1">Due Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          // disabled={(date) => date < new Date("1900-01-01") } // Optional: disable past dates
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
           {/* Assignee Select Field */}
          <FormField
            control={form.control}
            name="assigneeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assignee (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || UNASSIGNED_VALUE}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                  </FormControl>
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
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Add Task</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
