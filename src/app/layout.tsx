import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Use Inter for clear readability
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "TaskFlow Kanban",
  description: "Manage your tasks with a simple Kanban board.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.variable} font-sans antialiased h-full bg-background`}
      >
        {children}
        <Toaster /> {/* Add Toaster component */}
      </body>
    </html>
  );
}
