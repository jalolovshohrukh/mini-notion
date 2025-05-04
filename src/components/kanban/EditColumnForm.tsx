
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useScopedI18n } from '@/i18n/client'; // Import i18n hook

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription as FormDesc
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

// HEX color format validation
const hexColorRegex = /^#([0-9a-fA-F]{3}){1,2}$/;

// Define schema using translated error messages from addColumnForm scope
const getFormSchema = (t: ReturnType<typeof useScopedI18n>) => z.object({
  title: z.string()
    .min(1, { message: t('error.titleRequired') })
    .max(30, {message: t('error.titleMaxLength') }),
  color: z.string()
    .min(1, { message: t('error.colorRequired') })
    .regex(hexColorRegex, { message: t('error.colorHex') }),
});


type EditColumnFormProps = {
  column: Column;
  onEditColumn: (columnId: string, newTitle: string, newColor: string) => void;
  onClose: () => void;
};

export function EditColumnForm({ column, onEditColumn, onClose }: EditColumnFormProps) {
  const t = useScopedI18n('editColumnForm'); // Scope for edit form specific translations
  const tAddCol = useScopedI18n('addColumnForm'); // Scope for shared translations like labels/placeholders
  const formSchema = getFormSchema(tAddCol); // Use schema with shared error messages

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: column.title,
      color: column.color,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onEditColumn(column.id, values.title, values.color);
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
                {/* Use label/placeholder from addColumnForm scope */}
                <FormLabel>{tAddCol('columnTitleLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder={tAddCol('columnTitlePlaceholder')} {...field} />
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
                 {/* Use label/placeholder from addColumnForm scope */}
                <FormLabel>{tAddCol('colorLabel')}</FormLabel>
                <FormControl>
                   <div className="flex items-center gap-2">
                     <Input type="color" className="w-10 h-10 p-1" value={field.value} onChange={(e) => field.onChange(e.target.value)} />
                     <Input placeholder={tAddCol('colorPlaceholder')} {...field} className="flex-1" />
                   </div>
                </FormControl>
                 <FormDesc>{tAddCol('colorDescription')}</FormDesc>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <DialogClose asChild>
              {/* Use cancel button text from addColumnForm scope */}
              <Button type="button" variant="outline">
                {tAddCol('cancelButton')}
              </Button>
            </DialogClose>
             {/* Use save button text from editColumnForm scope */}
            <Button type="submit">{t('submitButton')}</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
