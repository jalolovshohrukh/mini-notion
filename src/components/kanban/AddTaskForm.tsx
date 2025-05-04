
"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format, formatISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useScopedI18n, useI18n } from '@/i18n/client'; // Import i18n hooks

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
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { Task, Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

const priorities: Priority[] = ["High", "Medium", "Low"];

// Updated mock user data - Consider how to handle user data localization if needed
const mockUsers = [
  { id: "user-1", name: "Ilhom" },
  { id: "user-2", name: "Parvina" },
  { id: "user-3", name: "Madina" },
  { id: "user-4", name: "Lobar" },
  { id: "user-5", name: "Somon" },
];

// Define schema using translated error messages
const getFormSchema = (t: ReturnType<typeof useScopedI18n>) => z.object({
  title: z.string().min(1, { message: t('error.titleRequired') }).max(50),
  description: z.string().max(200).optional(),
  priority: z.enum(priorities).default("Medium"),
  assigneeId: z.string().optional(),
  dueDate: z.date().optional(),
});


type AddTaskFormProps = {
  columnId: string;
  onAddTask: (newTask: Omit<Task, "id" | "columnId">) => void;
  onClose: () => void;
};

const UNASSIGNED_VALUE = "none";

export function AddTaskForm({ columnId, onAddTask, onClose }: AddTaskFormProps) {
  const t = useScopedI18n('addTaskForm'); // Scope translations
  const tPriority = useScopedI18n('priority'); // Scope for priority translations
  const tAssignee = useScopedI18n('assignee'); // Scope for assignee translations
  const formSchema = getFormSchema(t); // Get schema with translations

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "Medium",
      assigneeId: UNASSIGNED_VALUE,
      dueDate: undefined,
    },
  });

   // Get translated assignee name
   const getTranslatedAssigneeName = (id?: string) => {
    if (!id || id === UNASSIGNED_VALUE) return undefined;
    // Assuming assignee names are keys like 'assignee.Ilhom'
    const user = mockUsers.find(u => u.id === id);
    return user ? tAssignee(user.name as keyof typeof tAssignee.messages) : undefined;
  }


  function onSubmit(values: z.infer<typeof formSchema>) {
    const isAssigned = values.assigneeId && values.assigneeId !== UNASSIGNED_VALUE;
    // Get original name for data storage, translated name for display elsewhere if needed
    const originalAssigneeName = isAssigned ? mockUsers.find(user => user.id === values.assigneeId)?.name : undefined;
    onAddTask({
      title: values.title,
      description: values.description || undefined,
      priority: values.priority,
      assigneeId: isAssigned ? values.assigneeId : undefined,
      assigneeName: originalAssigneeName, // Store original name
      dueDate: values.dueDate ? formatISO(values.dueDate, { representation: 'date' }) : undefined,
    });
    form.reset();
    onClose();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('title')}</DialogTitle>
        <DialogDescription>{t('description')}</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('taskTitleLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('taskTitlePlaceholder')} {...field} />
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
                <FormLabel>{t('descriptionLabel')}</FormLabel>
                <FormControl>
                  <Textarea placeholder={t('descriptionPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('priorityLabel')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('priorityPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {/* Translate priority names */}
                            {tPriority(priority as keyof typeof tPriority.messages)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-2">
                    <FormLabel className="mb-1">{t('dueDateLabel')}</FormLabel>
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
                              <span>{t('dueDatePlaceholder')}</span>
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
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          <FormField
            control={form.control}
            name="assigneeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assigneeLabel')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || UNASSIGNED_VALUE}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('assigneePlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={UNASSIGNED_VALUE}>{t('unassigned')}</SelectItem>
                    {mockUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                         {/* Translate assignee names */}
                         {tAssignee(user.name as keyof typeof tAssignee.messages)}
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
                {t('cancelButton')}
              </Button>
            </DialogClose>
            <Button type="submit">{t('submitButton')}</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
