import { createI18nMiddleware } from 'next-international/middleware';
import { locales, defaultLocale } from '@/i18n';
import type { NextRequest } from 'next/server';

const I18nMiddleware = createI18nMiddleware({
  locales: locales,
  defaultLocale: defaultLocale,
  // Optionally, override the URL format for locales
  // urlMappingStrategy: 'rewrite', // Example: use rewrite instead of redirect
});

export function middleware(request: NextRequest) {
  return I18nMiddleware(request);
}

export const config = {
  // Skip all paths that should not be internationalized.
  // This skips the folders "api", "_next" and all files with an extension (e.g. favicon.ico)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
