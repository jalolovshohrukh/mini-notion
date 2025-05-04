export const locales = ['en', 'ru', 'uz'] as const;
export const defaultLocale = 'en';

// Export the Locale type based on the locales array
export type Locale = typeof locales[number];
