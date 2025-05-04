'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChangeLocale, useCurrentLocale, useI18n } from '@/i18n/client';
import type { Locale } from '@/i18n';
import { Label } from "@/components/ui/label";

// Mapping locales to their display names
const localeNames: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  uz: 'O‘zbekcha',
};

export function LanguageSwitcher() {
  const changeLocale = useChangeLocale();
  const currentLocale = useCurrentLocale();
  const t = useI18n();

  const handleLocaleChange = (newLocale: Locale) => {
    changeLocale(newLocale);
  };

  return (
    <div className="flex items-center space-x-2">
        <Label htmlFor="language-select" className="text-sm font-medium text-muted-foreground sr-only">
           {t('languageSwitcher.label')}
        </Label>
         <Select
            value={currentLocale}
            onValueChange={(value) => handleLocaleChange(value as Locale)}
         >
            <SelectTrigger id="language-select" className="w-[120px] h-9">
                <SelectValue placeholder={t('languageSwitcher.label')} />
            </SelectTrigger>
            <SelectContent>
                {(['en', 'ru', 'uz'] as Locale[]).map((locale) => (
                <SelectItem key={locale} value={locale}>
                    {localeNames[locale]}
                </SelectItem>
                ))}
            </SelectContent>
         </Select>
    </div>

  );
}
