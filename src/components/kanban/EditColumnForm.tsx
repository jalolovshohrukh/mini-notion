
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
import type { Column } from "@/lib/types";

// HEX color format validation (e.g., #RRGGBB or #RGB)
const hexColorRegex = /^#([0-9a-fA-F]{3}){1,2}$/;

const formSchema = z.object({
  title: z.string().min(1, { message: "Column title is required." }).max(30, {message: "Title cannot exceed 30 characters."}),
  color: z.string().min(1, { message: "Color is required." }).regex(hexColorRegex, { message: "Use HEX format: e.g., '#ffffff' or '#fff'"}),
});

type EditColumnFormProps = {
  column: Column;
  onEditColumn: (columnId: string, newTitle: string, newColor: string) => void;
  onClose: () => void;
};

export function EditColumnForm({ column, onEditColumn, onClose }: EditColumnFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: column.title,
      color: column.color,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onEditColumn(column.id, values.title, values.color);
    // form.reset() // Optionally reset if needed, but usually we just close
    onClose(); // Close dialog on successful submit
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Column</DialogTitle>
        <DialogDescription>
          Update the title and background color (HEX format) for this column.
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
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
