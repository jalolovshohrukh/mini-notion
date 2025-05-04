import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css"; // Adjust path relative to [locale] folder
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { I18nProviderClient } from "@/i18n/client"; // Import client provider
import type { Locale } from "@/i18n"; // Import Locale type

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Note: Metadata generation is typically handled server-side
// and might require a different approach for localization.
// This example keeps the English metadata for simplicity.
export const metadata: Metadata = {
  title: "CITY PARK", // Keep English title or implement dynamic title
  description: "Manage your tasks with a simple Kanban board.",
};

export default function LocaleLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: Locale }; // Use the Locale type
}>) {
  return (
    // Wrap with I18nProviderClient and pass the locale
    <I18nProviderClient locale={locale}>
        <html lang={locale} className="h-full">
          <body
            className={`${inter.variable} font-sans antialiased h-full bg-background`}
          >
            <AuthProvider>
                {children}
                <Toaster />
            </AuthProvider>
          </body>
        </html>
    </I18nProviderClient>
  );
}
