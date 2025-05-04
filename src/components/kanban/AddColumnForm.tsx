
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
  FormDescription as FormDesc // Renamed to avoid conflict
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// HEX color format validation (e.g., #RRGGBB or #RGB)
const hexColorRegex = /^#([0-9a-fA-F]{3}){1,2}$/;

const formSchema = z.object({
  title: z.string().min(1, { message: "Column title is required." }).max(30, {message: "Title cannot exceed 30 characters."}),
  color: z.string().min(1, { message: "Color is required." }).regex(hexColorRegex, { message: "Use HEX format: e.g., '#ffffff' or '#fff'"}),
});

type AddColumnFormProps = {
  onAddColumn: (title: string, color: string) => void;
  onClose: () => void;
};

export function AddColumnForm({ onAddColumn, onClose }: AddColumnFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      color: "#E5E5E5", // Default to a neutral HEX color (Light Gray)
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddColumn(values.title, values.color); // Pass color
    form.reset();
    onClose(); // Close dialog on successful submit
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add New Column</DialogTitle>
        <DialogDescription>
          Enter a title and choose a background color (HEX format) for the new Kanban column.
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
           <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Background Color (HEX)</FormLabel>
                <FormControl>
                   <div className="flex items-center gap-2">
                     <Input type="color" className="w-10 h-10 p-1" value={field.value} onChange={(e) => field.onChange(e.target.value)} />
                     <Input placeholder="#E5E5E5" {...field} className="flex-1" />
                   </div>
                </FormControl>
                 <FormDesc>
                    Enter color in HEX format (e.g., '#FF5733') or use the color picker.
                 </FormDesc>
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
