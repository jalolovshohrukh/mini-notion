
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

// Define Zod schema using translated error messages
const getFormSchema = (t: ReturnType<typeof useScopedI18n>) => z.object({
  title: z.string()
    .min(1, { message: t('error.titleRequired') })
    .max(30, {message: t('error.titleMaxLength') }),
  color: z.string()
    .min(1, { message: t('error.colorRequired') })
    .regex(hexColorRegex, { message: t('error.colorHex') }),
});


type AddColumnFormProps = {
  onAddColumn: (title: string, color: string) => void;
  onClose: () => void;
};

export function AddColumnForm({ onAddColumn, onClose }: AddColumnFormProps) {
  const t = useScopedI18n('addColumnForm'); // Scope translations
  const formSchema = getFormSchema(t); // Generate schema with translations

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      color: "#E5E5E5", // Default to a neutral HEX color (Light Gray)
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddColumn(values.title, values.color);
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
                <FormLabel>{t('columnTitleLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('columnTitlePlaceholder')} {...field} />
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
                <FormLabel>{t('colorLabel')}</FormLabel>
                <FormControl>
                   <div className="flex items-center gap-2">
                     <Input type="color" className="w-10 h-10 p-1" value={field.value} onChange={(e) => field.onChange(e.target.value)} />
                     <Input placeholder={t('colorPlaceholder')} {...field} className="flex-1" />
                   </div>
                </FormControl>
                 <FormDesc>{t('colorDescription')}</FormDesc>
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
