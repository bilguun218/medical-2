import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap"
});

export const metadata: Metadata = {
  applicationName: "NOVYTAS",
  generator: "Next.js"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen font-sans antialiased`}>{children}</body>
    </html>
  );
}
