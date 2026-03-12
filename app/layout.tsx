import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, VT323, Lexend } from "next/font/google";
import "./globals.css";
import { MainWindow } from "../components/window-layouts/MainWindow";
import { AuthInit } from "@/components/AuthInit";
import { SessionMonitor } from "@/components/reusables/SessionMonitor";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

import { OfflineSyncManager } from "@/components/reusables/OfflineSyncManager";
import { OfflineIndicator } from "@/components/reusables/OfflineIndicator";
import { SplashScreen } from "@/components/reusables/SplashScreen";

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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PUNCH POS",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
        <ThemeProvider>
          <AuthInit>
            <QueryProvider>
              <SplashScreen />
              <OfflineSyncManager />
              <OfflineIndicator />
              <MainWindow>{children}</MainWindow>
            </QueryProvider>
          </AuthInit>
        </ThemeProvider>
      </body>
    </html>
  );
}