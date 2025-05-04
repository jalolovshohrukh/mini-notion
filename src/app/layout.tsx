// This file can be kept minimal or removed if not needed for root-level configuration.
// The main layout structure is now in src/app/[locale]/layout.tsx.

// You could potentially keep global providers here if they don't depend on locale,
// but for simplicity, everything is moved to the localized layout for now.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children; // Just pass children through
}
