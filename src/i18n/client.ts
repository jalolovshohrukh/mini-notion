'use client';

import { createI18nClient } from 'next-international/client';
import { locales, defaultLocale } from './index';

export const { useI18n, useScopedI18n, I18nProviderClient, useCurrentLocale, useChangeLocale } = createI18nClient({
  en: () => import('@/locales/en'),
  ru: () => import('@/locales/ru'),
  uz: () => import('@/locales/uz'),
});
