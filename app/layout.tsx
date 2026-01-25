import type { Metadata } from "next";
import { Geist, Geist_Mono, VT323, Lexend } from "next/font/google";
import "./globals.css";
import MainWindow from "../components/window-layouts/MainWindow";
import { AuthInit } from "@/components/AuthInit";
import SessionMonitor from "@/components/reusables/SessionMonitor";
import QueryProvider from "@/components/providers/QueryProvider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const vt323 = VT323({
  weight: '400',
  variable: '--font-vt323',
  subsets: ['latin'],
  display: 'swap',
  preload: false,
});

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PUNCH POS by JunLink Software Services",
  description: "Next Gen Point of Sale by JunLink Software Services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${vt323.variable} ${lexend.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* ✅ ADD THE MONITOR HERE. It will run silently in the background. */}
        <SessionMonitor />

        <AuthInit>
          <QueryProvider>
            <MainWindow>{children}</MainWindow>
          </QueryProvider>
        </AuthInit>
      </body>
    </html>
  );
}