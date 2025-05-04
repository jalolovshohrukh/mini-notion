import { createI18nServer } from 'next-international/server';
import { locales, defaultLocale } from './index';

export const { getI18n, getScopedI18n, getStaticParams, getCurrentLocale } = createI18nServer({
  en: () => import('@/locales/en'),
  ru: () => import('@/locales/ru'),
  uz: () => import('@/locales/uz'),
});
