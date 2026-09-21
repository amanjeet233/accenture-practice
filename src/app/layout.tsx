import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

import { AuthProvider } from "@/components/auth/AuthContext";

export const metadata: Metadata = {
  title: "CodeTrack — Professional Developer Preparation Platform",
  description:
    "Production coding preparation platform with verified company PYQs, progressive hint reveals, and native OpenJDK 21 execution.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark h-full ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-full flex flex-col bg-[#0D1117] text-[#F0F6FC] font-sans selection:bg-[#58A6FF]/20 selection:text-[#58A6FF]">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
