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
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const formSchema = z.object({
  title: z.string().min(1, { message: "Column title is required." }).max(30, {message: "Title cannot exceed 30 characters."}),
});

type AddColumnFormProps = {
  onAddColumn: (title: string) => void;
  onClose: () => void;
};

export function AddColumnForm({ onAddColumn, onClose }: AddColumnFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddColumn(values.title);
    form.reset();
    onClose(); // Close dialog on successful submit
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add New Column</DialogTitle>
        <DialogDescription>
          Enter a title for the new Kanban column.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Column Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Under Review" {...field} />
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
            <Button type="submit">Add Column</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
