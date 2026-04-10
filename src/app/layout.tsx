import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { DemoAuthProvider } from "@/contexts/DemoAuthContext";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pensum | Research Tracker",
  description: "Track and manage research on problems faced by companies in real-time",
  keywords: ["Research Tracker", "Company Problems", "Business Research", "Real-time Updates"],
  authors: [{ name: "Research Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground font-sans h-100vh`}
      >
        <DemoAuthProvider>
          {children}
          <Toaster />
        </DemoAuthProvider>
      </body>
    </html>
  );
}
