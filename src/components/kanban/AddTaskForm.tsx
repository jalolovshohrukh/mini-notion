"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { Column, Task } from "@/lib/types";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }).max(50),
  description: z.string().max(200).optional(),
});

type AddTaskFormProps = {
  columnId: string;
  onAddTask: (newTask: Omit<Task, "id" | "columnId">) => void;
  onClose: () => void;
};

export function AddTaskForm({ columnId, onAddTask, onClose }: AddTaskFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddTask({
      title: values.title,
      description: values.description || undefined,
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
