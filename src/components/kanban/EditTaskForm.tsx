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
import type { Task } from "@/lib/types";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }).max(50),
  description: z.string().max(200).optional(),
});

type EditTaskFormProps = {
  task: Task;
  onEditTask: (taskId: string, updatedTask: Omit<Task, "id" | "columnId">) => void;
  onDeleteTask: (taskId: string) => void;
  onClose: () => void;
};

export function EditTaskForm({ task, onEditTask, onDeleteTask, onClose }: EditTaskFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task.title,
      description: task.description || "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onEditTask(task.id, {
      title: values.title,
      description: values.description || undefined,
    });
    onClose(); // Close dialog on successful submit
  }

  function handleDelete() {
    onDeleteTask(task.id);
    onClose();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogDescription>
          Update the details for your task or delete it.
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
          <DialogFooter className="justify-between">
             <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="mr-auto" // Push delete button to the left
            >
              Delete Task
            </Button>
            <div className="flex gap-2">
                 <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Save Changes</Button>
            </div>

          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
